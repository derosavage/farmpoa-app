import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { requireAdmin } from '../../shared/middleware/auth.middleware.js'
import { Errors } from '../../shared/errors/AppError.js'

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  // Dashboard stats
  fastify.get('/admin/stats', {
    preHandler: [requireAdmin],
    schema: { tags: ['admin'], summary: 'Platform-wide statistics', security: [{ bearerAuth: [] }] },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const [usersRes, farmsRes, animalsRes, vacc] = await Promise.all([
      fastify.supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      fastify.supabaseAdmin.from('farms').select('id', { count: 'exact', head: true }).is('deleted_at', null),
      fastify.supabaseAdmin.from('animals').select('id', { count: 'exact', head: true }).is('deleted_at', null).eq('is_active', true),
      fastify.supabaseAdmin.from('vaccinations').select('id', { count: 'exact', head: true }).eq('status', 'scheduled'),
    ])

    return reply.send({
      success: true,
      data: {
        users: usersRes.count ?? 0,
        farms: farmsRes.count ?? 0,
        animals: animalsRes.count ?? 0,
        pendingVaccinations: vacc.count ?? 0,
        timestamp: new Date().toISOString(),
      },
    })
  })

  // List all users (admin)
  fastify.get('/admin/users', {
    preHandler: [requireAdmin],
    schema: { tags: ['admin'], summary: 'List all platform users', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { data, error } = await fastify.supabaseAdmin
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw Errors.internal('Failed to fetch users')
    return reply.send({ success: true, data })
  })

  // Deactivate user
  fastify.patch('/admin/users/:id/deactivate', {
    preHandler: [requireAdmin],
    schema: { tags: ['admin'], summary: 'Deactivate a user account', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string }
    const { data, error } = await fastify.supabaseAdmin
      .from('users')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw Errors.notFound('User', id)
    return reply.send({ success: true, data: { message: 'User deactivated' } })
  })
}
