import type { FastifyReply } from 'fastify';
import type { ApiResponse, PaginatedResponse } from '../types/common';

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>,
): FastifyReply {
  const body: ApiResponse<T> = { success: true, data, ...(meta ? { meta } : {}) };
  return reply.status(statusCode).send(body);
}

export function sendPaginated<T>(
  reply: FastifyReply,
  result: PaginatedResponse<T>,
): FastifyReply {
  return reply.status(200).send({ success: true, ...result });
}

export function sendCreated<T>(reply: FastifyReply, data: T): FastifyReply {
  return sendSuccess(reply, data, 201);
}

export function sendNoContent(reply: FastifyReply): FastifyReply {
  return reply.status(204).send();
}
