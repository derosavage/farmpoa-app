import type { FastifyInstance } from 'fastify';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { authenticate, requireRole } from '@/shared/middleware';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const ctrl = new HealthController(new HealthService());
  const auth = { preHandler: [authenticate] };
  const vetAuth = { preHandler: [requireRole('veterinarian', 'admin', 'field_agent')] };

  app.get('/', { ...auth, schema: { tags: ['Health'] } }, ctrl.list.bind(ctrl));
  app.get('/follow-ups/:farmId', { ...auth, schema: { tags: ['Health'] } }, ctrl.getFollowUps.bind(ctrl));
  app.get('/:id', { ...auth, schema: { tags: ['Health'] } }, ctrl.getOne.bind(ctrl));
  app.post('/', { ...vetAuth, schema: { tags: ['Health'] } }, ctrl.create.bind(ctrl));
  app.patch('/:id', { ...vetAuth, schema: { tags: ['Health'] } }, ctrl.update.bind(ctrl));
  app.post('/:id/confirm', { ...vetAuth, schema: { tags: ['Health'] } }, ctrl.confirm.bind(ctrl));
}
