export type TransportMode = 'air' | 'sea' | 'road' | 'multimodal'

export type LaneStatus = 'active' | 'in-transit' | 'customs' | 'arrived' | 'delayed'

export type RiskLevel = 'low' | 'medium' | 'high'

export interface Lane {
  id: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  carrier: string
  mode: TransportMode
  status: LaneStatus
  currentTemp: number
  tempMin: number
  tempMax: number
  tempDeviation: boolean
  gdpCompliant: boolean
  riskScore: number
  progress: number
  milestone: 'departure' | 'in-transit' | 'customs' | 'arrived'
  lastUpdated: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  userAvatar: string
  action: 'lane_created' | 'lane_updated' | 'temperature_alert' | 'compliance_check' | 'shipment_departed' | 'shipment_arrived'
  description: string
  laneId: string
  severity: 'info' | 'warning' | 'critical' | 'success'
}

export interface Port {
  code: string
  name: string
  country: string
  lat: number
  lng: number
  activeShipments: number
  complianceRate: number
}

export interface WeatherAlert {
  id: string
  region: string
  type: 'storm' | 'fog' | 'congestion' | 'strike'
  severity: 'warning' | 'critical' | 'info'
  message: string
  affectedLanes: string[]
  startedAt: string
}

export interface Shipment {
  id: string
  laneId: string
  laneCode: string
  carrier: string
  currentLocation: string
  lastTemp: number
  tempMin: number
  tempMax: number
  eta: string
  status: 'in-transit' | 'customs' | 'arrived' | 'delayed' | 'loading'
  departedAt: string
  arrivedAt?: string
}

export interface Audit {
  id: string
  title: string
  auditor: string
  auditorInitials: string
  date: string
  status: 'passed' | 'warnings' | 'failed' | 'in-progress'
  scope: string
  findings: number
  region: string
}

export const mockLanes: Lane[] = [
  { id: 'LN-001', origin: 'Brussels', originCode: 'BRU', destination: 'Singapore', destinationCode: 'SIN', carrier: 'DHL Express', mode: 'air', status: 'in-transit', currentTemp: 4, tempMin: 2, tempMax: 8, tempDeviation: false, gdpCompliant: true, riskScore: 12, progress: 65, milestone: 'in-transit', lastUpdated: '2024-03-15T14:30:00Z' },
  { id: 'LN-002', origin: 'Frankfurt', originCode: 'FRA', destination: 'New York', destinationCode: 'JFK', carrier: 'Lufthansa Cargo', mode: 'air', status: 'customs', currentTemp: 6, tempMin: 2, tempMax: 8, tempDeviation: false, gdpCompliant: true, riskScore: 28, progress: 85, milestone: 'customs', lastUpdated: '2024-03-15T12:15:00Z' },
  { id: 'LN-003', origin: 'Rotterdam', originCode: 'RTM', destination: 'Shanghai', destinationCode: 'SHA', carrier: 'Maersk Line', mode: 'sea', status: 'in-transit', currentTemp: 11, tempMin: 2, tempMax: 8, tempDeviation: true, gdpCompliant: false, riskScore: 78, progress: 45, milestone: 'in-transit', lastUpdated: '2024-03-15T10:45:00Z' },
  { id: 'LN-004', origin: 'Mumbai', originCode: 'BOM', destination: 'Dubai', destinationCode: 'DXB', carrier: 'Emirates SkyCargo', mode: 'air', status: 'active', currentTemp: 5, tempMin: 2, tempMax: 8, tempDeviation: false, gdpCompliant: true, riskScore: 15, progress: 20, milestone: 'departure', lastUpdated: '2024-03-15T16:00:00Z' },
  { id: 'LN-005', origin: 'Basel', originCode: 'BSL', destination: 'Tokyo', destinationCode: 'NRT', carrier: 'Swiss WorldCargo', mode: 'air', status: 'arrived', currentTemp: 4, tempMin: 2, tempMax: 8, tempDeviation: false, gdpCompliant: true, riskScore: 8, progress: 100, milestone: 'arrived', lastUpdated: '2024-03-15T08:20:00Z' },
  { id: 'LN-006', origin: 'Amsterdam', originCode: 'AMS', destination: 'Sao Paulo', destinationCode: 'GRU', carrier: 'KLM Cargo', mode: 'air', status: 'in-transit', currentTemp: 9, tempMin: 2, tempMax: 8, tempDeviation: true, gdpCompliant: false, riskScore: 85, progress: 55, milestone: 'in-transit', lastUpdated: '2024-03-15T13:10:00Z' },
  { id: 'LN-007', origin: 'Paris', originCode: 'CDG', destination: 'Hong Kong', destinationCode: 'HKG', carrier: 'Air France Cargo', mode: 'air', status: 'in-transit', currentTemp: 5, tempMin: 2, tempMax: 8, tempDeviation: false, gdpCompliant: true, riskScore: 22, progress: 70, milestone: 'in-transit', lastUpdated: '2024-03-15T15:45:00Z' },
  { id: 'LN-008', origin: 'Copenhagen', originCode: 'CPH', destination: 'Los Angeles', destinationCode: 'LAX', carrier: 'FedEx Express', mode: 'air', status: 'delayed', currentTemp: 7, tempMin: 2, tempMax: 8, tempDeviation: false, gdpCompliant: true, riskScore: 45, progress: 35, milestone: 'in-transit', lastUpdated: '2024-03-15T11:30:00Z' }
]

