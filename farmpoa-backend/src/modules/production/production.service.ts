import type { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '../../shared/errors/AppError.js'
import { createModuleLogger } from '../../config/logger.js'
import type { Database } from '../../shared/types/database.js'
import type { CreateProductionInput } from './production.schema.js'
import dayjs from 'dayjs'

const log = createModuleLogger('production-service')

export function createProductionService(db: SupabaseClient<Database>) {
  return {
    async logProduction(input: CreateProductionInput, userId: string) {
      const { data, error } = await db.from('production_records').insert({
        ...input,
        recorded_by: userId,
      }).select().single()

      if (error) {
        log.error({ error }, 'Failed to log production')
        throw Errors.internal('Failed to save production record')
      }
      return data
    },

    async getFarmSummary(farmId: string, from?: string, to?: string, metric?: string) {
      const { data, error } = await db.from('v_farm_production_30d').select('*').eq('farm_id', farmId)
      if (error) throw Errors.internal('Failed to fetch production summary')
      return metric ? data?.filter(r => r.metric === metric) : data
    },

    async getAnimalTimeline(animalId: string, from: string, to: string, metric?: string) {
      let q = db
        .from('production_records')
        .select('*')
        .eq('animal_id', animalId)
        .gte('log_date', from)
        .lte('log_date', to)
        .is('deleted_at', null)
        .order('log_date', { ascending: true })

      if (metric) q = q.eq('metric', metric)

      const { data, error } = await q
      if (error) throw Errors.internal('Failed to fetch production timeline')
      return data ?? []
    },
  }
}
