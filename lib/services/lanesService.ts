/**
 * Lanes data service. Supabase when configured, else demo fallback.
 * Maps DB rows to the existing UI `Lane` type so components are unchanged.
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { LaneRow, NodeRow, LaneSegmentRow, ShipmentRow, CompanyRow, CertificationRow, TemperatureReadingRow } from '@/lib/supabase/types'
import type { Lane, TransportMode, LaneStatus } from '@/lib/mock-data'
import { demoLanes } from './demoData'
import { assessLaneRisk, type RiskAssessment, type RiskNodeInput, type RiskCertInfo } from './riskEngine'

function mapMode(mode: string): TransportMode {
  return mode === 'multi' ? 'multimodal' : (mode as TransportMode)
}

function mapStatus(status: string): LaneStatus {
  if (status === 'in_transit') return 'in-transit'
  if (status === 'delivered') return 'arrived'
  if (status === 'archived') return 'arrived'
  return status as LaneStatus
}

function milestoneFor(status: string, progress: number): Lane['milestone'] {
  if (status === 'delivered' || progress >= 100) return 'arrived'
  if (status === 'customs') return 'customs'
  if (status === 'active') return 'departure'
  return 'in-transit'
}

function mapLane(row: LaneRow, carrierName: string, currentTemp: number, tempDeviation: boolean): Lane {
  return {
    id: row.code,
    origin: row.origin_name ?? row.origin_code,
    originCode: row.origin_code,
    destination: row.destination_name ?? row.destination_code,
    destinationCode: row.destination_code,
    carrier: carrierName,
    mode: mapMode(row.mode),
    status: mapStatus(row.status),
    currentTemp,
    tempMin: row.required_temp_min ?? 2,
    tempMax: row.required_temp_max ?? 8,
    tempDeviation,
    gdpCompliant: row.compliance_status === 'compliant',
    riskScore: row.risk_score,
    progress: row.progress,
    milestone: milestoneFor(row.status, row.progress),
    lastUpdated: row.last_updated,
  }
}

type LaneWithCarrier = LaneRow & { carrier?: { name: string } | null }

/** Representative temperature per lane, from its shipments. */
function tempByLane(shipments: Pick<ShipmentRow, 'lane_id' | 'current_temp' | 'status'>[]): Map<string, number> {
  const byLane = new Map<string, number>()
  const priority: Record<string, number> = { delayed: 3, in_transit: 2, customs: 2, loading: 1, arrived: 1, delivered: 1 }
  const best = new Map<string, number>()
  for (const s of shipments) {
    if (!s.lane_id || s.current_temp == null) continue
    const p = priority[s.status] ?? 0
    if (!best.has(s.lane_id) || p > (best.get(s.lane_id) as number)) {
      best.set(s.lane_id, p)
      byLane.set(s.lane_id, s.current_temp)
    }
  }
  return byLane
}

export async function getLanes(): Promise<Lane[]> {
  if (!isSupabaseConfigured()) return demoLanes()
  const sb = getSupabase()!
  const [{ data: lanes, error }, { data: shipments }] = await Promise.all([
    sb.from('lanes').select('*, carrier:companies(name)').order('code'),
    sb.from('shipments').select('lane_id,current_temp,status'),
  ])
  if (error) throw new Error(error.message)
  const temps = tempByLane(shipments ?? [])
  return (lanes as LaneWithCarrier[] ?? []).map(row => {
    const t = temps.get(row.id)
    const currentTemp = t ?? Number(((row.required_temp_min ?? 2) + (row.required_temp_max ?? 8)) / 2)
    const tempDeviation = row.required_temp_max != null && currentTemp > row.required_temp_max
    return mapLane(row, row.carrier?.name ?? 'Unknown carrier', currentTemp, tempDeviation)
  })
}

export async function getLaneByCode(code: string): Promise<Lane | null> {
  if (!isSupabaseConfigured()) return demoLanes().find(l => l.id === code) ?? null
  const sb = getSupabase()!
  const { data, error } = await sb.from('lanes').select('*, carrier:companies(name)').eq('code', code).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) return null
  const row = data as LaneWithCarrier
  const { data: ships } = await sb.from('shipments').select('lane_id,current_temp,status').eq('lane_id', row.id)
  const temps = tempByLane(ships ?? [])
  const currentTemp = temps.get(row.id) ?? Number(((row.required_temp_min ?? 2) + (row.required_temp_max ?? 8)) / 2)
  const tempDeviation = row.required_temp_max != null && currentTemp > row.required_temp_max
  return mapLane(row, row.carrier?.name ?? 'Unknown carrier', currentTemp, tempDeviation)
}

// ---- rich lane detail (lane + nodes + segments + risk) ------------
export interface LaneNode {
  id: string
  sequence: number
  code: string
  name: string
  locationName: string
  type: NodeRow['type']
  modeFromPrevious: string | null
  responsibleCompany: string | null
  temperatureControl: boolean
  tempMin: number | null
  tempMax: number | null
  securityLevel: string | null
  handlingCapabilities: string[]
  specialConditions: string[]
  validationStatus: NodeRow['validation_status']
  riskScore: number
  latitude: number | null
  longitude: number | null
  certifications: RiskCertInfo[]
}

export interface LaneDetail {
  lane: Lane
  nodes: LaneNode[]
  segments: { fromNodeId: string | null; toNodeId: string | null; status: LaneSegmentRow['status']; mode: string | null; sequence: number }[]
  risk: RiskAssessment
}

