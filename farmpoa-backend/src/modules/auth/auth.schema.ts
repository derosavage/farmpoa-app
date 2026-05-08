import { z } from 'zod'
import { e164PhoneSchema, localeSchema } from '../../shared/validators/common.js'

export const sendOtpSchema = z.object({
  body: z.object({
    phone: e164PhoneSchema,
    country: z.string().length(2).default('KE'),
    locale: localeSchema,
  }),
})

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: e164PhoneSchema,
    otp: z.string().length(6).regex(/^\d{6}$/, 'OTP must be 6 digits'),
  }),
})

export const refreshTokenSchema = z.object({
  body: z.object({
    refresh_token: z.string().min(1),
  }),
})

export type SendOtpInput = z.infer<typeof sendOtpSchema>['body']
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>['body']
