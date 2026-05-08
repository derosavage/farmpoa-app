import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { requireAuth } from '../../shared/middleware/auth.middleware.js'
import { Errors } from '../../shared/errors/AppError.js'
import type { JwtPayload } from '../../shared/types/common.js'

export async function remindersRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/reminders', {
    preHandler: [requireAuth],
    schema: { tags: ['reminders'], summary: 'Get my reminders', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as JwtPayload
    const { data, error } = await fastify.supabase
      .from('reminders')
      .select('*, animals(tag_id, name, species), farms(name)')
      .eq('user_id', user.sub)
      .is('deleted_at', null)
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (error) throw Errors.internal('Failed to fetch reminders')
    return reply.send({ success: true, data })
  })

  fastify.patch('/reminders/:id/dismiss', {
    preHandler: [requireAuth],
    schema: { tags: ['reminders'], summary: 'Dismiss a reminder', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const id = z.string().uuid().parse((request.params as { id: string }).id)
    const user = request.user as JwtPayload

    const { data, error } = await fastify.supabase
      .from('reminders')
      .update({ status: 'dismissed', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.sub)
      .select()
      .single()

    if (error || !data) throw Errors.notFound('Reminder', id)
    return reply.send({ success: true, data })
  })
}
