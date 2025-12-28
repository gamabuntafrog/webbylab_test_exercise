import { Request, Response, NextFunction } from "express";
import { AppError } from "@errors/AppError";
import config from "@config";
import logger from "@utilities/logger";
import { ERROR_CODES, ErrorCode } from "@constants/errorCodes";
import multer from "multer";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // If response has already been sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Prepare error context for logging
  const errorContext = {
    error: {
      name: err.name,
      message: err.message,
      code: err instanceof AppError ? err.code : undefined,
      statusCode: err instanceof AppError ? err.statusCode : 500,
      stack: config.isDevelopment() ? err.stack : undefined,
    },
    request: {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    },
  };

  // Handle Multer errors first (before logging)
  if (err instanceof multer.MulterError) {
    let errorCode: ErrorCode = ERROR_CODES.FILE_UPLOAD_ERROR;
    let message = "File upload error";
    const statusCode = 400;

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        errorCode = ERROR_CODES.FILE_TOO_LARGE;
        message = "File too large. Maximum size is 10MB";
        break;
      case "LIMIT_FILE_COUNT":
        message = "Too many files. Only one file is allowed";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        errorCode = ERROR_CODES.INVALID_FILE_FIELD;
        message = "Unexpected file field";
        break;
      default:
        message = err.message || "File upload error";
    }

    // Log multer errors as warnings (client errors, not server errors)
    logger.warn(
      {
        ...errorContext,
        error: {
          ...errorContext.error,
          code: errorCode,
          statusCode,
        },
      },
      `MulterError [${errorCode}]: ${message}`
    );

    const errorResponse = {
      status: 0,
      error: {
        code: errorCode,
      },
      ...(config.isDevelopment() && {
        meta: {
          message,
          timestamp: new Date().toISOString(),
          path: req.url,
          method: req.method,
        },
      }),
    };

    res.status(statusCode).json(errorResponse);
    return;
  }

  // Log error based on type and severity
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(errorContext, `AppError [${err.code}]: ${err.message}`);
    } else if (err.statusCode >= 400) {
      logger.warn(errorContext, `AppError [${err.code}]: ${err.message}`);
    } else {
      logger.info(errorContext, `AppError [${err.code}]: ${err.message}`);
    }
  } else {
    logger.error(errorContext, "Unexpected error occurred");
  }

  // Handle AppError instances
  if (err instanceof AppError) {
    const errorResponse = {
      status: 0,
      error: {
        code: err.code,
        ...(err.details && { fields: err.details }),
      },
      ...(config.isDevelopment() && {
        meta: {
          message: err.message,
          timestamp: err.timestamp.toISOString(),
          path: req.url,
          method: req.method,
        },
      }),
    };

    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Handle unexpected errors
  const errorResponse = {
    status: 0,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    },
    ...(config.isDevelopment() && {
      meta: {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        path: req.url,
        method: req.method,
      },
    }),
  };

  res.status(500).json(errorResponse);
}
