import type { FastifyRequest, FastifyReply } from 'fastify'
import { randomUUID } from 'crypto'

export function addRequestId(request: FastifyRequest, reply: FastifyReply, done: () => void): void {
  const id = (request.headers['x-request-id'] as string) || randomUUID()
  request.id = id
  reply.header('x-request-id', id)
  done()
}
