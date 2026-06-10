/**
 * Global search — pure grouping over already-fetched data so the header
 * can filter per keystroke without async. Searches lanes, shipments,
 * carriers and alerts (incl. risk-level and GDP keywords).
 */
import type { Lane, Shipment } from '@/lib/mock-data'
import type { AlertVM } from './alertsService'

export interface SearchResults {
  lanes: Lane[]
  shipments: Shipment[]
  carriers: string[]
  alerts: AlertVM[]
}

function laneLevel(score: number): string {
  return score >= 81 ? 'critical' : score >= 61 ? 'high' : score >= 31 ? 'medium' : 'low'
}

export function searchAll(
  rawQuery: string,
  data: { lanes: Lane[]; shipments: Shipment[]; alerts: AlertVM[] },
): SearchResults {
  const q = rawQuery.trim().toLowerCase()
  if (!q) return { lanes: [], shipments: [], carriers: [], alerts: [] }

  const lanes = data.lanes.filter(l => {
    const level = laneLevel(l.riskScore)
    return (
      `${l.originCode}-${l.destinationCode}`.toLowerCase().includes(q) ||
      l.id.toLowerCase().includes(q) ||
      l.origin.toLowerCase().includes(q) ||
      l.destination.toLowerCase().includes(q) ||
      l.carrier.toLowerCase().includes(q) ||
      level.includes(q) ||
      (q.includes('risk') && (level === 'high' || level === 'critical')) ||
      ((q.includes('gdp') || q.includes('non-compliant') || q.includes('non compliant')) && !l.gdpCompliant)
    )
  }).slice(0, 5)

  const carriers = Array.from(new Set(data.lanes.map(l => l.carrier)))
    .filter(c => c.toLowerCase().includes(q))
    .slice(0, 3)

  const shipments = data.shipments.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.laneCode.toLowerCase().includes(q) ||
    s.carrier.toLowerCase().includes(q) ||
    s.currentLocation.toLowerCase().includes(q),
  ).slice(0, 5)

  const alerts = data.alerts.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.message.toLowerCase().includes(q) ||
    a.type.toLowerCase().includes(q) ||
    (a.laneCode ?? '').toLowerCase().includes(q),
  ).slice(0, 4)

  return { lanes, shipments, carriers, alerts }
}
