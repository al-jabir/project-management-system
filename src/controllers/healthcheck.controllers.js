import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

const healthCheck = asyncHandler(async (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    mongoConnection:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  };

  try {
    // Check MongoDB connection by running a simple query
    await mongoose.connection.db.admin().ping();
    healthcheck.database = "OK";
  } catch (error) {
    healthcheck.database = "ERROR";
    healthcheck.error = error.message;
    return res
      .status(503)
      .json(new ApiResponse(503, healthcheck, "Service Unavailable"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, healthcheck, "System is healthy"));
});

export { healthCheck };
