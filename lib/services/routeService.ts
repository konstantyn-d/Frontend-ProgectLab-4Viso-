/**
 * Route builder persistence. Saves a lane's nodes + segments, recomputes
 * lane risk, and writes an audit entry. No-op (preview only) in demo mode.
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { NodeType, ValidationStatus } from '@/lib/supabase/types'
import { assessLaneRisk, riskLevel, type RiskAssessment, type RiskNodeInput, type RiskCertInfo } from './riskEngine'
import { logAudit } from './auditService'

export interface DraftNode {
  id?: string
  code: string
  name: string
  type: NodeType
  responsibleCompanyId: string | null
  responsibleCompanyName: string | null
  modeFromPrevious: 'air' | 'sea' | 'road' | null
  temperatureControl: boolean
  tempMin: number | null
  tempMax: number | null
  securityLevel: 'low' | 'medium' | 'high' | null
  validationStatus: ValidationStatus
  handlingCapabilities: string[]
  specialConditions: string[]
  latitude: number | null
  longitude: number | null
  certifications: RiskCertInfo[]
}

export interface RouteContext {
  laneCode: string
  tempMin: number
  tempMax: number
  carrierName: string
  carrierGdp: RiskCertInfo
}

function toRiskNodes(nodes: DraftNode[]): RiskNodeInput[] {
  return nodes.map(n => ({
    name: n.name || n.code,
    type: n.type,
    validationStatus: n.validationStatus,
    temperatureControl: n.temperatureControl,
    tempMin: n.tempMin,
    tempMax: n.tempMax,
    securityLevel: n.securityLevel,
    handlingCapabilities: n.handlingCapabilities,
    specialConditions: n.specialConditions,
    certifications: n.certifications,
  }))
}

/** Pure live preview used while editing. */
export function previewRouteRisk(ctx: RouteContext, nodes: DraftNode[]): RiskAssessment {
  return assessLaneRisk({
    laneCode: ctx.laneCode,
    requiredTempMin: ctx.tempMin,
    requiredTempMax: ctx.tempMax,
    carrierName: ctx.carrierName,
    carrierGdp: ctx.carrierGdp,
    nodes: toRiskNodes(nodes),
    package: { goodsType: 'pharma', requiredTempMin: ctx.tempMin, requiredTempMax: ctx.tempMax },
  })
}

const SEGMENT_STATUS_BY_RISK = (score: number): string =>
  score >= 81 ? 'critical' : score >= 61 ? 'temperature_risk' : score >= 31 ? 'delayed' : 'on_track'

/** Persist the route. Returns the recomputed assessment. */
export async function saveRoute(ctx: RouteContext, nodes: DraftNode[], actorId?: string): Promise<RiskAssessment> {
  const risk = previewRouteRisk(ctx, nodes)

  if (!isSupabaseConfigured()) return risk // demo: preview only

  const sb = getSupabase()!
  const { data: laneRow } = await sb.from('lanes').select('id').eq('code', ctx.laneCode).single()
  if (!laneRow) throw new Error('Lane not found')
  const laneId = (laneRow as { id: string }).id

  // replace nodes + segments
  await sb.from('lane_segments').delete().eq('lane_id', laneId)
  await sb.from('nodes').delete().eq('lane_id', laneId)

  const nodeRows = nodes.map((n, i) => ({
    lane_id: laneId, sequence: i + 1, code: n.code, name: n.name,
    location_name: n.name, type: n.type, mode_from_previous: n.modeFromPrevious,
    responsible_company_id: n.responsibleCompanyId, temperature_control: n.temperatureControl,
    temp_min: n.tempMin, temp_max: n.tempMax, security_level: n.securityLevel,
    handling_capabilities: n.handlingCapabilities, special_conditions: n.specialConditions,
    validation_status: n.validationStatus, latitude: n.latitude, longitude: n.longitude,
  }))
  const { data: inserted, error: nodeErr } = await sb.from('nodes').insert(nodeRows as never).select('id, sequence')
  if (nodeErr) throw new Error(nodeErr.message)
  const ids = (inserted as { id: string; sequence: number }[] ?? []).sort((a, b) => a.sequence - b.sequence)

  if (ids.length > 1) {
    const segs = ids.slice(0, -1).map((from, i) => ({
      lane_id: laneId, from_node_id: from.id, to_node_id: ids[i + 1].id, sequence: i + 1,
      mode: nodes[i + 1]?.modeFromPrevious ?? null, status: SEGMENT_STATUS_BY_RISK(risk.score), risk_score: risk.score,
    }))
    const { error: segErr } = await sb.from('lane_segments').insert(segs as never)
    if (segErr) throw new Error(segErr.message)
  }

  const compliance = risk.level === 'low' ? 'compliant' : risk.level === 'medium' ? 'warning' : 'non_compliant'
  await sb.from('lanes').update({
    risk_score: risk.score, risk_level: riskLevel(risk.score), compliance_status: compliance, last_updated: new Date().toISOString(),
  } as never).eq('id', laneId)

  await logAudit({
    actorId: actorId ?? null, actionType: 'route_edited', entityType: 'lane', entityId: laneId, laneId,
    description: `Route edited for ${ctx.laneCode} — ${nodes.length} nodes, risk ${risk.score}% (${risk.level})`,
    metadata: { nodeCount: nodes.length, riskScore: risk.score },
  })

  return risk
}
