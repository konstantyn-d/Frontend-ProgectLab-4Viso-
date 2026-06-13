/**
 * Dashboard layout persistence.
 *
 * Saves the react-grid-layout JSON per user + dashboard. Uses Supabase
 * (table user_dashboard_layouts) when available, and ALWAYS mirrors to
 * localStorage so the feature works instantly even before the migration is
 * run / without auth. Reads prefer Supabase, falling back to localStorage.
 */
import type { ResponsiveLayouts } from 'react-grid-layout'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { UserDashboardLayoutRow } from '@/lib/supabase/types'

/** Fixed demo profile id until real auth is wired (structured for future auth). */
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
export const DEFAULT_DASHBOARD_KEY = 'main_dashboard'

const lsKey = (dashboardKey: string) => `pharmatrack-dashboard-layout:${dashboardKey}`

function readLocal(dashboardKey: string): ResponsiveLayouts | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(lsKey(dashboardKey))
    return raw ? (JSON.parse(raw) as ResponsiveLayouts) : null
  } catch { return null }
}

function writeLocal(dashboardKey: string, layout: ResponsiveLayouts | null) {
  if (typeof window === 'undefined') return
  try {
    if (layout) window.localStorage.setItem(lsKey(dashboardKey), JSON.stringify(layout))
    else window.localStorage.removeItem(lsKey(dashboardKey))
  } catch { /* ignore quota / privacy errors */ }
}

export async function getDashboardLayout(
  userId: string = DEMO_USER_ID,
  dashboardKey: string = DEFAULT_DASHBOARD_KEY,
): Promise<ResponsiveLayouts | null> {
  if (isSupabaseConfigured()) {
    try {
      const sb = getSupabase()!
      const { data, error } = await sb
        .from('user_dashboard_layouts')
        .select('layout')
        .eq('user_id', userId)
        .eq('dashboard_key', dashboardKey)
        .maybeSingle()
      if (!error && data) return (data as Pick<UserDashboardLayoutRow, 'layout'>).layout as ResponsiveLayouts
    } catch { /* table missing / network — fall through to localStorage */ }
  }
  return readLocal(dashboardKey)
}

export async function saveDashboardLayout(
  layout: ResponsiveLayouts,
  userId: string = DEMO_USER_ID,
  dashboardKey: string = DEFAULT_DASHBOARD_KEY,
): Promise<void> {
  writeLocal(dashboardKey, layout) // always mirror locally
  if (!isSupabaseConfigured()) return
  try {
    const sb = getSupabase()!
    const { error } = await sb
      .from('user_dashboard_layouts')
      .upsert({ user_id: userId, dashboard_key: dashboardKey, layout } as never, { onConflict: 'user_id,dashboard_key' })
    if (error) throw new Error(error.message)
  } catch (e) {
    // Supabase unavailable (e.g. migration not run) — localStorage already
    // holds the layout, so the save still "took". Surface as a soft warning.
    throw new Error('cloud-unavailable:' + (e instanceof Error ? e.message : 'unknown'))
  }
}

export async function resetDashboardLayout(
  userId: string = DEMO_USER_ID,
  dashboardKey: string = DEFAULT_DASHBOARD_KEY,
): Promise<void> {
  writeLocal(dashboardKey, null)
  if (!isSupabaseConfigured()) return
  try {
    const sb = getSupabase()!
    await sb.from('user_dashboard_layouts').delete().eq('user_id', userId).eq('dashboard_key', dashboardKey)
  } catch { /* localStorage already cleared */ }
}
