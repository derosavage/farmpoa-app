import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from './AppError';

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const requestId = request.id;
  const log = request.log;

  // Zod validation error
  if (error instanceof ZodError) {
    const formatted = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    log.warn({ requestId, errors: formatted }, 'Validation error');
    return reply.status(422).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formatted,
        requestId,
      },
    });
  }

  // Fastify validation error (JSON Schema)
  if ('validation' in error && error.validation) {
    log.warn({ requestId, validation: error.validation }, 'Schema validation error');
    return reply.status(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: error.message,
        details: error.validation,
        requestId,
      },
    });
  }

  // Known operational errors
  if (error instanceof AppError && error.isOperational) {
    if (error.statusCode >= 500) {
      log.error({ requestId, err: error }, 'Operational server error');
    } else {
      log.warn({ requestId, err: error }, 'Client error');
    }
    return reply.status(error.statusCode).send({
      success: false,
      error: { ...error.toJSON(), requestId },
    });
  }

  // Fastify 404
  if ('statusCode' in error && error.statusCode === 404) {
    return reply.status(404).send({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found', requestId },
    });
  }

  // Fastify rate limit
  if ('statusCode' in error && error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests', requestId },
    });
  }

  // Unknown / programming errors — never leak details in production
  log.error({ requestId, err: error }, 'Unhandled error');
  return reply.status(500).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : (error instanceof Error ? error.message : 'Unknown error'),
      requestId,
    },
  });
}
