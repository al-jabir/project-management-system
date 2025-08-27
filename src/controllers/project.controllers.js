import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validate required fields
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }

  // Create project with current user as owner and admin
  const project = await Project.create({
    name,
    description,
    owner: req.user._id,
    members: [
      {
        user: req.user._id,
        role: "ADMIN",
        addedBy: req.user._id,
      },
    ],
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    "members.user": req.user._id,
    isArchived: false,
  })
    .populate("owner", "username email")
    .populate("members.user", "username email")
    .sort("-createdAt");

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects retrieved successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate("owner", "username email")
    .populate("members.user", "username email");

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this project");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, project, "Project details retrieved successfully"),
    );
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can update project details");
  }

  if (name) project.name = name;
  if (description) project.description = description;

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can delete the project");
  }

  // Soft delete by archiving
  project.isArchived = true;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

const addProjectMember = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role = "MEMBER" } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can add members");
  }

  // Find user by email
  const userToAdd = await User.findOne({ email });
  if (!userToAdd) {
    throw new ApiError(404, "User not found");
  }

  // Check if user is already a member
  if (project.isMember(userToAdd._id)) {
    throw new ApiError(400, "User is already a member of this project");
  }

  // Add member
  project.members.push({
    user: userToAdd._id,
    role,
    addedBy: req.user._id,
  });

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Member added successfully"));
});

const removeProjectMember = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can remove members");
  }

  // Remove member
  project.members = project.members.filter(
    (member) => member.user.toString() !== memberId,
  );

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Member removed successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, memberId } = req.params;
  const { role } = req.body;

  if (!["ADMIN", "PROJECT_ADMIN", "MEMBER"].includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can update member roles");
  }

  // Update member role
  const memberIndex = project.members.findIndex(
    (member) => member.user.toString() === memberId,
  );

  if (memberIndex === -1) {
    throw new ApiError(404, "Member not found");
  }

  project.members[memberIndex].role = role;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Member role updated successfully"));
});

export {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
};
