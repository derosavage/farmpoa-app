import type { FastifyInstance } from 'fastify';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { authenticate } from '@/shared/middleware';

export async function paymentsRoutes(app: FastifyInstance): Promise<void> {
  const ctrl = new PaymentsController(new PaymentsService());
  const auth = { preHandler: [authenticate] };

  app.get('/', { ...auth, schema: { tags: ['Payments'] } }, ctrl.list.bind(ctrl));
  app.post('/', { ...auth, schema: { tags: ['Payments'] } }, ctrl.create.bind(ctrl));
  app.get('/:id', { ...auth, schema: { tags: ['Payments'] } }, ctrl.getOne.bind(ctrl));

  // M-Pesa STK Push callback — no auth, verified by Safaricom IP whitelist
  app.post('/callbacks/mpesa', {
    schema: { tags: ['Payments'], description: 'M-Pesa STK Push callback endpoint' },
  }, ctrl.mpesaCallback.bind(ctrl));
}