export const mockPorts: Port[] = [
  { code: 'BRU', name: 'Brussels Airport', country: 'Belgium', lat: 50.9014, lng: 4.4844, activeShipments: 12, complianceRate: 96.5 },
  { code: 'SIN', name: 'Singapore Changi', country: 'Singapore', lat: 1.3644, lng: 103.9915, activeShipments: 8, complianceRate: 98.2 },
  { code: 'FRA', name: 'Frankfurt Airport', country: 'Germany', lat: 50.0379, lng: 8.5622, activeShipments: 15, complianceRate: 97.8 },
  { code: 'JFK', name: 'John F. Kennedy', country: 'USA', lat: 40.6413, lng: -73.7781, activeShipments: 22, complianceRate: 94.1 },
  { code: 'RTM', name: 'Port of Rotterdam', country: 'Netherlands', lat: 51.9244, lng: 4.4777, activeShipments: 6, complianceRate: 95.3 },
  { code: 'SHA', name: 'Shanghai Port', country: 'China', lat: 31.2304, lng: 121.4737, activeShipments: 18, complianceRate: 92.7 },
  { code: 'BOM', name: 'Mumbai Airport', country: 'India', lat: 19.0896, lng: 72.8656, activeShipments: 9, complianceRate: 91.5 },
  { code: 'DXB', name: 'Dubai Airport', country: 'UAE', lat: 25.2532, lng: 55.3657, activeShipments: 14, complianceRate: 97.2 },
  { code: 'BSL', name: 'Basel Airport', country: 'Switzerland', lat: 47.5900, lng: 7.5291, activeShipments: 7, complianceRate: 99.1 },
  { code: 'NRT', name: 'Narita Airport', country: 'Japan', lat: 35.7720, lng: 140.3929, activeShipments: 11, complianceRate: 98.8 },
  { code: 'AMS', name: 'Schiphol Airport', country: 'Netherlands', lat: 52.3105, lng: 4.7683, activeShipments: 16, complianceRate: 96.9 },
  { code: 'GRU', name: 'Guarulhos Airport', country: 'Brazil', lat: -23.4356, lng: -46.4731, activeShipments: 5, complianceRate: 89.4 },
  { code: 'CDG', name: 'Charles de Gaulle', country: 'France', lat: 49.0097, lng: 2.5479, activeShipments: 13, complianceRate: 95.8 },
  { code: 'HKG', name: 'Hong Kong Airport', country: 'Hong Kong', lat: 22.3080, lng: 113.9185, activeShipments: 19, complianceRate: 97.5 },
  { code: 'CPH', name: 'Copenhagen Airport', country: 'Denmark', lat: 55.6180, lng: 12.6508, activeShipments: 4, complianceRate: 98.3 },
  { code: 'LAX', name: 'Los Angeles Airport', country: 'USA', lat: 33.9425, lng: -118.4081, activeShipments: 20, complianceRate: 93.6 }
]

