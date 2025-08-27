import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    // email validation
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    // username validation
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLowercase()
      .withMessage("Username must be in lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),

    // password validation
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),

    // FullName (optional)
    body("fullName").optional().trim(),
  ];
};

const userLoginvalidator = () => {
  return [
    // email validation
    body("email").optional().isEmail().withMessage("Email is invalid"),
    // password validation
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const userResetForgotPasswordValidator = () => {
  return [body("newPassword").notEmpty().withMessage("Password is required")];
};

export {
  userRegisterValidator,
  userLoginvalidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
};
