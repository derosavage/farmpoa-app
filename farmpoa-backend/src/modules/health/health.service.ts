import type { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '../../shared/errors/AppError.js'
import { buildPagination } from '../../shared/validators/common.js'
import { createModuleLogger } from '../../config/logger.js'
import type { Database } from '../../shared/types/database.js'
import type { CreateHealthRecordInput } from './health.schema.js'

const log = createModuleLogger('health-service')

export function createHealthService(db: SupabaseClient<Database>) {
  return {
    async list(animalId: string, page: number, limit: number) {
      const offset = (page - 1) * limit
      const { data, count, error } = await db
        .from('health_records')
        .select('*, users!vet_id(full_name, phone)', { count: 'exact' })
        .eq('animal_id', animalId)
        .is('deleted_at', null)
        .order('visit_date', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw Errors.internal('Failed to fetch health records')
      return { data: data ?? [], pagination: buildPagination(page, limit, count ?? 0) }
    },

    async create(input: CreateHealthRecordInput, vetId: string, adminDb: SupabaseClient<Database>) {
      const { data, error } = await adminDb.from('health_records').insert({
        ...input,
        vet_id: vetId,
        medications: input.medications as unknown ?? null,
        status: 'draft',
      }).select().single()

      if (error) {
        log.error({ error }, 'Failed to create health record')
        throw Errors.internal('Failed to save health record')
      }

      log.info({ recordId: data.id, animalId: input.animal_id, vetId }, 'Health record created')
      return data
    },

    async update(id: string, updates: object) {
      const { data, error } = await db
        .from('health_records')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error || !data) throw Errors.notFound('Health record', id)
      return data
    },

    async listFollowUps(farmId: string) {
      const { data, error } = await db
        .from('health_records')
        .select('*, animals(tag_id, name, species)')
        .eq('farm_id', farmId)
        .not('follow_up_at', 'is', null)
        .gte('follow_up_at', new Date().toISOString())
        .is('deleted_at', null)
        .order('follow_up_at', { ascending: true })
        .limit(50)

      if (error) throw Errors.internal('Failed to fetch follow-ups')
      return data ?? []
    },
  }
}