export const mockAuditLog: AuditLogEntry[] = [
  { id: 'AL-001', timestamp: '2024-03-15T16:45:00Z', userId: 'U-001', userName: 'Sarah Chen', userAvatar: '/placeholder.svg?height=32&width=32', action: 'temperature_alert', description: 'Temperature deviation detected: 11°C exceeds maximum threshold of 8°C', laneId: 'LN-003', severity: 'critical' },
  { id: 'AL-002', timestamp: '2024-03-15T16:30:00Z', userId: 'U-002', userName: 'Marcus Weber', userAvatar: '/placeholder.svg?height=32&width=32', action: 'shipment_departed', description: 'Shipment departed from Mumbai (BOM) via Emirates SkyCargo', laneId: 'LN-004', severity: 'info' },
  { id: 'AL-003', timestamp: '2024-03-15T15:20:00Z', userId: 'U-003', userName: 'Elena Rodriguez', userAvatar: '/placeholder.svg?height=32&width=32', action: 'compliance_check', description: 'GDP compliance verification completed successfully', laneId: 'LN-007', severity: 'success' },
  { id: 'AL-004', timestamp: '2024-03-15T14:15:00Z', userId: 'U-001', userName: 'Sarah Chen', userAvatar: '/placeholder.svg?height=32&width=32', action: 'lane_created', description: 'New transport lane created: Copenhagen (CPH) to Los Angeles (LAX)', laneId: 'LN-008', severity: 'info' },
  { id: 'AL-005', timestamp: '2024-03-15T13:45:00Z', userId: 'U-004', userName: 'James Liu', userAvatar: '/placeholder.svg?height=32&width=32', action: 'temperature_alert', description: 'Temperature deviation detected: 9°C exceeds maximum threshold of 8°C', laneId: 'LN-006', severity: 'warning' },
  { id: 'AL-006', timestamp: '2024-03-15T12:00:00Z', userId: 'U-002', userName: 'Marcus Weber', userAvatar: '/placeholder.svg?height=32&width=32', action: 'lane_updated', description: 'Carrier information updated for lane LN-002', laneId: 'LN-002', severity: 'info' },
  { id: 'AL-007', timestamp: '2024-03-15T10:30:00Z', userId: 'U-003', userName: 'Elena Rodriguez', userAvatar: '/placeholder.svg?height=32&width=32', action: 'shipment_arrived', description: 'Shipment arrived at Tokyo Narita (NRT) - all parameters within spec', laneId: 'LN-005', severity: 'success' },
  { id: 'AL-008', timestamp: '2024-03-15T09:15:00Z', userId: 'U-005', userName: 'Anna Kowalski', userAvatar: '/placeholder.svg?height=32&width=32', action: 'compliance_check', description: 'Routine GDP audit initiated for active lanes', laneId: 'LN-001', severity: 'info' }
]

export const carriers = [
  'DHL Express', 'FedEx Express', 'UPS Healthcare', 'Lufthansa Cargo', 'Emirates SkyCargo',
  'Swiss WorldCargo', 'KLM Cargo', 'Air France Cargo', 'Maersk Line', 'MSC', 'CMA CGM', 'Hapag-Lloyd'
]

export const dashboardStats = {
  activeLanes: 47,
  activeLanesTrend: 5.2,
  gdpCompliant: 94.2,
  gdpCompliantTrend: 1.8,
  temperatureDeviations: 3,
  temperatureDeviationsTrend: -2,
  highRiskLanes: 2,
  highRiskLanesTrend: 0
}

// 7-day sparkline series (index 0 = 7 days ago, index 6 = today)
export const sparklines = {
  activeLanes: [39, 41, 42, 44, 43, 45, 47],
  gdpCompliant: [92.4, 93.0, 92.8, 93.2, 93.7, 94.0, 94.2],
  tempDeviations: [5, 4, 6, 5, 4, 3, 3],
  highRiskLanes: [4, 3, 3, 2, 2, 2, 2],
}

