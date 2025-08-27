import { Router } from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  updateMemberRole,
} from "../controllers/project.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  requireProjectRole,
  requireProjectMember,
} from "../middlewares/project.middleware.js";
import { validateResource } from "../middlewares/validator.middleware.js";
import {
  createProjectSchema,
  updateProjectSchema,
  addMemberSchema,
  updateMemberRoleSchema,
} from "../validators/project.validator.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

// Project CRUD routes
router
  .route("/")
  .get(getAllProjects)
  .post(validateResource(createProjectSchema), createProject);

router
  .route("/:projectId")
  .get(requireProjectMember, getProjectById)
  .put(
    requireProjectRole("ADMIN"),
    validateResource(updateProjectSchema),
    updateProject,
  )
  .delete(requireProjectRole("ADMIN"), deleteProject);

// Member management routes
router
  .route("/:projectId/members")
  .post(
    requireProjectRole("ADMIN"),
    validateResource(addMemberSchema),
    addProjectMember,
  );

router
  .route("/:projectId/members/:memberId")
  .delete(requireProjectRole("ADMIN"), removeProjectMember)
  .patch(
    requireProjectRole("ADMIN"),
    validateResource(updateMemberRoleSchema),
    updateMemberRole,
  );

export default router;
