/**
 * Compliance service — derives real compliance metrics from lanes,
 * alerts and the audit log. Works in demo mode too (services it calls
 * already fall back to demo data).
 */
import { getLanes } from './lanesService'
import { getAlerts } from './alertsService'
import { getAuditLog } from './auditService'

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