export const weatherAlerts: WeatherAlert[] = [
  { id: 'WA-001', region: 'North Atlantic', type: 'storm', severity: 'critical', message: 'Severe storm system affecting transatlantic routes', affectedLanes: ['LN-002', 'LN-008'], startedAt: '2024-03-15T08:00:00Z' },
  { id: 'WA-002', region: 'Shanghai Port', type: 'congestion', severity: 'warning', message: 'Port congestion causing 48h delays on inbound vessels', affectedLanes: ['LN-003'], startedAt: '2024-03-15T06:00:00Z' },
  { id: 'WA-003', region: 'Dubai Airspace', type: 'fog', severity: 'info', message: 'Low visibility forecast — minor delays expected', affectedLanes: ['LN-004'], startedAt: '2024-03-15T14:00:00Z' },
  { id: 'WA-004', region: 'Port of Rotterdam', type: 'strike', severity: 'warning', message: 'Worker strike planned for Thursday — divert through Antwerp', affectedLanes: ['LN-003'], startedAt: '2024-03-15T10:00:00Z' },
]

export const mockShipments: Shipment[] = [
  { id: 'SH-48201', laneId: 'LN-001', laneCode: 'BRU-SIN', carrier: 'DHL Express', currentLocation: 'Mumbai Airspace', lastTemp: 4.1, tempMin: 2, tempMax: 8, eta: '2024-03-16T02:30:00Z', status: 'in-transit', departedAt: '2024-03-15T04:00:00Z' },
  { id: 'SH-48195', laneId: 'LN-002', laneCode: 'FRA-JFK', carrier: 'Lufthansa Cargo', currentLocation: 'JFK Customs', lastTemp: 6.2, tempMin: 2, tempMax: 8, eta: '2024-03-15T22:00:00Z', status: 'customs', departedAt: '2024-03-15T06:15:00Z' },
  { id: 'SH-48188', laneId: 'LN-003', laneCode: 'RTM-SHA', carrier: 'Maersk Line', currentLocation: 'Indian Ocean', lastTemp: 11.3, tempMin: 2, tempMax: 8, eta: '2024-03-20T14:00:00Z', status: 'delayed', departedAt: '2024-03-10T08:00:00Z' },
  { id: 'SH-48211', laneId: 'LN-004', laneCode: 'BOM-DXB', carrier: 'Emirates SkyCargo', currentLocation: 'BOM Terminal 2', lastTemp: 5.4, tempMin: 2, tempMax: 8, eta: '2024-03-15T23:45:00Z', status: 'loading', departedAt: '2024-03-15T16:00:00Z' },
  { id: 'SH-48150', laneId: 'LN-005', laneCode: 'BSL-NRT', carrier: 'Swiss WorldCargo', currentLocation: 'Narita Airport', lastTemp: 3.8, tempMin: 2, tempMax: 8, eta: '2024-03-15T08:20:00Z', status: 'arrived', departedAt: '2024-03-14T18:00:00Z', arrivedAt: '2024-03-15T08:20:00Z' },
  { id: 'SH-48203', laneId: 'LN-006', laneCode: 'AMS-GRU', carrier: 'KLM Cargo', currentLocation: 'North Atlantic', lastTemp: 9.1, tempMin: 2, tempMax: 8, eta: '2024-03-16T06:15:00Z', status: 'in-transit', departedAt: '2024-03-15T01:30:00Z' },
  { id: 'SH-48199', laneId: 'LN-007', laneCode: 'CDG-HKG', carrier: 'Air France Cargo', currentLocation: 'Siberian Corridor', lastTemp: 5.0, tempMin: 2, tempMax: 8, eta: '2024-03-16T04:45:00Z', status: 'in-transit', departedAt: '2024-03-15T09:00:00Z' },
  { id: 'SH-48212', laneId: 'LN-008', laneCode: 'CPH-LAX', carrier: 'FedEx Express', currentLocation: 'Greenland Airspace', lastTemp: 6.8, tempMin: 2, tempMax: 8, eta: '2024-03-16T12:20:00Z', status: 'delayed', departedAt: '2024-03-15T07:30:00Z' },
  { id: 'SH-48145', laneId: 'LN-001', laneCode: 'BRU-SIN', carrier: 'DHL Express', currentLocation: 'Singapore Changi', lastTemp: 4.2, tempMin: 2, tempMax: 8, eta: '2024-03-15T09:00:00Z', status: 'arrived', departedAt: '2024-03-14T03:00:00Z', arrivedAt: '2024-03-15T09:00:00Z' },
  { id: 'SH-48215', laneId: 'LN-002', laneCode: 'FRA-JFK', carrier: 'Lufthansa Cargo', currentLocation: 'FRA Terminal 3', lastTemp: 5.1, tempMin: 2, tempMax: 8, eta: '2024-03-16T04:00:00Z', status: 'loading', departedAt: '2024-03-15T18:00:00Z' },
]

