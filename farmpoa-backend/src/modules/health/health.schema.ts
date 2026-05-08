import { z } from 'zod'
import { uuidSchema, paginationSchema, dateTimeSchema, currencySchema } from '../../shared/validators/common.js'

export const createHealthRecordSchema = z.object({
  body: z.object({
    animal_id: uuidSchema,
    farm_id: uuidSchema,
    visit_date: dateTimeSchema.default(() => new Date().toISOString()),
    chief_complaint: z.string().max(500).optional(),
    diagnosis_en: z.string().max(2000).optional(),
    diagnosis_sw: z.string().max(2000).optional(),
    icd_code: z.string().max(20).optional(),
    treatment_en: z.string().max(2000).optional(),
    treatment_sw: z.string().max(2000).optional(),
    medications: z.array(z.object({
      name: z.string(),
      dose: z.string(),
      route: z.string().optional(),
      duration_days: z.number().int().positive().optional(),
    })).optional(),
    temperature_c: z.number().min(30).max(45).optional(),
    weight_kg: z.number().positive().optional(),
    heart_rate_bpm: z.number().int().min(10).max(300).optional(),
    follow_up_at: dateTimeSchema.optional(),
    consult_cost: z.number().nonnegative().optional(),
    currency: currencySchema,
  }),
})

export const updateHealthRecordSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    status: z.enum(['draft', 'confirmed', 'cancelled']).optional(),
    follow_up_at: dateTimeSchema.optional(),
    outcome: z.string().max(500).optional(),
    diagnosis_en: z.string().max(2000).optional(),
    diagnosis_sw: z.string().max(2000).optional(),
  }),
})

export type CreateHealthRecordInput = z.infer<typeof createHealthRecordSchema>['body']
