import type { FastifyInstance } from 'fastify';
import { UssdService } from './ussd.service';
import { AppError } from '@/shared/errors/AppError';

export async function ussdRoutes(app: FastifyInstance): Promise<void> {
  const service = new UssdService();

  // Africa's Talking posts form-encoded data
  app.post('/', {
    schema: { tags: ['USSD'], description: "Africa's Talking USSD callback" },
  }, async (request, reply) => {
    const body = request.body as Record<string, string>;
    if (!body.sessionId || !body.phoneNumber) {
      throw AppError.badRequest('Missing USSD fields');
    }
    const response = await service.handle({
      sessionId: body.sessionId,
      serviceCode: body.serviceCode ?? '',
      phoneNumber: body.phoneNumber,
      text: body.text ?? '',
    });
    return reply
      .header('Content-Type', 'text/plain')
      .status(200)
      .send(response);
  });
}
