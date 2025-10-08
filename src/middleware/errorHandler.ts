// middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

// Custom error class to provide specific status codes and messages.
export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// A utility function to wrap async route handlers and catch errors.
// This prevents the need for repetitive try-catch blocks in every async controller function.
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Centralized error handling middleware.
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack); // Log the full stack trace for debugging.

  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({ success: false, status, message });
};