/**
 * Alerts service. Supabase when configured, else demo fallback.
 * Exposes a UI-friendly AlertVM plus resolve/assign mutations (Phase 7).
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { AlertRow, AlertType, AlertSeverity, AlertStatus } from '@/lib/supabase/types'
import { logAudit } from './auditService'

export interface AlertVM {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  recommendedAction: string | null
  status: AlertStatus
  laneCode: string | null
  shipmentNumber: string | null
  nodeName: string | null
  assignedTo: string | null
  assignedToName: string | null
  createdAt: string
  resolvedAt: string | null
}

type AlertJoined = AlertRow & {
  lane?: { code: string } | null
  shipment?: { shipment_number: string } | null
  node?: { name: string | null; code: string | null } | null
  assignee?: { first_name: string; last_name: string } | null
}

function mapAlert(row: AlertJoined): AlertVM {
  return {
    id: row.id,
    type: row.type,
    severity: row.severity,
    title: row.title,
    message: row.message ?? '',
    recommendedAction: row.recommended_action,
    status: row.status,
    laneCode: row.lane?.code ?? null,
    shipmentNumber: row.shipment?.shipment_number ?? null,
    nodeName: row.node?.name ?? row.node?.code ?? null,
    assignedTo: row.assigned_to,
    assignedToName: row.assignee ? `${row.assignee.first_name} ${row.assignee.last_name}` : null,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
  }
}

const ALERT_SELECT =
  '*, lane:lanes(code), shipment:shipments(shipment_number), node:nodes(name,code), assignee:profiles!alerts_assigned_to_fkey(first_name,last_name)'

// ----- demo fallback ------------------------------------------------
function demoAlerts(): AlertVM[] {
  const base = (over: Partial<AlertVM>): AlertVM => ({
    id: '', type: 'temperature', severity: 'info', title: '', message: '', recommendedAction: null,
    status: 'open', laneCode: null, shipmentNumber: null, nodeName: null, assignedTo: null,
    assignedToName: null, createdAt: '2024-03-15T16:00:00Z', resolvedAt: null, ...over,
  })
  return [
    base({ id: 'A1', type: 'temperature', severity: 'critical', title: 'Temperature deviation on RTM → SHA', message: 'Current temperature 11.3°C exceeds maximum threshold of 8°C', recommendedAction: 'Contact carrier immediately and generate a temperature deviation report', laneCode: 'LN-003', shipmentNumber: 'SH-48188', nodeName: 'Open Ocean Transit', createdAt: '2024-03-15T16:45:00Z' }),
    base({ id: 'A2', type: 'certification', severity: 'warning', title: 'GDP certification missing at Shanghai Customs', message: 'Responsible company has no verified GDP certificate for pharma cold-chain', recommendedAction: 'Verify GDP certification for the Shanghai customs node', laneCode: 'LN-003', nodeName: 'Shanghai Customs', createdAt: '2024-03-15T16:30:00Z' }),
    base({ id: 'A3', type: 'customs', severity: 'warning', title: 'Customs delay at LAX', message: 'Shipment delayed 4h pending customs clearance', recommendedAction: 'Escalate to the customs broker', laneCode: 'LN-008', shipmentNumber: 'SH-48212', createdAt: '2024-03-15T16:12:00Z' }),
    base({ id: 'A4', type: 'delay', severity: 'info', title: 'Shipment departed from Mumbai', message: 'SH-48211 left Mumbai (BOM) via Emirates SkyCargo', laneCode: 'LN-004', shipmentNumber: 'SH-48211', status: 'resolved', createdAt: '2024-03-15T15:30:00Z' }),
    base({ id: 'A5', type: 'certification', severity: 'info', title: 'GDP audit completed', message: 'Q1 GDP audit passed with 0 findings', laneCode: 'LN-007', status: 'resolved', createdAt: '2024-03-15T13:20:00Z' }),
    base({ id: 'A6', type: 'delay', severity: 'info', title: 'Shipment arrived Tokyo NRT', message: 'SH-48150 arrived — all parameters within spec', laneCode: 'LN-005', shipmentNumber: 'SH-48150', status: 'resolved', createdAt: '2024-03-15T10:30:00Z' }),
  ]
}

export async function getAlerts(): Promise<AlertVM[]> {
  if (!isSupabaseConfigured()) return demoAlerts()
  const sb = getSupabase()!
  const { data, error } = await sb.from('alerts').select(ALERT_SELECT).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as AlertJoined[] ?? []).map(mapAlert)
}

export async function getAlertsForLane(laneCode: string): Promise<AlertVM[]> {
  const all = await getAlerts()
  return all.filter(a => a.laneCode === laneCode)
}

export async function getOpenAlertCount(): Promise<number> {
  const all = await getAlerts()
  return all.filter(a => a.status === 'open' || a.status === 'assigned').length
}

// ---- mutations ----------------------------------------------------
export async function assignAlert(alertId: string, profileId: string, profileName: string, actorId?: string): Promise<void> {
  if (!isSupabaseConfigured()) return // demo: handled optimistically by caller
  const sb = getSupabase()!
  const { error } = await sb.from('alerts').update({ assigned_to: profileId, status: 'assigned' } as never).eq('id', alertId)
  if (error) throw new Error(error.message)
  await logAudit({ actorId: actorId ?? null, actionType: 'alert_assigned', entityType: 'alert', entityId: alertId, description: `Alert assigned to ${profileName}` })
}

export async function resolveAlert(alertId: string, actorId?: string, note?: string): Promise<void> {
  if (!isSupabaseConfigured()) return // demo: handled optimistically by caller
  const sb = getSupabase()!
  const { error } = await sb.from('alerts').update({
    status: 'resolved', resolved_at: new Date().toISOString(), resolved_by: actorId ?? null,
  } as never).eq('id', alertId)
  if (error) throw new Error(error.message)
  await logAudit({
    actorId: actorId ?? null, actionType: 'alert_resolved', entityType: 'alert', entityId: alertId,
    description: note ? `Alert resolved — ${note}` : 'Alert resolved',
    metadata: note ? { note } : undefined,
  })
}
