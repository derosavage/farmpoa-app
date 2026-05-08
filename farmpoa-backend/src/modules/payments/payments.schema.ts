import { z } from 'zod'
import { uuidSchema, currencySchema } from '../../shared/validators/common.js'

export const createPaymentSchema = z.object({
  body: z.object({
    payee_id: uuidSchema.optional(),
    farm_id: uuidSchema.optional(),
    related_id: uuidSchema.optional(),
    related_table: z.string().max(50).optional(),
    amount: z.number().positive(),
    currency: currencySchema,
    method: z.enum(['mpesa', 'airtel_money', 'cash', 'bank_transfer', 'tigopesa', 'mtn_momo']),
    reference: z.string().max(100).optional(),
    description_en: z.string().max(500).optional(),
    description_sw: z.string().max(500).optional(),
  }),
})

export const mpesaCallbackSchema = z.object({
  body: z.object({
    Body: z.object({
      stkCallback: z.object({
        MerchantRequestID: z.string(),
        CheckoutRequestID: z.string(),
        ResultCode: z.number(),
        ResultDesc: z.string(),
        CallbackMetadata: z.object({
          Item: z.array(z.object({ Name: z.string(), Value: z.unknown() })),
        }).optional(),
      }),
    }),
  }),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>['body']
