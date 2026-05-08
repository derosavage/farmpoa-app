import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { AuthService } from './auth.service.js'
import { sendOtpSchema, verifyOtpSchema, refreshTokenSchema } from './auth.schema.js'

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/otp/send
  fastify.post('/otp/send', {
    schema: {
      tags: ['auth'],
      summary: 'Send OTP via SMS',
      description: 'Sends a 6-digit OTP to the provided phone number (E.164 format).',
      body: {
        type: 'object',
        required: ['phone'],
        properties: {
          phone: { type: 'string', example: '+254712345678' },
          country: { type: 'string', default: 'KE' },
          locale: { type: 'string', enum: ['en', 'sw', 'am', 'rw', 'lg', 'om'], default: 'sw' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const input = sendOtpSchema.shape.body.parse(request.body)
    const result = await AuthService.sendOtp(input)
    return reply.status(200).send({ success: true, data: result })
  })

  // POST /auth/otp/verify
  fastify.post('/otp/verify', {
    schema: {
      tags: ['auth'],
      summary: 'Verify OTP and receive JWT tokens',
      body: {
        type: 'object',
        required: ['phone', 'otp'],
        properties: {
          phone: { type: 'string', example: '+254712345678' },
          otp: { type: 'string', example: '123456' },
        },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const input = verifyOtpSchema.shape.body.parse(request.body)
    const result = await AuthService.verifyOtp(input, fastify)
    return reply.status(200).send({ success: true, data: result })
  })

  // POST /auth/refresh
  fastify.post('/refresh', {
    schema: {
      tags: ['auth'],
      summary: 'Refresh access token',
      body: {
        type: 'object',
        required: ['refresh_token'],
        properties: { refresh_token: { type: 'string' } },
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { refresh_token } = refreshTokenSchema.shape.body.parse(request.body)
    const result = await AuthService.refreshToken(refresh_token, fastify)
    return reply.status(200).send({ success: true, data: result })
  })

  // GET /auth/me
  fastify.get('/me', {
    preHandler: [fastify.authenticate],
    schema: { tags: ['auth'], summary: 'Get current user profile', security: [{ bearerAuth: [] }] },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { sub: string }
    const { data, error } = await fastify.supabaseAdmin.from('users').select('*').eq('id', user.sub).is('deleted_at', null).single()
    if (error || !data) throw fastify.httpErrors.notFound('User not found')
    return reply.send({ success: true, data })
  })
}
