import type { FastifyRequest, FastifyReply } from 'fastify'
import type { Database, UserRole, LocaleCode } from './database.types'

// ─── Authenticated Request ────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  phone: string
  role: UserRole
  locale: LocaleCode
  farmIds: string[]  // pre-loaded farm IDs for RLS helpers
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthUser
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── API Response wrappers ────────────────────────────────────────────────────
export interface ApiSuccess<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  requestId?: string
}

// ─── Controller handler types ─────────────────────────────────────────────────
export type Handler = (req: FastifyRequest, reply: FastifyReply) => Promise<void>

// ─── Row types (convenience aliases) ─────────────────────────────────────────
export type UserRow        = Database['public']['Tables']['users']['Row']
export type FarmRow        = Database['public']['Tables']['farms']['Row']
export type AnimalRow      = Database['public']['Tables']['animals']['Row']
export type VaccinationRow = Database['public']['Tables']['vaccinations']['Row']
export type HealthRecordRow = Database['public']['Tables']['health_records']['Row']
export type ProductionRow  = Database['public']['Tables']['production_records']['Row']
export type ReminderRow    = Database['public']['Tables']['reminders']['Row']
export type PaymentRow     = Database['public']['Tables']['payments']['Row']
export type VetAssignmentRow = Database['public']['Tables']['vet_assignments']['Row']
