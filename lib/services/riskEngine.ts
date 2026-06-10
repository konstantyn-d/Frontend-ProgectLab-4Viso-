/**
 * PharmaTrack risk engine.
 *
 * Turns a normalized lane/node/package/shipment picture into a scored
 * assessment with a human breakdown and recommended actions. Works from
 * rich Supabase data (nodes + certifications + package + temps) and
 * degrades gracefully to lane-level demo data.
 */
import type { Lane } from '@/lib/mock-data'

export type RiskReasonType =
  | 'temperature'
  | 'temperature_control'
  | 'certification'
  | 'validator'
  | 'security'
  | 'handling'
  | 'dangerous_goods'
  | 'sensor'
  | 'customs'
  | 'delay'
  | 'weather'

export type RiskSeverity = 'info' | 'warning' | 'critical'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskReason {
  type: RiskReasonType
  severity: RiskSeverity
  message: string
  impact: number
  affectedEntity: string
}

export interface RiskAssessment {
  score: number
  level: RiskLevel
  reasons: RiskReason[]
  recommendedActions: string[]
}

// ---- normalized inputs -------------------------------------------
export interface RiskCertInfo {
  type: string
  status: 'claimed' | 'valid' | 'expired' | 'rejected' | 'pending_review' | 'missing'
  verified: boolean
  validUntil?: string | null
}

export interface RiskNodeInput {
  name: string
  type?: string
  validationStatus?: 'claimed' | 'validated' | 'missing' | 'rejected' | 'expired'
  temperatureControl?: boolean
  tempMin?: number | null
  tempMax?: number | null
  securityLevel?: 'low' | 'medium' | 'high' | null
  handlingCapabilities?: string[]
  specialConditions?: string[]
  certifications?: RiskCertInfo[]
}

export interface RiskInput {
  laneCode?: string
  mode?: string
  status?: string
  requiredTempMin?: number | null
  requiredTempMax?: number | null
  currentTemp?: number | null
  tempDeviation?: boolean
  carrierName?: string
  carrierGdp?: RiskCertInfo | null
  nodes?: RiskNodeInput[]
  package?: {
    goodsType?: 'pharma' | 'perishable' | 'dangerous_goods'
    sensitivityTemperature?: boolean
    sensitivityShock?: boolean
    sensitivityTime?: boolean
    requiredTempMin?: number | null
    requiredTempMax?: number | null
  } | null
  shipment?: { lastSensorUpdate?: string | null; status?: string; currentTemp?: number | null } | null
  weatherSeverity?: RiskSeverity | null
}

// §7 penalty model
const PENALTY = {
  missingGdp: 25,
  expiredCert: 30,
  claimedNotVerified: 15,
  noValidator: 20,
  missingTempControl: 35,
  tempOverThreshold: 40,
  weakSecurity: 20,
  unknownHandling: 15,
  dangerousGoodsNoCapability: 35,
  sensorOffline: 20,
  customsDelay: 15,
  weatherInfo: 10,
  weatherWarning: 18,
  weatherCritical: 25,
} as const

export function riskLevel(score: number): RiskLevel {
  if (score >= 81) return 'critical'
  if (score >= 61) return 'high'
  if (score >= 31) return 'medium'
  return 'low'
}

const ACTION_BY_TYPE: Record<RiskReasonType, string[]> = {
  temperature: ['Contact carrier immediately', 'Generate a temperature deviation report'],
  temperature_control: ['Assign a temperature-controlled handler for the affected node'],
  certification: ['Verify GDP certification for the affected company/node'],
  validator: ['Request independent validator confirmation'],
  security: ['Upgrade security handling for high-value pharma'],
  handling: ['Confirm handling capability with the responsible company'],
  dangerous_goods: ['Assign a dangerous-goods certified handler'],
  sensor: ['Investigate the offline sensor and restore telemetry'],
  customs: ['Escalate to the customs broker'],
  delay: ['Review the schedule and notify the consignee'],
  weather: ['Evaluate rerouting around the affected region'],
}

