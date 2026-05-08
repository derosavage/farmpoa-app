export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'UNPROCESSABLE'
  | 'PAYMENT_FAILED'
  | 'SMS_FAILED'

export class AppError extends Error {
  readonly statusCode: number
  readonly code: ErrorCode
  readonly details?: unknown
  readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    details?: unknown,
    isOperational = true
  ) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ? { details: this.details } : {}),
      },
    }
  }
}

// ─── Factory helpers ──────────────────────────────────────────────────────────
export const Errors = {
  badRequest: (msg: string, details?: unknown) =>
    new AppError(msg, 400, 'VALIDATION_ERROR', details),

  unauthorized: (msg = 'Authentication required') =>
    new AppError(msg, 401, 'UNAUTHORIZED'),

  forbidden: (msg = 'Insufficient permissions') =>
    new AppError(msg, 403, 'FORBIDDEN'),

  notFound: (resource: string, id?: string) =>
    new AppError(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      'NOT_FOUND'
    ),

  conflict: (msg: string) =>
    new AppError(msg, 409, 'CONFLICT'),

  unprocessable: (msg: string, details?: unknown) =>
    new AppError(msg, 422, 'UNPROCESSABLE', details),

  internal: (msg = 'Internal server error') =>
    new AppError(msg, 500, 'INTERNAL_ERROR', undefined, false),

  serviceUnavailable: (service: string) =>
    new AppError(`Service unavailable: ${service}`, 503, 'SERVICE_UNAVAILABLE'),
}
