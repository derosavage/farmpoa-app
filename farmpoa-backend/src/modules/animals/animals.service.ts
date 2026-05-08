import type { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '../../shared/errors/AppError.js'
import { buildPagination } from '../../shared/validators/common.js'
import { createModuleLogger } from '../../config/logger.js'
import type { Database } from '../../shared/types/database.js'
import type { CreateAnimalInput, UpdateAnimalInput, ListAnimalsQuery } from './animals.schema.js'

const log = createModuleLogger('animals-service')

export function createAnimalsService(db: SupabaseClient<Database>) {
  return {
    async list(farmId: string, query: ListAnimalsQuery) {
      const { page, limit, species, health_status, search, order } = query
      const offset = (page - 1) * limit

      let q = db
        .from('animals')
        .select('*', { count: 'exact' })
        .eq('farm_id', farmId)
        .is('deleted_at', null)
        .eq('is_active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: order === 'asc' })

      if (species) q = q.eq('species', species)
      if (health_status) q = q.eq('health_status', health_status)
      if (search) q = q.ilike('tag_id', `%${search}%`)

      const { data, count, error } = await q
      if (error) {
        log.error({ error, farmId }, 'Failed to list animals')
        throw Errors.internal('Failed to fetch animals')
      }

      return { data: data ?? [], pagination: buildPagination(page, limit, count ?? 0) }
    },

    async findById(id: string) {
      const { data, error } = await db
        .from('animals')
        .select('*, vaccinations(id, status, next_due_at, vaccines(name_en, name_sw)), health_records(id, visit_date, diagnosis_en, status)')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error || !data) throw Errors.notFound('Animal', id)
      return data
    },

    async findByTag(tagId: string) {
      const { data, error } = await db
        .from('animals')
        .select('*, farms(name, owner_id)')
        .eq('tag_id', tagId)
        .is('deleted_at', null)
        .single()

      if (error || !data) throw Errors.notFound('Animal with tag', tagId)
      return data
    },

    async create(input: CreateAnimalInput, userId: string) {
      // Verify farm exists and user has access
      const { data: farm } = await db.from('farms').select('id, owner_id').eq('id', input.farm_id).is('deleted_at', null).single()
      if (!farm) throw Errors.notFound('Farm', input.farm_id)

      const { data, error } = await db.from('animals').insert({
        ...input,
        is_active: true,
        health_status: 'healthy',
      }).select().single()

      if (error) {
        if (error.code === '23505') throw Errors.conflict(`Tag ID '${input.tag_id}' already exists on this farm`)
        log.error({ error, input }, 'Failed to create animal')
        throw Errors.internal('Failed to register animal')
      }

      log.info({ animalId: data.id, tagId: input.tag_id, userId }, 'Animal registered')
      return data
    },

    async update(id: string, input: UpdateAnimalInput) {
      const { data, error } = await db
        .from('animals')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error || !data) throw Errors.notFound('Animal', id)
      return data
    },

    async softDelete(id: string, userId: string) {
      const { error } = await db
        .from('animals')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', id)
        .is('deleted_at', null)

      if (error) throw Errors.notFound('Animal', id)
      log.info({ animalId: id, userId }, 'Animal soft-deleted')
      return { message: 'Animal removed successfully' }
    },
  }
}

export type AnimalsService = ReturnType<typeof createAnimalsService>
