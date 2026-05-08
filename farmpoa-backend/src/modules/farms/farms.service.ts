import type { SupabaseClient } from '@supabase/supabase-js'
import { Errors } from '../../shared/errors/AppError.js'
import { buildPagination } from '../../shared/validators/common.js'
import { createModuleLogger } from '../../config/logger.js'
import type { Database } from '../../shared/types/database.js'
import type { CreateFarmInput, UpdateFarmInput } from './farms.schema.js'

const log = createModuleLogger('farms-service')

export function createFarmsService(db: SupabaseClient<Database>) {
  return {
    async listMyFarms(userId: string, page: number, limit: number) {
      const offset = (page - 1) * limit
      const { data, count, error } = await db
        .from('farms')
        .select('*, animals(count)', { count: 'exact' })
        .eq('owner_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw Errors.internal('Failed to fetch farms')
      return { data: data ?? [], pagination: buildPagination(page, limit, count ?? 0) }
    },

    async findById(id: string) {
      const { data, error } = await db
        .from('farms')
        .select('*, users!owner_id(full_name, phone)')
        .eq('id', id)
        .is('deleted_at', null)
        .single()

      if (error || !data) throw Errors.notFound('Farm', id)
      return data
    },

    async create(input: CreateFarmInput, userId: string) {
      const { data, error } = await db.from('farms').insert({
        ...input,
        owner_id: userId,
        is_active: true,
      }).select().single()

      if (error) {
        log.error({ error }, 'Failed to create farm')
        throw Errors.internal('Failed to create farm')
      }

      log.info({ farmId: data.id, userId }, 'Farm created')
      return data
    },

    async update(id: string, input: UpdateFarmInput) {
      const { data, error } = await db
        .from('farms')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .is('deleted_at', null)
        .select()
        .single()

      if (error || !data) throw Errors.notFound('Farm', id)
      return data
    },

    async softDelete(id: string, userId: string) {
      const { error } = await db
        .from('farms')
        .update({ deleted_at: new Date().toISOString(), is_active: false })
        .eq('id', id)
        .eq('owner_id', userId)
        .is('deleted_at', null)

      if (error) throw Errors.notFound('Farm', id)
      log.info({ farmId: id, userId }, 'Farm soft-deleted')
      return { message: 'Farm deleted successfully' }
    },
  }
}
