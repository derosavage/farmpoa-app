import { supabaseAdmin } from '../../config/supabase.js'
import { Errors } from '../../shared/errors/AppError.js'
import { createModuleLogger } from '../../config/logger.js'
import { env } from '../../config/env.js'
import type { JwtPayload } from '../../shared/types/common.js'
import type { SendOtpInput, VerifyOtpInput } from './auth.schema.js'

const log = createModuleLogger('auth-service')

// In-memory OTP store (use Redis in production)
const otpStore = new Map<string, { otp: string; expiresAt: number; attempts: number }>()

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const AuthService = {
  async sendOtp(input: SendOtpInput): Promise<{ message: string; expiresIn: number }> {
    const { phone, locale } = input

    // Rate limit: max 3 OTPs per phone per 10 minutes
    const existing = otpStore.get(phone)
    if (existing && existing.attempts >= 3 && existing.expiresAt > Date.now()) {
      throw Errors.badRequest('Too many OTP requests. Please wait before requesting again.')
    }

    const otp = generateOtp()
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    otpStore.set(phone, { otp, expiresAt, attempts: (existing?.attempts ?? 0) + 1 })

    // In production: call Africa's Talking SMS API
    if (env.NODE_ENV === 'production') {
      log.info({ phone }, 'Sending OTP via Africa\'s Talking')
      // await smsService.send(phone, locale === 'sw' ? `Msimbo wako: ${otp}` : `Your FarmPOA code: ${otp}`)
    } else {
      log.info({ phone, otp }, 'DEV: OTP generated (not sent via SMS)')
    }

    return { message: 'OTP sent successfully', expiresIn: 600 }
  },

  async verifyOtp(
    input: VerifyOtpInput,
    fastify: { jwt: { sign: (payload: object, opts?: object) => string } }
  ): Promise<{ access_token: string; refresh_token: string; user: object }> {
    const { phone, otp } = input
    const stored = otpStore.get(phone)

    if (!stored || stored.expiresAt < Date.now()) {
      throw Errors.unauthorized('OTP expired. Please request a new one.')
    }

    if (stored.otp !== otp) {
      throw Errors.unauthorized('Invalid OTP. Please check and try again.')
    }

    otpStore.delete(phone)

    // Upsert user in DB
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .upsert({ phone, full_name: phone, role: 'farmer', locale: 'sw', is_active: true, is_verified: true }, { onConflict: 'phone' })
      .select()
      .single()

    if (error || !user) {
      log.error({ error, phone }, 'Failed to upsert user on OTP verify')
      throw Errors.internal('Failed to authenticate user')
    }

    // Update last login
    await supabaseAdmin.from('users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id)

    // Fetch farm IDs
    const { data: farms } = await supabaseAdmin.from('farms').select('id').eq('owner_id', user.id).is('deleted_at', null)

    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      locale: user.locale,
      farmIds: farms?.map(f => f.id) ?? [],
    }

    const access_token = fastify.jwt.sign(payload, { expiresIn: env.JWT_EXPIRES_IN })
    const refresh_token = fastify.jwt.sign({ sub: user.id, type: 'refresh' }, { expiresIn: env.JWT_REFRESH_EXPIRES_IN })

    log.info({ userId: user.id, role: user.role }, 'User authenticated')

    return { access_token, refresh_token, user: { id: user.id, phone: user.phone, role: user.role, locale: user.locale, full_name: user.full_name } }
  },

  async refreshToken(
    refreshToken: string,
    fastify: { jwt: { verify: (token: string) => object; sign: (payload: object, opts?: object) => string } }
  ): Promise<{ access_token: string }> {
    let payload: { sub?: string; type?: string }
    try {
      payload = fastify.jwt.verify(refreshToken) as { sub?: string; type?: string }
    } catch {
      throw Errors.unauthorized('Invalid refresh token')
    }

    if (payload.type !== 'refresh' || !payload.sub) {
      throw Errors.unauthorized('Invalid refresh token type')
    }

    const { data: user } = await supabaseAdmin.from('users').select('*').eq('id', payload.sub).is('deleted_at', null).single()
    if (!user) throw Errors.unauthorized('User not found')

    const { data: farms } = await supabaseAdmin.from('farms').select('id').eq('owner_id', user.id).is('deleted_at', null)

    const newPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: user.id, phone: user.phone, role: user.role, locale: user.locale,
      farmIds: farms?.map(f => f.id) ?? [],
    }

    const access_token = fastify.jwt.sign(newPayload, { expiresIn: env.JWT_EXPIRES_IN })
    return { access_token }
  },
}
