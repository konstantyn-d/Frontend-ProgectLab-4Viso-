/**
 * Demo shipment lanes + a mapper from the app's internal `Lane` model.
 *
 * `demoLanes` is the self-contained fallback the map uses when no `lanes`
 * prop is passed. `lanesToShipmentLanes` adapts the existing dashboard data
 * (mockLanes + mockPorts) into the API-ready `ShipmentLane` shape — replace
 * this mapper (or feed `ShipmentLane[]` directly) when wiring real data.
 */

import type { Lane, Port } from '@/lib/mock-data'
import type { LaneStatus, ShipmentLane } from './types'

/** Self-contained demo set (pharma cold-chain corridors). */
export const demoLanes: ShipmentLane[] = [
  {
    id: 'SHIP-1024',
    laneCode: 'ANT-FRA-001',
    fromName: 'Antwerp Pharma Hub',
    toName: 'Frankfurt GDP Warehouse',
    from: [4.4025, 51.2194],
    to: [8.6821, 50.1109],
    status: 'on_track',
    eta: 'Today 18:40',
    temperature: '2.8°C',
    riskScore: 12,
    carrier: 'DHL Life Sciences',
    productType: 'Cold Chain Pharma',
    lastUpdate: '5 min ago',
  },
  {
    id: 'SHIP-1025',
    laneCode: 'BRU-SIN-014',
    fromName: 'Brussels Airport',
    toName: 'Singapore Changi',
    from: [4.4844, 50.9014],
    to: [103.9915, 1.3644],
    status: 'temperature_risk',
    eta: 'Tomorrow 02:30',
    temperature: '9.4°C',
    riskScore: 71,
    carrier: 'DHL Express',
    productType: 'Vaccines (2–8°C)',
    lastUpdate: '2 min ago',
  },
  {
    id: 'SHIP-1026',
    laneCode: 'FRA-JFK-007',
    fromName: 'Frankfurt Airport',
    toName: 'New York JFK',
    from: [8.5622, 50.0379],
    to: [-73.7781, 40.6413],
    status: 'customs_hold',
    eta: 'Today 22:00',
    temperature: '5.1°C',
    riskScore: 34,
    carrier: 'Lufthansa Cargo',
    productType: 'Biologics',
    lastUpdate: '12 min ago',
  },
  {
    id: 'SHIP-1027',
    laneCode: 'RTM-SHA-003',
    fromName: 'Port of Rotterdam',
    toName: 'Shanghai Port',
    from: [4.4777, 51.9244],
    to: [121.4737, 31.2304],
    status: 'critical',
    eta: 'Mar 20 14:00',
    temperature: '11.3°C',
    riskScore: 88,
    carrier: 'Maersk Line',
    productType: 'Cold Chain Pharma',
    lastUpdate: '1 min ago',
  },
  {
    id: 'SHIP-1028',
    laneCode: 'BOM-DXB-021',
    fromName: 'Mumbai Airport',
    toName: 'Dubai Airport',
    from: [72.8656, 19.0896],
    to: [55.3657, 25.2532],
    status: 'on_track',
    eta: 'Today 23:45',
    temperature: '4.2°C',
    riskScore: 15,
    carrier: 'Emirates SkyCargo',
    productType: 'Insulin',
    lastUpdate: '7 min ago',
  },
  {
    id: 'SHIP-1029',
    laneCode: 'CPH-LAX-009',
    fromName: 'Copenhagen Airport',
    toName: 'Los Angeles Airport',
    from: [12.6508, 55.618],
    to: [-118.4081, 33.9425],
    status: 'delayed',
    eta: 'Mar 16 12:20',
    temperature: '6.8°C',
    riskScore: 46,
    carrier: 'FedEx Express',
    productType: 'Clinical Trial Kits',
    lastUpdate: '9 min ago',
  },
  {
    id: 'SHIP-1030',
    laneCode: 'BSL-NRT-002',
    fromName: 'Basel Airport',
    toName: 'Tokyo Narita',
    from: [7.5291, 47.59],
    to: [140.3929, 35.772],
    status: 'delivered',
    eta: 'Delivered 08:20',
    temperature: '3.8°C',
    riskScore: 8,
    carrier: 'Swiss WorldCargo',
    productType: 'Oncology',
    lastUpdate: '3 h ago',
  },
]

/** Derive a clear cold-chain status from the internal Lane fields. */
export function deriveLaneStatus(lane: Lane): LaneStatus {
  if (lane.status === 'arrived') return 'delivered'
  if (lane.tempDeviation) return lane.riskScore >= 75 ? 'critical' : 'temperature_risk'
  if (lane.riskScore >= 75) return 'critical'
  if (lane.status === 'delayed') return 'delayed'
  if (lane.status === 'customs') return 'customs_hold'
  return 'on_track'
}

function fmtRelative(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return iso
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} h ago`
  return `${Math.round(hours / 24)} d ago`
}

function fmtEta(lane: Lane): string {
  if (lane.status === 'arrived') return 'Delivered'
  if (lane.status === 'delayed') return 'Delayed — revised'
  return `~${Math.max(1, Math.round((100 - lane.progress) / 8))} h remaining`
}

/**
 * Adapt the app's internal lanes + ports into ShipmentLane[].
 * Lanes whose origin/destination port is missing are skipped.
 */
export function lanesToShipmentLanes(lanes: Lane[], ports: Port[]): ShipmentLane[] {
  const byCode = new Map(ports.map(p => [p.code, p]))
  const out: ShipmentLane[] = []
  for (const lane of lanes) {
    const origin = byCode.get(lane.originCode)
    const dest = byCode.get(lane.destinationCode)
    if (!origin || !dest) continue
    out.push({
      id: lane.id,
      laneCode: `${lane.originCode}-${lane.destinationCode}`,
      fromName: origin.name,
      toName: dest.name,
      from: [origin.lng, origin.lat],
      to: [dest.lng, dest.lat],
      status: deriveLaneStatus(lane),
      eta: fmtEta(lane),
      temperature: `${lane.currentTemp.toFixed(1)}°C`,
      riskScore: lane.riskScore,
      carrier: lane.carrier,
      productType: lane.gdpCompliant ? 'GDP Cold Chain' : 'Cold Chain Pharma',
      lastUpdate: fmtRelative(lane.lastUpdated),
    })
  }
  return out
}
