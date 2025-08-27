import { Task } from "../models/task.models.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

const createTask = asyncHandler(async (req, res) => {
  const { title, description, projectId, assigneeId, priority, dueDate } =
    req.body;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this project");
  }

  // If assignee is provided, validate they're a project member
  if (assigneeId && !project.isMember(assigneeId)) {
    throw new ApiError(400, "Assignee must be a project member");
  }

  // Handle file uploads
  const attachments =
    req.files?.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      localPath: file.path,
      uploadedBy: req.user._id,
    })) || [];

  const task = await Task.create({
    title,
    description,
    project: projectId,
    assignee: assigneeId,
    priority,
    dueDate,
    attachments,
    createdBy: req.user._id,
  });

  const populatedTask = await Task.findById(task._id)
    .populate("assignee", "username email")
    .populate("createdBy", "username email");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedTask, "Task created successfully"));
});

const getProjectTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, assignee } = req.query;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this project");
  }

  // Build query
  const query = {
    project: projectId,
    isArchived: false,
  };

  if (status) query.status = status.toUpperCase();
  if (assignee) query.assignee = assignee;

  const tasks = await Task.find(query)
    .populate("assignee", "username email")
    .populate("createdBy", "username email")
    .sort("-createdAt");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks retrieved successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId)
    .populate("assignee", "username email")
    .populate("createdBy", "username email")
    .populate("subtasks.completedBy", "username email")
    .populate("subtasks.createdBy", "username email");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access
  const project = await Project.findById(task.project);
  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this task");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task details retrieved successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const updateData = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access
  const project = await Project.findById(task.project);
  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this task");
  }

  // If updating assignee, validate they're a project member
  if (updateData.assigneeId && !project.isMember(updateData.assigneeId)) {
    throw new ApiError(400, "Assignee must be a project member");
  }

  // Handle new file attachments
  if (req.files?.length) {
    const newAttachments = req.files.map((file) => ({
      name: file.originalname,
      url: `/uploads/${file.filename}`,
      localPath: file.path,
      uploadedBy: req.user._id,
    }));
    task.attachments.push(...newAttachments);
  }

  // Update allowed fields
  const allowedUpdates = [
    "title",
    "description",
    "status",
    "priority",
    "dueDate",
  ];
  allowedUpdates.forEach((field) => {
    if (updateData[field] !== undefined) {
      task[field] = updateData[field];
    }
  });

  if (updateData.assigneeId !== undefined) {
    task.assignee = updateData.assigneeId || null;
  }

  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate("assignee", "username email")
    .populate("createdBy", "username email")
    .populate("subtasks.completedBy", "username email")
    .populate("subtasks.createdBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access and role
  const project = await Project.findById(task.project);
  if (!project.hasRole(req.user._id, "PROJECT_ADMIN")) {
    throw new ApiError(403, "Only project admin can delete tasks");
  }

  // Soft delete
  task.isArchived = true;
  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});

const removeAttachment = asyncHandler(async (req, res) => {
  const { taskId, attachmentId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access
  const project = await Project.findById(task.project);
  if (!project.hasRole(req.user._id, "PROJECT_ADMIN")) {
    throw new ApiError(403, "Only project admin can remove attachments");
  }

  task.attachments = task.attachments.filter(
    (attachment) => attachment._id.toString() !== attachmentId,
  );

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Attachment removed successfully"));
});

// Subtask management
const addSubtask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description } = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access
  const project = await Project.findById(task.project);
  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this task");
  }

  task.subtasks.push({
    title,
    description,
    createdBy: req.user._id,
  });

  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate("assignee", "username email")
    .populate("createdBy", "username email")
    .populate("subtasks.completedBy", "username email")
    .populate("subtasks.createdBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Subtask added successfully"));
});

const updateSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;
  const updateData = req.body;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access
  const project = await Project.findById(task.project);
  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this task");
  }

  const subtask = task.subtasks.id(subtaskId);
  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }

  // Handle completion status
  if (updateData.isCompleted !== undefined) {
    subtask.isCompleted = updateData.isCompleted;
    if (updateData.isCompleted) {
      subtask.completedBy = req.user._id;
      subtask.completedAt = new Date();
    } else {
      subtask.completedBy = null;
      subtask.completedAt = null;
    }
  }

  // Update other fields if user has proper role
  if (project.hasRole(req.user._id, "PROJECT_ADMIN")) {
    if (updateData.title) subtask.title = updateData.title;
    if (updateData.description) subtask.description = updateData.description;
  }

  await task.save();

  const updatedTask = await Task.findById(taskId)
    .populate("assignee", "username email")
    .populate("createdBy", "username email")
    .populate("subtasks.completedBy", "username email")
    .populate("subtasks.createdBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Subtask updated successfully"));
});

const deleteSubtask = asyncHandler(async (req, res) => {
  const { taskId, subtaskId } = req.params;

  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Validate project access and role
  const project = await Project.findById(task.project);
  if (!project.hasRole(req.user._id, "PROJECT_ADMIN")) {
    throw new ApiError(403, "Only project admin can delete subtasks");
  }

  task.subtasks = task.subtasks.filter(
    (subtask) => subtask._id.toString() !== subtaskId,
  );

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Subtask deleted successfully"));
});

export {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  removeAttachment,
  addSubtask,
  updateSubtask,
  deleteSubtask,
};
