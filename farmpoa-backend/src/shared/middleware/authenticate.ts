import type { FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors/AppError';
import type { JwtPayload, UserRole } from '../types';

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch {
    throw AppError.unauthorized('Invalid or expired token');
  }
}

export function requireRole(...roles: UserRole[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await authenticate(request, reply);
    const user = request.user as JwtPayload;
    if (!roles.includes(user.role)) {
      throw AppError.forbidden(`Requires role: ${roles.join(' or ')}`);
    }
  };
}

export function requireOwnershipOrRole(
  getResourceOwnerId: (req: FastifyRequest) => Promise<string | null>,
  ...fallbackRoles: UserRole[]
) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await authenticate(request, reply);
    const user = request.user as JwtPayload;
    if (fallbackRoles.includes(user.role)) return;

    const ownerId = await getResourceOwnerId(request);
    if (!ownerId || ownerId !== user.sub) {
      throw AppError.forbidden('You do not have access to this resource');
    }
  };
}
