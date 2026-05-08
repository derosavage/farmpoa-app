import type { FastifyInstance } from 'fastify';
import fastifyRequestContext from '@fastify/request-context';

export async function requestContextPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyRequestContext);
}
