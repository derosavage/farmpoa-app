import type { FastifyRequest } from 'fastify'

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationQuery {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// ─── Auth context ─────────────────────────────────────────────────────────────
export interface JwtPayload {
  sub: string          // user UUID
  phone: string
  role: UserRole
  locale: LocaleCode
  farmIds: string[]    // farms this user owns
  iat: number
  exp: number
}

export type UserRole = 'farmer' | 'veterinarian' | 'admin' | 'field_agent'
export type LocaleCode = 'en' | 'sw' | 'am' | 'rw' | 'lg' | 'om'

// ─── Request augmentation ─────────────────────────────────────────────────────
export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload
  accessToken: string
}

// ─── API Response shape ───────────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─── Supabase result helpers ──────────────────────────────────────────────────
export type SupabaseResult<T> = { data: T; error: null } | { data: null; error: { message: string; code?: string } }

// ─── i18n ─────────────────────────────────────────────────────────────────────
export interface I18nText {
  en: string
  sw?: string
}
