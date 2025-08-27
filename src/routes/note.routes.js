import { Router } from "express";
import {
  createNote,
  getProjectNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from "../controllers/note.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validateResource } from "../middlewares/validator.middleware.js";
import {
  createNoteSchema,
  updateNoteSchema,
} from "../validators/note.validator.js";

const router = Router();

// All routes are protected
router.use(verifyJWT);

// Note CRUD routes
router.route("/").post(validateResource(createNoteSchema), createNote);

router.get("/project/:projectId", getProjectNotes);

router
  .route("/:noteId")
  .get(getNoteById)
  .put(validateResource(updateNoteSchema), updateNote)
  .delete(deleteNote);

export default router;
