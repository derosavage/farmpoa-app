import { z } from 'zod'
import { uuidSchema, dateSchema } from '../../shared/validators/common.js'

export const createProductionSchema = z.object({
  body: z.object({
    animal_id: uuidSchema,
    farm_id: uuidSchema,
    log_date: dateSchema.default(() => new Date().toISOString().split('T')[0]!),
    metric: z.enum(['milk_litres', 'eggs_count', 'weight_kg', 'wool_kg', 'honey_kg', 'meat_kg']),
    value: z.number().nonnegative(),
    quality_grade: z.enum(['A', 'B', 'C']).optional(),
    session: z.enum(['morning', 'evening', 'daily']).optional(),
    notes: z.string().max(500).optional(),
  }),
})

export const farmSummarySchema = z.object({
  params: z.object({ farmId: uuidSchema }),
  querystring: z.object({
    from: dateSchema.optional(),
    to: dateSchema.optional(),
    metric: z.enum(['milk_litres', 'eggs_count', 'weight_kg', 'wool_kg', 'honey_kg', 'meat_kg']).optional(),
    group_by: z.enum(['day', 'week', 'month']).default('day'),
  }),
})

export type CreateProductionInput = z.infer<typeof createProductionSchema>['body']
