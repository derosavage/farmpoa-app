import { z } from 'zod'
import { uuidSchema, paginationSchema, dateSchema, currencySchema } from '../../shared/validators/common.js'

export const createAnimalSchema = z.object({
  body: z.object({
    farm_id: uuidSchema,
    tag_id: z.string().min(1).max(50),
    name: z.string().max(100).optional(),
    species: z.enum(['cattle', 'goat', 'sheep', 'pig', 'poultry', 'rabbit', 'camel', 'donkey', 'other']),
    breed: z.string().max(100).optional(),
    sex: z.enum(['male', 'female', 'unknown']).default('unknown'),
    dob: dateSchema.optional(),
    dob_estimated: z.boolean().default(false),
    dam_id: uuidSchema.optional(),
    sire_id: uuidSchema.optional(),
    purchase_date: dateSchema.optional(),
    purchase_price: z.number().positive().optional(),
    purchase_currency: currencySchema,
    current_weight_kg: z.number().positive().optional(),
    notes: z.string().max(1000).optional(),
  }),
})

export const updateAnimalSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: createAnimalSchema.shape.body.partial().omit({ farm_id: true }),
})

export const listAnimalsSchema = z.object({
  params: z.object({ farmId: uuidSchema }),
  querystring: paginationSchema.extend({
    species: z.enum(['cattle', 'goat', 'sheep', 'pig', 'poultry', 'rabbit', 'camel', 'donkey', 'other']).optional(),
    health_status: z.enum(['healthy', 'sick', 'quarantined', 'recovering', 'deceased']).optional(),
    search: z.string().optional(),
  }),
})

export const tagLookupSchema = z.object({
  params: z.object({ tagId: z.string().min(1) }),
})

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>['body']
export type UpdateAnimalInput = z.infer<typeof updateAnimalSchema>['body']
export type ListAnimalsQuery = z.infer<typeof listAnimalsSchema>['querystring']
