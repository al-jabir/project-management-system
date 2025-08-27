import { Router } from "express";
import {
  createTask,
  getProjectTasks,
  getTaskById,
  updateTask,
  deleteTask,
  removeAttachment,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from "../controllers/task.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validator.middleware.js";
import { upload } from "../utils/upload.js";
import {
  createTaskSchema,
  updateTaskSchema,
  createSubtaskSchema,
  updateSubtaskSchema,
} from "../validators/task.validator.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

// Task CRUD routes
router.post(
  "/",
  upload.array("attachments", 5), // Allow up to 5 attachments
  validateResource(createTaskSchema),
  createTask,
);

router.get("/project/:projectId", getProjectTasks);

router
  .route("/:taskId")
  .get(getTaskById)
  .put(
    upload.array("attachments", 5),
    validateResource(updateTaskSchema),
    updateTask,
  )
  .delete(deleteTask);

// Attachment routes
router.delete("/:taskId/attachments/:attachmentId", removeAttachment);

// Subtask routes
router
  .route("/:taskId/subtasks")
  .post(validateResource(createSubtaskSchema), addSubtask);

router
  .route("/:taskId/subtasks/:subtaskId")
  .patch(validateResource(updateSubtaskSchema), updateSubtask)
  .delete(deleteSubtask);

export default router;
