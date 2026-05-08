import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { env } from './env.js'
import type { Database } from '../shared/types/database.js'

// Public client — respects RLS, uses anon key
export const supabase: SupabaseClient<Database> = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-app-name': 'farmpoa-backend' } },
  }
)

// Admin client — bypasses RLS, uses service role (server-side only!)
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'x-app-name': 'farmpoa-backend-admin' } },
  }
)

// Create a client scoped to a specific user JWT (inherits their RLS context)
export function createUserClient(jwt: string): SupabaseClient<Database> {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
        'x-app-name': 'farmpoa-backend',
      },
    },
  })
}
