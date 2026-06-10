import ApiError from "../utils/apiError.js";

const errorHandler = (err, _req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors.map((e) => e.path).join(", ");
    error = new ApiError(400, `Duplicate value for field: ${field}`);
  }

  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ");
    error = new ApiError(400, message);
  }

  if (err.name === "SequelizeDatabaseError") {
    error = new ApiError(400, `Database error: ${err.message}`);
  }

  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token");
  }

  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Token expired");
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
    errors: error.errors || [],
  });
};

export { errorHandler };
