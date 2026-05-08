import type { FastifyInstance } from 'fastify';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { authenticate } from '@/shared/middleware';

export async function productionRoutes(app: FastifyInstance): Promise<void> {
  const ctrl = new ProductionController(new ProductionService());
  const auth = { preHandler: [authenticate] };

  app.get('/', { ...auth, schema: { tags: ['Production'] } }, ctrl.list.bind(ctrl));
  app.post('/', { ...auth, schema: { tags: ['Production'] } }, ctrl.create.bind(ctrl));
  app.post('/bulk', { ...auth, schema: { tags: ['Production'] } }, ctrl.bulkCreate.bind(ctrl));
  app.get('/summary', { ...auth, schema: { tags: ['Production'] } }, ctrl.getSummary.bind(ctrl));
}
