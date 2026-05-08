import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import jwt from '@fastify/jwt'
import rateLimit from '@fastify/rate-limit'
import sensible from '@fastify/sensible'
import fp from 'fastify-plugin'

import { env } from './config/env.js'
import { logger } from './config/logger.js'
import { supabase, supabaseAdmin } from './config/supabase.js'
import { errorHandler } from './plugins/errorHandler.js'

// Routes
import { authRoutes } from './modules/auth/auth.controller.js'
import { farmsRoutes } from './modules/farms/farms.controller.js'
import { animalsRoutes } from './modules/animals/animals.controller.js'
import { vaccinationsRoutes } from './modules/vaccinations/vaccinations.controller.js'
import { healthRoutes } from './modules/health/health.controller.js'
import { productionRoutes } from './modules/production/production.controller.js'
import { paymentsRoutes } from './modules/payments/payments.controller.js'
import { vetsRoutes } from './modules/vets/vets.controller.js'
import { remindersRoutes } from './modules/reminders/reminders.controller.js'
import { adminRoutes } from './modules/admin/admin.controller.js'

// Augment FastifyInstance with custom decorators
declare module 'fastify' {
  interface FastifyInstance {
    supabase: typeof supabase
    supabaseAdmin: typeof supabaseAdmin
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: env.LOG_PRETTY
      ? { level: env.LOG_LEVEL, transport: { target: 'pino-pretty' } }
      : { level: env.LOG_LEVEL },
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
    ajv: { customOptions: { strict: false } },
  })

  // ── Core plugins ──────────────────────────────────────────────────────────
  await app.register(sensible)
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'x-request-id'],
    credentials: true,
  })

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (request) => (request.headers['x-forwarded-for'] as string) ?? request.ip,
    errorResponseBuilder: (_request, context) => ({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: `Too many requests. Retry after ${Math.ceil(context.ttl / 1000)}s.`,
      },
    }),
  })

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  })

  // ── Custom decorators ──────────────────────────────────────────────────────
  app.decorate('supabase', supabase)
  app.decorate('supabaseAdmin', supabaseAdmin)
  app.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try { await request.jwtVerify() }
    catch { reply.status(401).send({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }) }
  })

  // ── Error handler ─────────────────────────────────────────────────────────
  await app.register(errorHandler)

  // ── Health check (no auth) ─────────────────────────────────────────────────
  app.get('/health', {
    schema: { tags: ['system'], summary: 'Health check' },
  }, async (_req, reply) => {
    // Quick DB ping
    const { error } = await supabase.from('users').select('id').limit(1)
    const dbStatus = error ? 'degraded' : 'ok'
    return reply.send({
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: { database: dbStatus },
    })
  })

  // ── API routes ─────────────────────────────────────────────────────────────
  const prefix = env.API_PREFIX

  await app.register(authRoutes, { prefix: `${prefix}/auth` })
  await app.register(farmsRoutes, { prefix })
  await app.register(animalsRoutes, { prefix })
  await app.register(vaccinationsRoutes, { prefix })
  await app.register(healthRoutes, { prefix })
  await app.register(productionRoutes, { prefix })
  await app.register(paymentsRoutes, { prefix })
  await app.register(vetsRoutes, { prefix })
  await app.register(remindersRoutes, { prefix })
  await app.register(adminRoutes, { prefix })

  // ── Swagger (non-production only) ──────────────────────────────────────────
  if (!env.isProduction) {
    const swagger = await import('@fastify/swagger')
    const swaggerUi = await import('@fastify/swagger-ui')
    await app.register(swagger.default, {
      openapi: {
        info: { title: 'FarmPOA API', version: '1.0.0', description: 'Livestock Management for East Africa' },
        tags: [
          { name: 'auth' }, { name: 'farms' }, { name: 'animals' },
          { name: 'vaccinations' }, { name: 'health' }, { name: 'production' },
          { name: 'payments' }, { name: 'vets' }, { name: 'reminders' }, { name: 'admin' },
        ],
        components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
      },
    })
    await app.register(swaggerUi.default, { routePrefix: '/docs' })
    logger.info('Swagger UI available at /docs')
  }

  return app
}
