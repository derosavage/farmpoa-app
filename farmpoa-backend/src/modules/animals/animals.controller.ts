import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createAnimalsService } from './animals.service.js'
import { createAnimalSchema, updateAnimalSchema, listAnimalsSchema, tagLookupSchema } from './animals.schema.js'
import { requireAuth } from '../../shared/middleware/auth.middleware.js'
import type { JwtPayload } from '../../shared/types/common.js'

export async function animalsRoutes(fastify: FastifyInstance): Promise<void> {
  const svc = createAnimalsService(fastify.supabase)

  // GET /farms/:farmId/animals
  fastify.get('/farms/:farmId/animals', {
    preHandler: [requireAuth],
    schema: { tags: ['animals'], summary: 'List animals on a farm', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, querystring } = listAnimalsSchema.parse({ params: request.params, querystring: request.query })
    const result = await svc.list(params.farmId, querystring)
    return reply.send({ success: true, ...result })
  })

  // GET /animals/:id
  fastify.get('/animals/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['animals'], summary: 'Get animal by ID', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const data = await svc.findById(id)
    return reply.send({ success: true, data })
  })

  // GET /animals/tag/:tagId
  fastify.get('/animals/tag/:tagId', {
    preHandler: [requireAuth],
    schema: { tags: ['animals'], summary: 'Lookup animal by ear tag or RFID', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params } = tagLookupSchema.parse({ params: request.params })
    const data = await svc.findByTag(params.tagId)
    return reply.send({ success: true, data })
  })

  // POST /animals
  fastify.post('/animals', {
    preHandler: [requireAuth],
    schema: { tags: ['animals'], summary: 'Register a new animal', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createAnimalSchema.parse({ body: request.body })
    const user = request.user as JwtPayload
    const data = await svc.create(body, user.sub)
    return reply.status(201).send({ success: true, data })
  })

  // PATCH /animals/:id
  fastify.patch('/animals/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['animals'], summary: 'Update animal details', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, body } = updateAnimalSchema.parse({ params: request.params, body: request.body })
    const data = await svc.update(params.id, body)
    return reply.send({ success: true, data })
  })

  // DELETE /animals/:id
  fastify.delete('/animals/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['animals'], summary: 'Soft-delete an animal', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const user = request.user as JwtPayload
    const data = await svc.softDelete(id, user.sub)
    return reply.send({ success: true, data })
  })
}
