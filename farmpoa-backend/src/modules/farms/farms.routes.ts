import type { FastifyInstance } from 'fastify';
import { FarmsController } from './farms.controller';
import { FarmsService } from './farms.service';
import { authenticate } from '@/shared/middleware';

export async function farmsRoutes(app: FastifyInstance): Promise<void> {
  const ctrl = new FarmsController(new FarmsService());
  const auth = { preHandler: [authenticate] };

  app.get('/', { ...auth, schema: { tags: ['Farms'] } }, ctrl.list.bind(ctrl));
  app.post('/', { ...auth, schema: { tags: ['Farms'] } }, ctrl.create.bind(ctrl));
  app.get('/:id', { ...auth, schema: { tags: ['Farms'] } }, ctrl.getOne.bind(ctrl));
  app.patch('/:id', { ...auth, schema: { tags: ['Farms'] } }, ctrl.update.bind(ctrl));
  app.delete('/:id', { ...auth, schema: { tags: ['Farms'] } }, ctrl.remove.bind(ctrl));
  app.get('/:id/stats', { ...auth, schema: { tags: ['Farms'] } }, ctrl.getStats.bind(ctrl));
}
