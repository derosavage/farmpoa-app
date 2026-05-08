import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { ZodError } from 'zod'
import { AppError } from '../shared/errors/AppError.js'
import { createModuleLogger } from '../config/logger.js'

const log = createModuleLogger('error-handler')

function errorHandlerPlugin(fastify: FastifyInstance, _opts: object, done: () => void) {
  fastify.setErrorHandler(
    (error: FastifyError | AppError | ZodError | Error, request: FastifyRequest, reply: FastifyReply) => {
      const requestId = request.id

      // ── Zod validation errors ─────────────────────────────────────────────
      if (error instanceof ZodError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: error.flatten().fieldErrors,
          },
          requestId,
        })
      }

      // ── App errors (operational) ──────────────────────────────────────────
      if (error instanceof AppError) {
        if (!error.isOperational) {
          log.error({ err: error, requestId }, 'Operational error')
        }
        return reply.status(error.statusCode).send({
          success: false,
          ...error.toJSON(),
          requestId,
        })
      }

      // ── Fastify built-in errors (e.g. 404 route not found) ───────────────
      if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode < 500) {
        return reply.status(error.statusCode).send({
          success: false,
          error: { code: 'CLIENT_ERROR', message: error.message },
          requestId,
        })
      }

      // ── Unknown / programming errors ──────────────────────────────────────
      log.error({ err: error, requestId, url: request.url, method: request.method }, 'Unhandled error')

      return reply.status(500).send({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
        requestId,
      })
    }
  )

  // 404 handler
  fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.status(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    })
  })

  done()
}

export const errorHandler = fp(errorHandlerPlugin, { name: 'error-handler' })
