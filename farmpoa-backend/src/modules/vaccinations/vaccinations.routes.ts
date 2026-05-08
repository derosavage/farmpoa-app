import type { FastifyInstance } from 'fastify';
import { VaccinationsController } from './vaccinations.controller';
import { VaccinationsService } from './vaccinations.service';
import { authenticate, requireRole } from '@/shared/middleware';

export async function vaccinationsRoutes(app: FastifyInstance): Promise<void> {
  const ctrl = new VaccinationsController(new VaccinationsService());
  const auth = { preHandler: [authenticate] };

  app.get('/', { ...auth, schema: { tags: ['Vaccinations'] } }, ctrl.list.bind(ctrl));
  app.post('/', { ...auth, schema: { tags: ['Vaccinations'] } }, ctrl.create.bind(ctrl));
  app.post('/:id/administer', {
    preHandler: [requireRole('veterinarian', 'admin', 'field_agent')],
    schema: { tags: ['Vaccinations'] },
  }, ctrl.administer.bind(ctrl));
  app.get('/due/:farmId', { ...auth, schema: { tags: ['Vaccinations'] } }, ctrl.getDue.bind(ctrl));
}