/** Core: score a normalized risk picture. */
export function assessLaneRisk(input: RiskInput): RiskAssessment {
  const reasons: RiskReason[] = []
  const entity = input.laneCode ?? 'lane'
  const tMax = input.requiredTempMax ?? input.package?.requiredTempMax ?? null
  const tMin = input.requiredTempMin ?? input.package?.requiredTempMin ?? null
  const requiresColdChain = tMin != null && tMax != null

  // --- temperature exceeds threshold ---
  const liveTemp = input.shipment?.currentTemp ?? input.currentTemp ?? null
  const overThreshold =
    input.tempDeviation === true ||
    (liveTemp != null && tMax != null && liveTemp > tMax) ||
    (liveTemp != null && tMin != null && liveTemp < tMin)
  if (overThreshold) {
    const msg =
      liveTemp != null && tMax != null
        ? `Current temperature ${liveTemp}°C exceeds maximum threshold of ${tMax}°C`
        : 'Temperature deviation detected on this lane'
    reasons.push({ type: 'temperature', severity: 'critical', message: msg, impact: PENALTY.tempOverThreshold, affectedEntity: entity })
  }

  // --- carrier GDP certification ---
  const gdp = input.carrierGdp
  if (gdp) {
    if (gdp.status === 'missing' || gdp.status === 'rejected') {
      reasons.push({ type: 'certification', severity: 'warning', message: `GDP certification is missing for ${input.carrierName ?? 'the carrier'}`, impact: PENALTY.missingGdp, affectedEntity: input.carrierName ?? entity })
    } else if (gdp.status === 'expired') {
      reasons.push({ type: 'certification', severity: 'critical', message: `GDP certification for ${input.carrierName ?? 'the carrier'} has expired`, impact: PENALTY.expiredCert, affectedEntity: input.carrierName ?? entity })
    } else if (gdp.status === 'claimed' || gdp.status === 'pending_review' || !gdp.verified) {
      reasons.push({ type: 'validator', severity: 'warning', message: `GDP certification for ${input.carrierName ?? 'the carrier'} is claimed but not validator-verified`, impact: PENALTY.claimedNotVerified, affectedEntity: input.carrierName ?? entity })
    }
  }

  // --- per-node checks ---
  for (const node of input.nodes ?? []) {
    if (node.validationStatus === 'missing' || node.validationStatus === 'rejected') {
      reasons.push({ type: 'certification', severity: 'warning', message: `GDP / compliance is missing or not verified for ${node.name}`, impact: PENALTY.missingGdp, affectedEntity: node.name })
    } else if (node.validationStatus === 'expired') {
      reasons.push({ type: 'certification', severity: 'critical', message: `Certification for ${node.name} has expired`, impact: PENALTY.expiredCert, affectedEntity: node.name })
    } else if (node.validationStatus === 'claimed') {
      reasons.push({ type: 'validator', severity: 'warning', message: `${node.name} is claimed but awaiting validator confirmation`, impact: PENALTY.noValidator, affectedEntity: node.name })
    }

    if (requiresColdChain && node.temperatureControl === false) {
      reasons.push({ type: 'temperature_control', severity: 'critical', message: `${node.name} has no temperature control for the required ${tMin}–${tMax}°C range`, impact: PENALTY.missingTempControl, affectedEntity: node.name })
    }

    if (node.securityLevel === 'low') {
      reasons.push({ type: 'security', severity: 'warning', message: `${node.name} has weak security for high-value pharma`, impact: PENALTY.weakSecurity, affectedEntity: node.name })
    }

    const dangerousGoods = node.specialConditions?.includes('dangerous_goods') || input.package?.goodsType === 'dangerous_goods'
    const handlesDg = node.handlingCapabilities?.includes('dangerous_goods')
    if (dangerousGoods && !handlesDg) {
      reasons.push({ type: 'dangerous_goods', severity: 'critical', message: `${node.name} handles dangerous goods without a DG handling capability`, impact: PENALTY.dangerousGoodsNoCapability, affectedEntity: node.name })
    }

    const needsPharma = node.specialConditions?.includes('pharma') || input.package?.goodsType === 'pharma'
    if (needsPharma && (node.handlingCapabilities?.length ?? 0) === 0 && node.type !== 'hub') {
      reasons.push({ type: 'handling', severity: 'warning', message: `${node.name} has unknown handling capability for pharma`, impact: PENALTY.unknownHandling, affectedEntity: node.name })
    }
  }

  // --- sensor offline > 2h ---
  const lastSensor = input.shipment?.lastSensorUpdate
  if (lastSensor) {
    const ageHours = (Date.now() - new Date(lastSensor).getTime()) / 3_600_000
    if (ageHours > 2) {
      reasons.push({ type: 'sensor', severity: 'warning', message: `Temperature sensor offline for ${Math.round(ageHours)}h`, impact: PENALTY.sensorOffline, affectedEntity: entity })
    }
  }

  // --- customs / delay ---
  if (input.status === 'customs' || input.shipment?.status === 'customs') {
    reasons.push({ type: 'customs', severity: 'warning', message: 'Shipment is held in customs', impact: PENALTY.customsDelay, affectedEntity: entity })
  } else if (input.status === 'delayed' || input.shipment?.status === 'delayed') {
    reasons.push({ type: 'delay', severity: 'warning', message: 'Shipment is delayed past its planned schedule', impact: PENALTY.customsDelay, affectedEntity: entity })
  }

  // --- weather ---
  if (input.weatherSeverity) {
    const impact = input.weatherSeverity === 'critical' ? PENALTY.weatherCritical : input.weatherSeverity === 'warning' ? PENALTY.weatherWarning : PENALTY.weatherInfo
    reasons.push({ type: 'weather', severity: input.weatherSeverity, message: 'Severe weather reported on the route', impact, affectedEntity: entity })
  }

  // --- baseline so healthy pharma cold-chain lanes are never a flat 0 ---
  let baseline = 0
  if (input.package?.goodsType === 'pharma' || requiresColdChain) baseline += 5
  if (input.mode === 'sea') baseline += 5
  else if (input.mode === 'air') baseline += 3

  const raw = baseline + reasons.reduce((sum, r) => sum + r.impact, 0)
  const score = Math.max(0, Math.min(100, raw))

  // --- recommended actions (deduped, prioritized) ---
  const actions: string[] = []
  const hasSevere = reasons.some(r => r.severity === 'critical')
  for (const r of reasons) for (const a of ACTION_BY_TYPE[r.type]) if (!actions.includes(a)) actions.push(a)
  if (hasSevere && !actions.includes('Assign a compliance officer')) actions.unshift('Assign a compliance officer')

  return { score, level: riskLevel(score), reasons: reasons.sort((a, b) => b.impact - a.impact), recommendedActions: actions }
}

/** Build a lane-level RiskInput from the demo `Lane` shape (no node/cert data). */
export function buildRiskInputFromLane(lane: Lane): RiskInput {
  return {
    laneCode: lane.id,
    mode: lane.mode,
    status: lane.status === 'in-transit' ? 'in_transit' : lane.status,
    requiredTempMin: lane.tempMin,
    requiredTempMax: lane.tempMax,
    currentTemp: lane.currentTemp,
    tempDeviation: lane.tempDeviation,
    carrierName: lane.carrier,
    carrierGdp: lane.gdpCompliant
      ? { type: 'GDP', status: 'valid', verified: true }
      : { type: 'GDP', status: 'expired', verified: false },
    package: { goodsType: 'pharma', sensitivityTemperature: true, sensitivityTime: true, requiredTempMin: lane.tempMin, requiredTempMax: lane.tempMax },
  }
}

/** Convenience for list/dashboard contexts that only have a `Lane`. */
export function assessLaneFromDemo(lane: Lane): RiskAssessment {
  return assessLaneRisk(buildRiskInputFromLane(lane))
}
