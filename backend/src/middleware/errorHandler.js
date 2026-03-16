import { logger } from "../config/logger.js";

export function errorHandler(error, _req, res, _next) {
  logger.error(error.message, { stack: error.stack });

  res.status(error.statusCode || 500).json({
    message: error.publicMessage || "Something went wrong. Please try again."
  });
}
