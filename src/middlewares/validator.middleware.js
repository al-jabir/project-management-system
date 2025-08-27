import { ApiError } from "../utils/api-error.js";

export const validateResource = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    next();
  } catch (error) {
    const errors = error.errors.map((err) => ({
      path: err.path.join("."),
      message: err.message,
    }));

    throw new ApiError(400, "Validation failed", errors);
  }
};
