import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Error caught:", err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }


  if ((err as any).code?.startsWith("P")) {
    return res.status(500).json({
      success: false,
      message: "Database error",
      code: (err as any).code,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