// Hourly shipment flow for today (24 hours)
export const shipmentFlow = Array.from({ length: 24 }, (_, hour) => {
  const departures = hour < 6 ? 1 + Math.floor(Math.random() * 2) : hour < 18 ? 3 + Math.floor(Math.random() * 5) : 2 + Math.floor(Math.random() * 3)
  const arrivals = hour < 8 ? 2 + Math.floor(Math.random() * 3) : hour < 20 ? 3 + Math.floor(Math.random() * 4) : 1 + Math.floor(Math.random() * 2)
  return { hour: `${String(hour).padStart(2, '0')}:00`, departures, arrivals }
})

export const mockAudits: Audit[] = [
  { id: 'AU-0124', title: 'Q1 GDP Compliance Audit', auditor: 'Elena Rodriguez', auditorInitials: 'ER', date: '2024-03-15T14:00:00Z', status: 'passed', scope: '12 lanes across EU-APAC', findings: 0, region: 'EU-APAC' },
  { id: 'AU-0123', title: 'Temperature Chain Review', auditor: 'Marcus Weber', auditorInitials: 'MW', date: '2024-03-14T10:30:00Z', status: 'warnings', scope: 'Sea freight lanes', findings: 2, region: 'EU-APAC' },
  { id: 'AU-0122', title: 'Carrier Documentation Check', auditor: 'Anna Kowalski', auditorInitials: 'AK', date: '2024-03-13T16:45:00Z', status: 'passed', scope: 'Lufthansa Cargo', findings: 0, region: 'EU-NAM' },
  { id: 'AU-0121', title: 'Customs Clearance Review', auditor: 'James Liu', auditorInitials: 'JL', date: '2024-03-12T11:20:00Z', status: 'failed', scope: 'APAC-NAM corridor', findings: 4, region: 'APAC-NAM' },
  { id: 'AU-0120', title: 'Cold Chain Integrity Audit', auditor: 'Sarah Chen', auditorInitials: 'SC', date: '2024-03-11T09:00:00Z', status: 'passed', scope: 'All active lanes', findings: 1, region: 'Global' },
  { id: 'AU-0119', title: 'Carrier Onboarding Review', auditor: 'Elena Rodriguez', auditorInitials: 'ER', date: '2024-03-10T15:30:00Z', status: 'in-progress', scope: 'New vendor assessment', findings: 0, region: 'EU-LATAM' },
]

// Regional compliance breakdown for stacked bar
export const regionCompliance = [
  { region: 'EU-APAC', compliant: 84, warning: 12, deviation: 4 },
  { region: 'EU-NAM', compliant: 78, warning: 17, deviation: 5 },
  { region: 'APAC-NAM', compliant: 68, warning: 22, deviation: 10 },
  { region: 'EU-LATAM', compliant: 62, warning: 26, deviation: 12 },
  { region: 'EU-MEA', compliant: 72, warning: 20, deviation: 8 },
  { region: 'APAC-MEA', compliant: 86, warning: 11, deviation: 3 },
]

// 12-week compliance trend
export const complianceTrend = [
  { week: 'W1', rate: 91.2 }, { week: 'W2', rate: 90.8 }, { week: 'W3', rate: 91.5 },
  { week: 'W4', rate: 92.0 }, { week: 'W5', rate: 91.7 }, { week: 'W6', rate: 92.4 },
  { week: 'W7', rate: 92.9 }, { week: 'W8', rate: 93.1 }, { week: 'W9', rate: 93.5 },
  { week: 'W10', rate: 93.8 }, { week: 'W11', rate: 94.0 }, { week: 'W12', rate: 94.2 },
]

