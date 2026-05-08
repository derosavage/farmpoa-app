import { z } from 'zod'

export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' })

export const e164PhoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (e.g. +254712345678)')

export const localeSchema = z.enum(['en', 'sw', 'am', 'rw', 'lg', 'om']).default('sw')
export const currencySchema = z.string().length(3).default('KES')

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
export const dateTimeSchema = z.string().datetime({ message: 'Must be ISO 8601 datetime' })

const EA_COUNTRY_CODES: Record<string, string> = {
  KE: '+254', TZ: '+255', UG: '+256', RW: '+250', ET: '+251', SS: '+211',
}

export function normalisePhone(phone: string, countryCode = 'KE'): string {
  if (phone.startsWith('+')) return phone
  const stripped = phone.replace(/^0+/, '')
  const prefix = EA_COUNTRY_CODES[countryCode] ?? '+254'
  return `${prefix}${stripped}`
}

export function buildPagination(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit)
  return { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
}
