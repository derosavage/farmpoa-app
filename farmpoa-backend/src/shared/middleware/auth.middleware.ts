import type { FastifyRequest, FastifyReply } from 'fastify'
import { Errors } from '../errors/AppError.js'
import type { JwtPayload, UserRole } from '../types/common.js'
import { createModuleLogger } from '../../config/logger.js'

const log = createModuleLogger('auth-middleware')

// Verifies JWT and attaches user to request
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify()
    const payload = request.user as JwtPayload

    if (!payload.sub) {
      throw Errors.unauthorized('Invalid token payload')
    }
  } catch (err) {
    if (err instanceof Error && err.name === 'AppError') throw err
    log.warn({ err }, 'JWT verification failed')
    throw Errors.unauthorized('Invalid or expired token')
  }
}

// Guard: require specific roles
export function requireRoles(...roles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    await authenticate(request, reply)
    const user = request.user as JwtPayload
    if (!roles.includes(user.role)) {
      throw Errors.forbidden(`Role '${user.role}' cannot access this resource`)
    }
  }
}

// Guard: require admin only
export const requireAdmin = requireRoles('admin')

// Guard: require vet or admin
export const requireVetOrAdmin = requireRoles('veterinarian', 'admin')

// Guard: farmer, vet, or admin (all authenticated users)
export const requireAuth = authenticate
