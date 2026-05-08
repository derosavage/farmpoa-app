import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from '@/config/env';
import { AppError } from '../errors/AppError';

export async function internalAuth(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  const secret = request.headers['x-internal-secret'];
  if (secret !== env.INTERNAL_API_SECRET) {
    throw AppError.unauthorized('Invalid internal secret');
  }
}