function certInfo(rows: CertificationRow[]): RiskCertInfo[] {
  return rows.map(c => ({
    type: c.type,
    status: c.status,
    verified: Boolean(c.verified_by_validator_id),
    validUntil: c.valid_until,
  }))
}

export async function getLaneDetail(code: string): Promise<LaneDetail | null> {
  // Demo fallback: build a lane-level assessment with no node data.
  if (!isSupabaseConfigured()) {
    const lane = demoLanes().find(l => l.id === code)
    if (!lane) return null
    const { assessLaneFromDemo } = await import('./riskEngine')
    return { lane, nodes: [], segments: [], risk: assessLaneFromDemo(lane) }
  }

  const sb = getSupabase()!
  const lane = await getLaneByCode(code)
  if (!lane) return null
  const { data: laneRowData } = await sb.from('lanes').select('id, carrier_id, required_temp_min, required_temp_max, status').eq('code', code).single()
  if (!laneRowData) return null
  const laneRow = laneRowData as unknown as Pick<LaneRow, 'id' | 'carrier_id' | 'required_temp_min' | 'required_temp_max' | 'status'>
  const laneId = laneRow.id

  const [{ data: nodeRows }, { data: segRows }, { data: companyRows }, { data: certRows }] = await Promise.all([
    sb.from('nodes').select('*').eq('lane_id', laneId).order('sequence'),
    sb.from('lane_segments').select('*').eq('lane_id', laneId).order('sequence'),
    sb.from('companies').select('*'),
    sb.from('certifications').select('*'),
  ])

  const companies = new Map((companyRows as CompanyRow[] ?? []).map(c => [c.id, c]))
  const certsByCompany = new Map<string, CertificationRow[]>()
  for (const c of (certRows as CertificationRow[] ?? [])) {
    if (!c.company_id) continue
    const arr = certsByCompany.get(c.company_id) ?? []
    arr.push(c); certsByCompany.set(c.company_id, arr)
  }

  const nodes: LaneNode[] = (nodeRows as NodeRow[] ?? []).map(n => {
    const company = n.responsible_company_id ? companies.get(n.responsible_company_id) : undefined
    const certs = n.responsible_company_id ? certInfo(certsByCompany.get(n.responsible_company_id) ?? []) : []
    return {
      id: n.id,
      sequence: n.sequence,
      code: n.code ?? '',
      name: n.name ?? n.location_name ?? n.code ?? 'Node',
      locationName: n.location_name ?? '',
      type: n.type,
      modeFromPrevious: n.mode_from_previous,
      responsibleCompany: company?.name ?? null,
      temperatureControl: n.temperature_control,
      tempMin: n.temp_min,
      tempMax: n.temp_max,
      securityLevel: n.security_level,
      handlingCapabilities: n.handling_capabilities ?? [],
      specialConditions: n.special_conditions ?? [],
      validationStatus: n.validation_status,
      riskScore: n.risk_score,
      latitude: n.latitude,
      longitude: n.longitude,
      certifications: certs,
    }
  })

  // carrier GDP for the lane
  const carrierCerts = laneRow.carrier_id ? certsByCompany.get(laneRow.carrier_id) ?? [] : []
  const carrierGdpRow = carrierCerts.find(c => c.type === 'GDP')
  const carrierGdp: RiskCertInfo = carrierGdpRow
    ? { type: 'GDP', status: carrierGdpRow.status, verified: Boolean(carrierGdpRow.verified_by_validator_id), validUntil: carrierGdpRow.valid_until }
    : { type: 'GDP', status: 'missing', verified: false }

  const riskNodes: RiskNodeInput[] = nodes.map(n => ({
    name: n.name,
    type: n.type,
    validationStatus: n.validationStatus,
    temperatureControl: n.temperatureControl,
    tempMin: n.tempMin,
    tempMax: n.tempMax,
    securityLevel: n.securityLevel as 'low' | 'medium' | 'high' | null,
    handlingCapabilities: n.handlingCapabilities,
    specialConditions: n.specialConditions,
    certifications: n.certifications,
  }))

  const risk = assessLaneRisk({
    laneCode: lane.id,
    mode: lane.mode,
    status: mapStatusToDb(lane.status),
    requiredTempMin: lane.tempMin,
    requiredTempMax: lane.tempMax,
    currentTemp: lane.currentTemp,
    tempDeviation: lane.tempDeviation,
    carrierName: lane.carrier,
    carrierGdp,
    nodes: riskNodes,
    package: { goodsType: 'pharma', sensitivityTemperature: true, sensitivityTime: true, requiredTempMin: lane.tempMin, requiredTempMax: lane.tempMax },
  })

  return {
    lane,
    nodes,
    segments: (segRows as LaneSegmentRow[] ?? []).map(s => ({ fromNodeId: s.from_node_id, toNodeId: s.to_node_id, status: s.status, mode: s.mode, sequence: s.sequence })),
    risk,
  }
}

function mapStatusToDb(status: LaneStatus): string {
  if (status === 'in-transit') return 'in_transit'
  if (status === 'arrived') return 'delivered'
  return status
}

// Helper for screens that only have a demo Lane (no Supabase rich data)
export { assessLaneFromDemo } from './riskEngine'
export type { TemperatureReadingRow }
