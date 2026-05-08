import type { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { authenticate } from '@/shared/middleware';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const service = new AuthService(app);
  const controller = new AuthController(service);

  // Public routes
  app.post('/otp/send', {
    schema: { tags: ['Auth'], description: 'Send OTP to phone number' },
    handler: controller.sendOtp.bind(controller),
  });

  app.post('/otp/verify', {
    schema: { tags: ['Auth'], description: 'Verify OTP and receive JWT tokens' },
    handler: controller.verifyOtp.bind(controller),
  });

  app.post('/refresh', {
    schema: { tags: ['Auth'], description: 'Refresh access token' },
    handler: controller.refreshToken.bind(controller),
  });

  app.post('/register', {
    schema: { tags: ['Auth'], description: 'Register a new user (then verify via OTP)' },
    handler: controller.register.bind(controller),
  });

  // Protected routes
  app.get('/me', {
    schema: { tags: ['Auth'], description: 'Get current authenticated user' },
    preHandler: [authenticate],
    handler: controller.getMe.bind(controller),
  });
}
