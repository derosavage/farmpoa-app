import { z } from 'zod'
import { uuidSchema, paginationSchema, dateTimeSchema, currencySchema } from '../../shared/validators/common.js'

export const createVaccinationSchema = z.object({
  body: z.object({
    animal_id: uuidSchema,
    vaccine_id: uuidSchema,
    scheduled_at: dateTimeSchema,
    administered_at: dateTimeSchema.optional(),
    batch_number: z.string().max(100).optional(),
    dose_given_ml: z.number().positive().optional(),
    injection_site: z.string().max(100).optional(),
    cost: z.number().nonnegative().optional(),
    currency: currencySchema,
    notes: z.string().max(1000).optional(),
  }),
})

export const updateVaccinationSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    status: z.enum(['scheduled', 'administered', 'missed', 'cancelled']).optional(),
    administered_at: dateTimeSchema.optional(),
    batch_number: z.string().max(100).optional(),
    adverse_reaction: z.string().max(500).optional(),
    notes: z.string().max(1000).optional(),
  }),
})

export const listVaccinationsSchema = z.object({
  params: z.object({ animalId: uuidSchema }),
  querystring: paginationSchema,
})

export const dueSoonSchema = z.object({
  params: z.object({ farmId: uuidSchema }),
  querystring: z.object({ days: z.coerce.number().int().min(1).max(90).default(7) }),
})

export type CreateVaccinationInput = z.infer<typeof createVaccinationSchema>['body']
