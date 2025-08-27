import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

// Middleware to check if user has the required role in a project
export const requireProjectRole = (requiredRole) => {
  return asyncHandler(async (req, res, next) => {
    const projectId = req.params.projectId || req.body.projectId;

    if (!projectId) {
      throw new ApiError(400, "Project ID is required");
    }

    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    if (!project.hasRole(req.user._id, requiredRole)) {
      throw new ApiError(
        403,
        `You need ${requiredRole} role to perform this action`,
      );
    }

    // Add project to request for potential reuse
    req.project = project;
    next();
  });
};

// Middleware to check if user is a project member
export const requireProjectMember = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (!project.isMember(req.user._id)) {
    throw new ApiError(403, "You don't have access to this project");
  }

  // Add project to request for potential reuse
  req.project = project;
  next();
});
