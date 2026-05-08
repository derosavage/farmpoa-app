import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createPaymentsService } from './payments.service.js'
import { createPaymentSchema, mpesaCallbackSchema } from './payments.schema.js'
import { requireAuth } from '../../shared/middleware/auth.middleware.js'
import { paginationSchema } from '../../shared/validators/common.js'
import { env } from '../../config/env.js'
import type { JwtPayload } from '../../shared/types/common.js'

export async function paymentsRoutes(fastify: FastifyInstance): Promise<void> {
  const svc = createPaymentsService(fastify.supabase)

  fastify.get('/payments', {
    preHandler: [requireAuth],
    schema: { tags: ['payments'], summary: 'List my payments', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as JwtPayload
    const { page, limit } = paginationSchema.parse(request.query)
    const result = await svc.list(user.sub, page, limit)
    return reply.send({ success: true, ...result })
  })

  fastify.post('/payments', {
    preHandler: [requireAuth],
    schema: { tags: ['payments'], summary: 'Initiate payment (M-Pesa, cash, etc.)', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = createPaymentSchema.parse({ body: request.body })
    const user = request.user as JwtPayload
    const data = await svc.create(body, user.sub)
    return reply.status(201).send({ success: true, data })
  })

  // M-Pesa STK push callback (no auth — called by Safaricom)
  fastify.post('/payments/mpesa/callback', {
    schema: { tags: ['payments'], summary: 'M-Pesa STK push callback (Safaricom webhook)' },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { body } = mpesaCallbackSchema.parse({ body: request.body })
    const { stkCallback } = body.Body
    await svc.handleMpesaCallback(
      stkCallback.CheckoutRequestID,
      stkCallback.ResultCode,
      stkCallback.CallbackMetadata?.Item ?? []
    )
    return reply.send({ ResultCode: 0, ResultDesc: 'Success' })
  })
}
