// middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Custom API error class
 * Provides specific status codes and messages for API errors
 */
export class ApiError extends Error {
  statusCode: number;

  // Create a new ApiError instance
  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    // Make `instanceof ApiError` work correctly
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// ===============================
// Async route handler wrapper
// Catches rejected promises in async route handlers
// and forwards them to Express error middleware
// ===============================
export const asyncHandler = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ===============================
// Centralized error handling middleware
// Handles all errors thrown in routes or services
// Sends standardized JSON responses
// ===============================
export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {

  // Determine HTTP status code
  const status = err instanceof ApiError ? err.statusCode : 500;
  
 // Determine error message
  const message = err.message || 'Internal Server Error';

  // Send standardized JSON response to the client
  res.status(status).json({ success: false, status, message });
};