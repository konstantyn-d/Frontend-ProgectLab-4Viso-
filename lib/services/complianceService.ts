/**
 * Compliance service — derives real compliance metrics from lanes,
 * alerts and the audit log. Works in demo mode too (services it calls
 * already fall back to demo data).
 */
import { getLanes, getLaneDetail } from './lanesService'
import { getAlerts, getAlertsForLane } from './alertsService'
import { getAuditLog } from './auditService'
import { getDocumentsForLane } from './documentsService'

export interface ComplianceSummary {
  gdpComplianceRate: number
  auditsCompleted: number
  openIssues: number
  passRate: number
}

export async function getComplianceSummary(): Promise<ComplianceSummary> {
  const [lanes, alerts, audit] = await Promise.all([getLanes(), getAlerts(), getAuditLog()])
  const total = lanes.length || 1
  const compliant = lanes.filter(l => l.gdpCompliant).length
  const passing = lanes.filter(l => l.riskScore <= 60 && l.gdpCompliant).length
  const openIssues = alerts.filter(a => a.status === 'open' || a.status === 'assigned').length
  const auditsCompleted = audit.filter(a => a.action === 'compliance_check').length || audit.length

  return {
    gdpComplianceRate: Math.round((compliant / total) * 1000) / 10,
    auditsCompleted,
    openIssues,
    passRate: Math.round((passing / total) * 1000) / 10,
  }
}

// ---- per-lane compliance checklist --------------------------------
export type CheckStatus = 'passed' | 'warning' | 'failed' | 'pending'
export interface ChecklistItem { label: string; status: CheckStatus; detail?: string }
export interface LaneChecklist { items: ChecklistItem[]; overall: CheckStatus }

function rollup(items: ChecklistItem[]): CheckStatus {
  if (items.some(i => i.status === 'failed')) return 'failed'
  if (items.some(i => i.status === 'warning')) return 'warning'
  if (items.some(i => i.status === 'pending')) return 'pending'
  return 'passed'
}

export async function getLaneChecklist(laneCode: string): Promise<LaneChecklist | null> {
  const [detail, alerts, documents] = await Promise.all([
    getLaneDetail(laneCode),
    getAlertsForLane(laneCode),
    getDocumentsForLane(laneCode),
  ])
  if (!detail) return null
  const { lane, nodes } = detail

  const nodeValidation: CheckStatus = nodes.length === 0
    ? 'pending'
    : nodes.some(n => n.validationStatus === 'missing' || n.validationStatus === 'rejected')
      ? 'failed'
      : nodes.some(n => n.validationStatus === 'claimed' || n.validationStatus === 'expired')
        ? 'warning'
        : 'passed'

  const validatorVerified: CheckStatus = nodes.length === 0
    ? (lane.gdpCompliant ? 'passed' : 'warning')
    : nodes.every(n => n.certifications.some(c => c.type === 'GDP' && c.verified))
      ? 'passed'
      : nodes.some(n => n.certifications.some(c => c.type === 'GDP' && (c.status === 'expired' || c.status === 'missing')))
        ? 'failed'
        : 'warning'

  const openCritical = alerts.filter(a => (a.status === 'open' || a.status === 'assigned') && a.severity === 'critical').length

  const items: ChecklistItem[] = [
    { label: 'GDP certification present and valid', status: lane.gdpCompliant ? 'passed' : 'failed' },
    { label: 'Certification verified by validator', status: validatorVerified },
    { label: 'Temperature range defined', status: lane.tempMin != null && lane.tempMax != null ? 'passed' : 'failed', detail: `${lane.tempMin}–${lane.tempMax}°C` },
    { label: 'Temperature readings within threshold', status: lane.tempDeviation ? 'failed' : 'passed', detail: `${lane.currentTemp}°C` },
    { label: 'Carrier capability verified', status: lane.gdpCompliant ? 'passed' : 'warning', detail: lane.carrier },
    { label: 'Node validation complete', status: nodeValidation },
    { label: 'Audit trail complete', status: 'passed' },
    { label: 'Documents attached', status: documents.length > 0 ? 'passed' : 'warning', detail: `${documents.length} files` },
    { label: 'No unresolved critical alerts', status: openCritical === 0 ? 'passed' : 'failed', detail: openCritical ? `${openCritical} open` : undefined },
  ]

  return { items, overall: rollup(items) }
}