// Temperature history for lane detail view (48 hours, every 30 min = 96 points)
export function generateTempHistory(lane: Lane): { time: string; temp: number }[] {
  const baseline = (lane.tempMin + lane.tempMax) / 2
  const deviation = lane.tempDeviation
  return Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 2)
    const mins = (i % 2) * 30
    const spike = deviation && i > 70 && i < 85 ? 3 + Math.random() * 2 : 0
    const noise = (Math.random() - 0.5) * 1.2
    return {
      time: `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`,
      temp: Number((baseline + noise + spike).toFixed(1)),
    }
  })
}

// Route waypoints for lane detail
export interface Waypoint {
  code: string
  name: string
  type: 'origin' | 'transit' | 'customs' | 'destination'
  arrival?: string
  departure?: string
  completed: boolean
  current?: boolean
}

export function getLaneWaypoints(lane: Lane): Waypoint[] {
  const base: Waypoint[] = [
    { code: lane.originCode, name: lane.origin, type: 'origin', departure: lane.lastUpdated, completed: true },
  ]
  if (lane.mode === 'sea' || lane.mode === 'multimodal') {
    base.push({ code: 'Transit', name: 'Open Ocean', type: 'transit', completed: lane.progress > 30, current: lane.progress <= 30 && lane.progress > 0 })
  } else {
    base.push({ code: 'Transit', name: 'Airspace', type: 'transit', completed: lane.progress > 40, current: lane.milestone === 'in-transit' })
  }
  base.push({ code: 'Customs', name: `${lane.destinationCode} Customs`, type: 'customs', completed: lane.progress > 85, current: lane.milestone === 'customs' })
  base.push({ code: lane.destinationCode, name: lane.destination, type: 'destination', arrival: lane.progress === 100 ? lane.lastUpdated : undefined, completed: lane.milestone === 'arrived', current: false })
  return base
}

// Team mock for lane detail
export const mockTeam = [
  { id: 'U-001', name: 'Sarah Chen', initials: 'SC', role: 'Logistics Lead' },
  { id: 'U-003', name: 'Elena Rodriguez', initials: 'ER', role: 'Compliance Officer' },
  { id: 'U-002', name: 'Marcus Weber', initials: 'MW', role: 'Operations' },
]

// Documents mock
export const mockDocuments = [
  { id: 'DOC-001', name: 'Bill of Lading — LN-001.pdf', size: '248 KB', uploadedAt: '2024-03-15T04:00:00Z' },
  { id: 'DOC-002', name: 'GDP Compliance Certificate.pdf', size: '512 KB', uploadedAt: '2024-03-14T18:00:00Z' },
  { id: 'DOC-003', name: 'Temperature Log Export.pdf', size: '1.2 MB', uploadedAt: '2024-03-15T14:30:00Z' },
  { id: 'DOC-004', name: 'Customs Declaration.pdf', size: '189 KB', uploadedAt: '2024-03-15T10:00:00Z' },
]

// Event timeline for lane detail
export interface LaneEvent {
  id: string
  timestamp: string
  type: 'departure' | 'temperature' | 'customs' | 'arrival' | 'alert' | 'update'
  title: string
  description: string
  severity: 'info' | 'success' | 'warning' | 'critical'
}

export function getLaneEvents(lane: Lane): LaneEvent[] {
  const events: LaneEvent[] = [
    { id: 'EV-1', timestamp: lane.lastUpdated, type: 'update', title: 'Position update received', description: `Current progress at ${lane.progress}%`, severity: 'info' },
  ]
  if (lane.tempDeviation) {
    events.push({ id: 'EV-2', timestamp: lane.lastUpdated, type: 'alert', title: 'Temperature deviation', description: `Reading of ${lane.currentTemp}°C exceeded ${lane.tempMax}°C maximum`, severity: 'critical' })
  }
  if (lane.milestone === 'customs' || lane.milestone === 'arrived') {
    events.push({ id: 'EV-3', timestamp: lane.lastUpdated, type: 'customs', title: `Customs clearance at ${lane.destinationCode}`, description: 'Documentation submitted and pending review', severity: 'info' })
  }
  events.push({ id: 'EV-4', timestamp: '2024-03-15T04:00:00Z', type: 'departure', title: `Departure from ${lane.origin}`, description: `${lane.carrier} · ${lane.mode} freight`, severity: 'success' })
  return events
}
