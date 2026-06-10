/**
 * Audit log service. Supabase when configured, else demo fallback.
 * Reads map DB rows to the existing UI `AuditLogEntry` type.
 * `logAudit` appends compliance-grade entries (used by workflows).
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { AuditLogRow } from '@/lib/supabase/types'
import type { AuditLogEntry } from '@/lib/mock-data'
import { demoAuditLog } from './demoData'

type AuditJoined = AuditLogRow & {
  actor?: { first_name: string; last_name: string } | null
  lane?: { code: string } | null
}

/** Map a free-text DB action_type to the UI action enum + severity. */
function mapAction(actionType: string): { action: AuditLogEntry['action']; severity: AuditLogEntry['severity'] } {
  const a = actionType.toLowerCase()
  if (a.includes('temperature') || a.includes('deviation')) return { action: 'temperature_alert', severity: 'critical' }
  if (a.includes('certification') || a.includes('compliance') || a.includes('report')) return { action: 'compliance_check', severity: 'success' }
  if (a.includes('created')) return { action: 'lane_created', severity: 'info' }
  if (a.includes('route') || a.includes('node') || a.includes('updated') && a.includes('lane')) return { action: 'lane_updated', severity: 'info' }
  if (a.includes('arrived')) return { action: 'shipment_arrived', severity: 'success' }
  if (a.includes('depart') || a.includes('shipment')) return { action: 'shipment_departed', severity: 'info' }
  if (a.includes('alert') && a.includes('resolved')) return { action: 'compliance_check', severity: 'success' }
  return { action: 'lane_updated', severity: 'info' }
}

function mapAudit(row: AuditJoined): AuditLogEntry {
  const { action, severity } = mapAction(row.action_type)
  return {
    id: row.id,
    timestamp: row.created_at,
    userId: row.actor_id ?? '',
    userName: row.actor ? `${row.actor.first_name} ${row.actor.last_name}` : 'System',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action,
    description: row.description ?? '',
    laneId: row.lane?.code ?? '',
    severity,
  }
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured()) return demoAuditLog()
  const sb = getSupabase()!
  const { data, error } = await sb
    .from('audit_logs')
    .select('*, actor:profiles!audit_logs_actor_id_fkey(first_name,last_name), lane:lanes(code)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as AuditJoined[] ?? []).map(mapAudit)
}

// ---- writer (used by alert-resolve, route-save, cert-verify) -------
export interface AuditInput {
  actorId?: string | null
  actionType: string
  entityType?: string
  entityId?: string | null
  laneId?: string | null      // lanes.id (UUID), not code
  shipmentId?: string | null
  description: string
  metadata?: Record<string, unknown>
}

export async function logAudit(input: AuditInput): Promise<void> {
  if (!isSupabaseConfigured()) return // no-op in demo mode
  const sb = getSupabase()!
  const payload = {
    actor_id: input.actorId ?? null,
    action_type: input.actionType,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    lane_id: input.laneId ?? null,
    shipment_id: input.shipmentId ?? null,
    description: input.description,
    metadata: input.metadata ?? {},
  }
  const { error } = await sb.from('audit_logs').insert(payload as never)
  if (error) throw new Error(error.message)
}
