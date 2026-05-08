import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createFarmsService } from './farms.service.js'
import { createFarmSchema, updateFarmSchema } from './farms.schema.js'
import { requireAuth } from '../../shared/middleware/auth.middleware.js'
import { paginationSchema, uuidSchema } from '../../shared/validators/common.js'
import type { JwtPayload } from '../../shared/types/common.js'

export async function farmsRoutes(fastify: FastifyInstance): Promise<void> {
  const svc = createFarmsService(fastify.supabase)

  fastify.get('/farms', {
    preHandler: [requireAuth],
    schema: { tags: ['farms'], summary: 'List my farms', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as JwtPayload
    const { page, limit } = paginationSchema.parse(request.query)
    const result = await svc.listMyFarms(user.sub, page, limit)
    return reply.send({ success: true, ...result })
  })

  fastify.get('/farms/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['farms'], summary: 'Get farm details', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const id = uuidSchema.parse((request.params as { id: string }).id)
    const data = await svc.findById(id)
    return reply.send({ success: true, data })
  })

  fastify.post('/farms', {
    preHandler: [requireAuth],
    schema: { tags: ['farms'], summary: 'Create a new farm', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createFarmSchema.parse({ body: request.body })
    const user = request.user as JwtPayload
    const data = await svc.create(body, user.sub)
    return reply.status(201).send({ success: true, data })
  })

  fastify.patch('/farms/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['farms'], summary: 'Update farm', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, body } = updateFarmSchema.parse({ params: request.params, body: request.body })
    const data = await svc.update(params.id, body)
    return reply.send({ success: true, data })
  })

  fastify.delete('/farms/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['farms'], summary: 'Delete farm (soft delete)', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const id = uuidSchema.parse((request.params as { id: string }).id)
    const user = request.user as JwtPayload
    const data = await svc.softDelete(id, user.sub)
    return reply.send({ success: true, data })
  })
}
