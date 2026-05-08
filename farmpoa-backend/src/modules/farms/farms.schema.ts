import { z } from 'zod'
import { uuidSchema, paginationSchema } from '../../shared/validators/common.js'

export const createFarmSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(1000).optional(),
    county: z.string().max(100).optional(),
    sub_county: z.string().max(100).optional(),
    ward: z.string().max(100).optional(),
    country: z.string().length(2).default('KE'),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    size_hectares: z.number().positive().optional(),
    registration_no: z.string().max(100).optional(),
  }),
})

export const updateFarmSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: createFarmSchema.shape.body.partial(),
})

export type CreateFarmInput = z.infer<typeof createFarmSchema>['body']
export type UpdateFarmInput = z.infer<typeof updateFarmSchema>['body']
