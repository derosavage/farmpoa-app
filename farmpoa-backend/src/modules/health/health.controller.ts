import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createHealthService } from './health.service.js'
import { createHealthRecordSchema, updateHealthRecordSchema } from './health.schema.js'
import { requireAuth, requireVetOrAdmin } from '../../shared/middleware/auth.middleware.js'
import { paginationSchema, uuidSchema } from '../../shared/validators/common.js'
import { z } from 'zod'
import type { JwtPayload } from '../../shared/types/common.js'

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const svc = createHealthService(fastify.supabase)

  fastify.get('/animals/:animalId/health', {
    preHandler: [requireAuth],
    schema: { tags: ['health'], summary: 'Get health timeline for an animal', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const animalId = uuidSchema.parse((request.params as { animalId: string }).animalId)
    const { page, limit } = paginationSchema.parse(request.query)
    const result = await svc.list(animalId, page, limit)
    return reply.send({ success: true, ...result })
  })

  fastify.get('/farms/:farmId/health/follow-ups', {
    preHandler: [requireAuth],
    schema: { tags: ['health'], summary: 'Get upcoming follow-up visits', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const farmId = uuidSchema.parse((request.params as { farmId: string }).farmId)
    const data = await svc.listFollowUps(farmId)
    return reply.send({ success: true, data })
  })

  fastify.post('/animals/:animalId/health', {
    preHandler: [requireVetOrAdmin],
    schema: { tags: ['health'], summary: 'Create health record (vet/admin only)', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createHealthRecordSchema.parse({ body: request.body })
    const user = request.user as JwtPayload
    const data = await svc.create(body, user.sub, fastify.supabaseAdmin)
    return reply.status(201).send({ success: true, data })
  })

  fastify.patch('/health/:id', {
    preHandler: [requireVetOrAdmin],
    schema: { tags: ['health'], summary: 'Update health record', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, body } = updateHealthRecordSchema.parse({ params: request.params, body: request.body })
    const data = await svc.update(params.id, body)
    return reply.send({ success: true, data })
  })
}
