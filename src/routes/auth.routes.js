import { Router } from "express";
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  login,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/auth.controllers.js";
import { validateResource } from "../middlewares/validator.middleware.js";
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Unsecured routes
router.route("/register").post(validateResource(registerSchema), registerUser);

router.route("/login").post(validateResource(loginSchema), login);

router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/refresh-token").post(refreshAccessToken);

router
  .route("/forgot-password")
  .post(validateResource(forgotPasswordSchema), forgotPasswordRequest);

router
  .route("/reset-password/:resetToken")
  .post(validateResource(resetPasswordSchema), resetForgotPassword);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").post(verifyJWT, getCurrentUser);

router
  .route("/change-password")
  .post(
    verifyJWT,
    validateResource(changePasswordSchema),
    changeCurrentPassword,
  );

router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

export default router;
