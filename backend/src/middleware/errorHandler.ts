import { Request, Response, NextFunction } from "express";
import { Error as MongooseError } from "mongoose";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Mongoose validation error → 400
  if (err instanceof MongooseError.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message).join(", ");
    res.status(400).json({ success: false, message: `Validation error: ${messages}` });
    return;
  }

  // Mongoose cast error (bad ObjectId etc.) → 400
  if (err instanceof MongooseError.CastError) {
    res.status(400).json({ success: false, message: `Invalid value for field '${err.path}'` });
    return;
  }

  // MongoDB duplicate key → 409
  if (typeof err === "object" && err !== null && (err as Record<string, unknown>).code === 11000) {
    res.status(409).json({ success: false, message: "A record with that value already exists" });
    return;
  }

  // Generic
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[ERROR]", err);
  res.status(500).json({ success: false, message });
}

/* Wraps an async route handler so thrown errors reach the error handler */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}
