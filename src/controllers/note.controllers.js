import { Note } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

const createNote = asyncHandler(async (req, res) => {
  const { title, content, projectId } = req.body;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Only admin can create notes
  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can create notes");
  }

  const note = await Note.create({
    title,
    content,
    project: projectId,
    createdBy: req.user._id,
    lastUpdatedBy: req.user._id,
  });

  const populatedNote = await Note.findById(note._id)
    .populate("createdBy", "username email")
    .populate("lastUpdatedBy", "username email");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedNote, "Note created successfully"));
});

const getProjectNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project access
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this project");
  }

  const notes = await Note.find({
    project: projectId,
    isArchived: false,
  })
    .populate("createdBy", "username email")
    .populate("lastUpdatedBy", "username email")
    .sort("-updatedAt");

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes retrieved successfully"));
});

const getNoteById = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findById(noteId)
    .populate("createdBy", "username email")
    .populate("lastUpdatedBy", "username email");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // Validate project access
  const project = await Project.findById(note.project);
  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this note");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note details retrieved successfully"));
});

const updateNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;
  const { title, content } = req.body;

  const note = await Note.findById(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // Validate project access and role
  const project = await Project.findById(note.project);
  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can update notes");
  }

  if (title) note.title = title;
  if (content) note.content = content;
  note.lastUpdatedBy = req.user._id;

  await note.save();

  const updatedNote = await Note.findById(noteId)
    .populate("createdBy", "username email")
    .populate("lastUpdatedBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
});

const deleteNote = asyncHandler(async (req, res) => {
  const { noteId } = req.params;

  const note = await Note.findById(noteId);
  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // Validate project access and role
  const project = await Project.findById(note.project);
  if (!project.hasRole(req.user._id, "ADMIN")) {
    throw new ApiError(403, "Only project admin can delete notes");
  }

  // Soft delete
  note.isArchived = true;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});

export { createNote, getProjectNotes, getNoteById, updateNote, deleteNote };
