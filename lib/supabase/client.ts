import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

/**
 * Browser Supabase client (anon key).
 *
 * The whole app is designed to run WITHOUT Supabase configured — in that
 * case every service falls back to the bundled demo data. So this module
 * never throws at import time; callers gate on `isSupabaseConfigured()`.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey)
}

let client: SupabaseClient<Database> | null = null

/** Returns a memoized client, or null when env vars are missing. */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) return null
  if (!client) {
    client = createClient<Database>(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  }
  return client
}
