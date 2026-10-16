import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

// Single JSON error shape for the whole API: { error: { code, message, details? } }.
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature.
export const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Something went wrong';
  let details;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid input';
    details = err.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid input';
    details = Object.values(err.errors || {}).map((e) => ({ path: e.path, message: e.message }));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid identifier';
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE';
    message = 'That resource already exists';
    details = err.keyValue;
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'AUTH_ERROR';
    message = 'Session expired, please log in again';
  }

  // Log only genuinely unexpected server errors — not deliberate operational
  // errors (e.g. a 501 "not implemented yet"), which would just be noise.
  const isOperational = err instanceof AppError && err.isOperational;
  if (statusCode >= 500 && !isOperational) console.error(err);

  const body = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  if (env.NODE_ENV !== 'production' && statusCode >= 500) body.error.stack = err.stack;

  res.status(statusCode).json(body);
};
