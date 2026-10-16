// Operational errors with an HTTP status and a stable machine-readable code.
// The error handler turns these into { error: { code, message, details? } }.
export class AppError extends Error {
  constructor(statusCode, code, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Invalid input', details) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class AuthError extends AppError {
  constructor(message = 'Not authenticated') {
    super(401, 'AUTH_ERROR', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have access to this resource') {
    super(403, 'FORBIDDEN', message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, 'NOT_FOUND', message);
  }
}

export class UnsupportedFormatError extends AppError {
  constructor(message = 'Unsupported file format') {
    super(415, 'UNSUPPORTED_FORMAT', message);
  }
}

export class ExtractionError extends AppError {
  constructor(message = 'Could not extract data from the document', details) {
    super(422, 'EXTRACTION_ERROR', message, details);
  }
}
