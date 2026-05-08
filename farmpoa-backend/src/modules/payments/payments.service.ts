import type { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '../../shared/errors/AppError.js'
import { buildPagination } from '../../shared/validators/common.js'
import { createModuleLogger } from '../../config/logger.js'
import type { Database } from '../../shared/types/database.js'
import type { CreatePaymentInput } from './payments.schema.js'

const log = createModuleLogger('payments-service')

export function createPaymentsService(db: SupabaseClient<Database>) {
  return {
    async list(userId: string, page: number, limit: number) {
      const offset = (page - 1) * limit
      const { data, count, error } = await db
        .from('payments')
        .select('*', { count: 'exact' })
        .or(`payer_id.eq.${userId},payee_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw Errors.internal('Failed to fetch payments')
      return { data: data ?? [], pagination: buildPagination(page, limit, count ?? 0) }
    },

    async create(input: CreatePaymentInput, payerId: string) {
      const { data, error } = await db.from('payments').insert({
        ...input,
        payer_id: payerId,
        status: 'pending',
      }).select().single()

      if (error) {
        log.error({ error }, 'Failed to create payment')
        throw Errors.internal('Failed to initiate payment')
      }

      log.info({ paymentId: data.id, amount: input.amount, currency: input.currency, method: input.method }, 'Payment initiated')
      return data
    },

    async handleMpesaCallback(checkoutRequestId: string, resultCode: number, metadata: Array<{Name: string; Value: unknown}>) {
      const mpesaRef = metadata?.find(i => i.Name === 'MpesaReceiptNumber')?.Value as string | undefined

      const status = resultCode === 0 ? 'completed' : 'failed'

      const { data, error } = await db
        .from('payments')
        .update({
          status,
          provider_ref: mpesaRef,
          provider_response: { resultCode, metadata },
          paid_at: status === 'completed' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('reference', checkoutRequestId)
        .select()
        .single()

      if (error) log.error({ error, checkoutRequestId }, 'Failed to update payment from M-Pesa callback')
      else log.info({ paymentId: data?.id, status, mpesaRef }, 'M-Pesa callback processed')

      return data
    },
  }
}
