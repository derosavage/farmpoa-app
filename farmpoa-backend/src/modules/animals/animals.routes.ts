import type { FastifyInstance } from 'fastify';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';
import { authenticate, requireRole } from '@/shared/middleware';

export async function animalsRoutes(app: FastifyInstance): Promise<void> {
  const service = new AnimalsService();
  const ctrl = new AnimalsController(service);

  const auth = { preHandler: [authenticate] };

  app.get('/', { ...auth, schema: { tags: ['Animals'] } }, ctrl.list.bind(ctrl));
  app.get('/tag/:tagId', { ...auth, schema: { tags: ['Animals'] } }, ctrl.getByTag.bind(ctrl));
  app.get('/:id', { ...auth, schema: { tags: ['Animals'] } }, ctrl.getOne.bind(ctrl));
  app.get('/:id/offspring', { ...auth, schema: { tags: ['Animals'] } }, ctrl.getBirthHistory.bind(ctrl));
  app.post('/', { ...auth, schema: { tags: ['Animals'] } }, ctrl.create.bind(ctrl));
  app.patch('/:id', { ...auth, schema: { tags: ['Animals'] } }, ctrl.update.bind(ctrl));
  app.delete('/:id', {
    preHandler: [requireRole('farmer', 'admin')],
    schema: { tags: ['Animals'] },
  }, ctrl.remove.bind(ctrl));
}
