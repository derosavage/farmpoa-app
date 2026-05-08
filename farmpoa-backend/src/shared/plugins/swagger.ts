import type { FastifyInstance } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { env } from '@/config/env';

export async function swaggerPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'FarmPOA API',
        description: 'Livestock Management Platform for East African Farmers',
        version: '1.0.0',
        contact: { name: 'FarmPOA Engineering', email: 'dev@farmpoa.co.ke' },
      },
      servers: [{ url: `http://localhost:${env.PORT}`, description: 'Development' }],
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: [
        { name: 'Auth', description: 'Authentication endpoints' },
        { name: 'Farms', description: 'Farm management' },
        { name: 'Animals', description: 'Animal registry' },
        { name: 'Vaccinations', description: 'Vaccination scheduling and records' },
        { name: 'Health', description: 'Health records' },
        { name: 'Production', description: 'Production tracking' },
        { name: 'Payments', description: 'Payments and M-Pesa' },
        { name: 'USSD', description: 'Feature phone USSD interface' },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  });
}
