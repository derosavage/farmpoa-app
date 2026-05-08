import type { FastifyReply, FastifyRequest } from 'fastify';

export async function requestLogger(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  request.log.info({
    requestId: request.id,
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  }, 'Incoming request');
}
