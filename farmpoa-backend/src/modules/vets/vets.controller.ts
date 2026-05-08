import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { requireAuth, requireAdmin } from '../../shared/middleware/auth.middleware.js'
import { uuidSchema, paginationSchema } from '../../shared/validators/common.js'
import { Errors } from '../../shared/errors/AppError.js'
import type { JwtPayload } from '../../shared/types/common.js'

const createAssignmentSchema = z.object({
  body: z.object({
    vet_id: uuidSchema,
    farm_id: uuidSchema,
    scope: z.string().max(500).optional(),
    expiry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    scheduled_visit: z.string().datetime().optional(),
    notes: z.string().max(1000).optional(),
  }),
})

export async function vetsRoutes(fastify: FastifyInstance): Promise<void> {
  // List vets (for farmers to browse and assign)
  fastify.get('/vets', {
    preHandler: [requireAuth],
    schema: { tags: ['vets'], summary: 'Browse available veterinarians', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { page, limit } = paginationSchema.parse(request.query)
    const offset = (page - 1) * limit
    const { data, count, error } = await fastify.supabase
      .from('users')
      .select('id, full_name, phone, locale', { count: 'exact' })
      .eq('role', 'veterinarian')
      .eq('is_active', true)
      .is('deleted_at', null)
      .range(offset, offset + limit - 1)

    if (error) throw Errors.internal('Failed to fetch vets')
    return reply.send({ success: true, data, pagination: { page, limit, total: count ?? 0 } })
  })

  // Assign vet to farm
  fastify.post('/vet-assignments', {
    preHandler: [requireAuth],
    schema: { tags: ['vets'], summary: 'Assign vet to a farm', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createAssignmentSchema.parse({ body: request.body })
    const user = request.user as JwtPayload

    const { data, error } = await fastify.supabaseAdmin.from('vet_assignments').insert({
      ...body,
      assigned_by: user.sub,
      status: 'pending',
      assignment_date: new Date().toISOString().split('T')[0],
    }).select().single()

    if (error) {
      if (error.code === '23P01') throw Errors.conflict('Vet is already assigned to this farm during this period')
      throw Errors.internal('Failed to create assignment')
    }

    return reply.status(201).send({ success: true, data })
  })

  // Vet: list my assignments
  fastify.get('/vet-assignments/mine', {
    preHandler: [requireAuth],
    schema: { tags: ['vets'], summary: 'List my vet assignments', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as JwtPayload
    const { data, error } = await fastify.supabase
      .from('vet_assignments')
      .select('*, farms(name, county, owner_id, users!owner_id(full_name, phone))')
      .eq('vet_id', user.sub)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw Errors.internal('Failed to fetch assignments')
    return reply.send({ success: true, data })
  })

  // Accept / update assignment status
  fastify.patch('/vet-assignments/:id', {
    preHandler: [requireAuth],
    schema: { tags: ['vets'], summary: 'Update assignment status', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const id = uuidSchema.parse((request.params as { id: string }).id)
    const { status } = z.object({ status: z.enum(['accepted', 'in_progress', 'completed', 'cancelled']) }).parse(request.body)

    const { data, error } = await fastify.supabase
      .from('vet_assignments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw Errors.notFound('Assignment', id)
    return reply.send({ success: true, data })
  })
}
