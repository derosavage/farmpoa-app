import type { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '../../shared/errors/AppError.js'
import { buildPagination } from '../../shared/validators/common.js'
import { createModuleLogger } from '../../config/logger.js'
import type { Database } from '../../shared/types/database.js'
import type { CreateVaccinationInput } from './vaccinations.schema.js'

const log = createModuleLogger('vaccinations-service')

export function createVaccinationsService(db: SupabaseClient<Database>) {
  return {
    async list(animalId: string, page: number, limit: number) {
      const offset = (page - 1) * limit
      const { data, count, error } = await db
        .from('vaccinations')
        .select('*, vaccines(name_en, name_sw, interval_days), users(full_name, phone)', { count: 'exact' })
        .eq('animal_id', animalId)
        .is('deleted_at', null)
        .order('scheduled_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw Errors.internal('Failed to fetch vaccinations')
      return { data: data ?? [], pagination: buildPagination(page, limit, count ?? 0) }
    },

    async dueSoon(farmId: string, days: number) {
      const { data, error } = await db
        .from('v_vaccinations_due')
        .select('*')
        .filter('next_due_at', 'lte', new Date(Date.now() + days * 86400000).toISOString())
        .order('next_due_at', { ascending: true })

      if (error) throw Errors.internal('Failed to fetch due vaccinations')
      return data ?? []
    },

    async create(input: CreateVaccinationInput, adminDb: SupabaseClient<Database>) {
      const { data: animal } = await db.from('animals').select('id, farm_id').eq('id', input.animal_id).single()
      if (!animal) throw Errors.notFound('Animal', input.animal_id)

      const { data, error } = await adminDb.from('vaccinations').insert({
        ...input,
        status: input.administered_at ? 'administered' : 'scheduled',
      }).select('*, vaccines(name_en, name_sw)').single()

      if (error) {
        log.error({ error }, 'Failed to create vaccination record')
        throw Errors.internal('Failed to record vaccination')
      }

      log.info({ vaccinationId: data.id, animalId: input.animal_id }, 'Vaccination recorded')
      return data
    },

    async update(id: string, updates: object) {
      const { data, error } = await db
        .from('vaccinations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error || !data) throw Errors.notFound('Vaccination', id)
      return data
    },
  }
}
