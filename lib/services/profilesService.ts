/**
 * Profiles service — assignable users for alert assignment etc.
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ProfileRow, Role } from '@/lib/supabase/types'

export interface ProfileVM {
  id: string
  name: string
  role: Role
}

const DEMO_PROFILES: ProfileVM[] = [
  { id: 'demo-sarah', name: 'Sarah Chen', role: 'admin' },
  { id: 'demo-elena', name: 'Elena Rodriguez', role: 'compliance_officer' },
  { id: 'demo-marcus', name: 'Marcus Weber', role: 'operations_manager' },
  { id: 'demo-anna', name: 'Anna Kowalski', role: 'validator' },
  { id: 'demo-james', name: 'James Liu', role: 'compliance_officer' },
]

export async function getProfiles(): Promise<ProfileVM[]> {
  if (!isSupabaseConfigured()) return DEMO_PROFILES
  const sb = getSupabase()!
  const { data, error } = await sb.from('profiles').select('id, first_name, last_name, role').order('first_name')
  if (error) throw new Error(error.message)
  return (data as Pick<ProfileRow, 'id' | 'first_name' | 'last_name' | 'role'>[] ?? []).map(p => ({
    id: p.id,
    name: `${p.first_name} ${p.last_name}`,
    role: p.role,
  }))
}
