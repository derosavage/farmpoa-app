import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createProductionService } from './production.service.js'
import { createProductionSchema, farmSummarySchema } from './production.schema.js'
import { requireAuth } from '../../shared/middleware/auth.middleware.js'
import { uuidSchema } from '../../shared/validators/common.js'
import type { JwtPayload } from '../../shared/types/common.js'

export async function productionRoutes(fastify: FastifyInstance): Promise<void> {
  const svc = createProductionService(fastify.supabase)

  fastify.post('/animals/:animalId/production', {
    preHandler: [requireAuth],
    schema: { tags: ['production'], summary: 'Log daily production metric', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createProductionSchema.parse({ body: request.body })
    const user = request.user as JwtPayload
    const data = await svc.logProduction(body, user.sub)
    return reply.status(201).send({ success: true, data })
  })

  fastify.get('/farms/:farmId/production/summary', {
    preHandler: [requireAuth],
    schema: { tags: ['production'], summary: 'Get farm production summary (30-day view)', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, querystring } = farmSummarySchema.parse({ params: request.params, querystring: request.query })
    const data = await svc.getFarmSummary(params.farmId, querystring.from, querystring.to, querystring.metric)
    return reply.send({ success: true, data })
  })

  fastify.get('/animals/:animalId/production', {
    preHandler: [requireAuth],
    schema: { tags: ['production'], summary: 'Get animal production timeline', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const animalId = uuidSchema.parse((request.params as { animalId: string }).animalId)
    const query = request.query as { from?: string; to?: string; metric?: string }
    const from = query.from ?? new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]!
    const to = query.to ?? new Date().toISOString().split('T')[0]!
    const data = await svc.getAnimalTimeline(animalId, from, to, query.metric)
    return reply.send({ success: true, data })
  })
}
