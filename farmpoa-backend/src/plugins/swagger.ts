import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import type { FastifyInstance } from 'fastify'
import { env } from '../config/env.js'

async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'FarmPOA API',
        description: 'Livestock Management Platform for East Africa',
        version: '1.0.0',
        contact: { name: 'FarmPOA Engineering', email: 'api@farmpoa.co.ke' },
      },
      servers: [
        { url: `http://localhost:${env.PORT}${env.API_PREFIX}`, description: 'Local' },
        { url: `https://api.farmpoa.co.ke/api/v1`, description: 'Production' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'auth', description: 'Authentication & OTP' },
        { name: 'farms', description: 'Farm management' },
        { name: 'animals', description: 'Animal registry' },
        { name: 'vaccinations', description: 'Vaccination records' },
        { name: 'health', description: 'Health records' },
        { name: 'production', description: 'Production tracking' },
        { name: 'payments', description: 'Payments (M-Pesa etc.)' },
        { name: 'vets', description: 'Vet assignments' },
        { name: 'reminders', description: 'Alerts & reminders' },
        { name: 'admin', description: 'Admin operations' },
      ],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  })
}

export const swaggerPlugin = fp(swaggerPlugin, { name: 'swagger' })
