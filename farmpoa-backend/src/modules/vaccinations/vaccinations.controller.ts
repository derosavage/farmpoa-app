import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createVaccinationsService } from './vaccinations.service.js'
import {
  createVaccinationSchema, updateVaccinationSchema,
  listVaccinationsSchema, dueSoonSchema,
} from './vaccinations.schema.js'
import { requireAuth, requireVetOrAdmin } from '../../shared/middleware/auth.middleware.js'

export async function vaccinationsRoutes(fastify: FastifyInstance): Promise<void> {
  const svc = createVaccinationsService(fastify.supabase)

  fastify.get('/animals/:animalId/vaccinations', {
    preHandler: [requireAuth],
    schema: { tags: ['vaccinations'], summary: 'List vaccination history for an animal', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, querystring } = listVaccinationsSchema.parse({ params: request.params, querystring: request.query })
    const result = await svc.list(params.animalId, querystring.page, querystring.limit)
    return reply.send({ success: true, ...result })
  })

  fastify.get('/farms/:farmId/vaccinations/due', {
    preHandler: [requireAuth],
    schema: { tags: ['vaccinations'], summary: 'Get animals with vaccinations due soon', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, querystring } = dueSoonSchema.parse({ params: request.params, querystring: request.query })
    const data = await svc.dueSoon(params.farmId, querystring.days)
    return reply.send({ success: true, data })
  })

  fastify.post('/animals/:animalId/vaccinations', {
    preHandler: [requireVetOrAdmin],
    schema: { tags: ['vaccinations'], summary: 'Record a vaccination (vet/admin only)', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createVaccinationSchema.parse({ body: request.body })
    const data = await svc.create(body, fastify.supabaseAdmin)
    return reply.status(201).send({ success: true, data })
  })

  fastify.patch('/vaccinations/:id', {
    preHandler: [requireVetOrAdmin],
    schema: { tags: ['vaccinations'], summary: 'Update vaccination record', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { params, body } = updateVaccinationSchema.parse({ params: request.params, body: request.body })
    const data = await svc.update(params.id, body)
    return reply.send({ success: true, data })
  })
}
