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
  progress: number // 0-100
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

export const mockLanes: Lane[] = [
  {
    id: 'LN-001',
    origin: 'Brussels',
    originCode: 'BRU',
    destination: 'Singapore',
    destinationCode: 'SIN',
    carrier: 'DHL Express',
    mode: 'air',
    status: 'in-transit',
    currentTemp: 4,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: false,
    gdpCompliant: true,
    riskScore: 12,
    progress: 65,
    milestone: 'in-transit',
    lastUpdated: '2024-03-15T14:30:00Z'
  },
  {
    id: 'LN-002',
    origin: 'Frankfurt',
    originCode: 'FRA',
    destination: 'New York',
    destinationCode: 'JFK',
    carrier: 'Lufthansa Cargo',
    mode: 'air',
    status: 'customs',
    currentTemp: 6,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: false,
    gdpCompliant: true,
    riskScore: 28,
    progress: 85,
    milestone: 'customs',
    lastUpdated: '2024-03-15T12:15:00Z'
  },
  {
    id: 'LN-003',
    origin: 'Rotterdam',
    originCode: 'RTM',
    destination: 'Shanghai',
    destinationCode: 'SHA',
    carrier: 'Maersk Line',
    mode: 'sea',
    status: 'in-transit',
    currentTemp: 11,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: true,
    gdpCompliant: false,
    riskScore: 78,
    progress: 45,
    milestone: 'in-transit',
    lastUpdated: '2024-03-15T10:45:00Z'
  },
  {
    id: 'LN-004',
    origin: 'Mumbai',
    originCode: 'BOM',
    destination: 'Dubai',
    destinationCode: 'DXB',
    carrier: 'Emirates SkyCargo',
    mode: 'air',
    status: 'active',
    currentTemp: 5,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: false,
    gdpCompliant: true,
    riskScore: 15,
    progress: 20,
    milestone: 'departure',
    lastUpdated: '2024-03-15T16:00:00Z'
  },
  {
    id: 'LN-005',
    origin: 'Basel',
    originCode: 'BSL',
    destination: 'Tokyo',
    destinationCode: 'NRT',
    carrier: 'Swiss WorldCargo',
    mode: 'air',
    status: 'arrived',
    currentTemp: 4,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: false,
    gdpCompliant: true,
    riskScore: 8,
    progress: 100,
    milestone: 'arrived',
    lastUpdated: '2024-03-15T08:20:00Z'
  },
  {
    id: 'LN-006',
    origin: 'Amsterdam',
    originCode: 'AMS',
    destination: 'Sao Paulo',
    destinationCode: 'GRU',
    carrier: 'KLM Cargo',
    mode: 'air',
    status: 'in-transit',
    currentTemp: 9,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: true,
    gdpCompliant: false,
    riskScore: 85,
    progress: 55,
    milestone: 'in-transit',
    lastUpdated: '2024-03-15T13:10:00Z'
  },
  {
    id: 'LN-007',
    origin: 'Paris',
    originCode: 'CDG',
    destination: 'Hong Kong',
    destinationCode: 'HKG',
    carrier: 'Air France Cargo',
    mode: 'air',
    status: 'in-transit',
    currentTemp: 5,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: false,
    gdpCompliant: true,
    riskScore: 22,
    progress: 70,
    milestone: 'in-transit',
    lastUpdated: '2024-03-15T15:45:00Z'
  },
  {
    id: 'LN-008',
    origin: 'Copenhagen',
    originCode: 'CPH',
    destination: 'Los Angeles',
    destinationCode: 'LAX',
    carrier: 'FedEx Express',
    mode: 'air',
    status: 'delayed',
    currentTemp: 7,
    tempMin: 2,
    tempMax: 8,
    tempDeviation: false,
    gdpCompliant: true,
    riskScore: 45,
    progress: 35,
    milestone: 'in-transit',
    lastUpdated: '2024-03-15T11:30:00Z'
  }
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
  {
    id: 'AL-001',
    timestamp: '2024-03-15T16:45:00Z',
    userId: 'U-001',
    userName: 'Sarah Chen',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'temperature_alert',
    description: 'Temperature deviation detected: 11°C exceeds maximum threshold of 8°C',
    laneId: 'LN-003',
    severity: 'critical'
  },
  {
    id: 'AL-002',
    timestamp: '2024-03-15T16:30:00Z',
    userId: 'U-002',
    userName: 'Marcus Weber',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'shipment_departed',
    description: 'Shipment departed from Mumbai (BOM) via Emirates SkyCargo',
    laneId: 'LN-004',
    severity: 'info'
  },
  {
    id: 'AL-003',
    timestamp: '2024-03-15T15:20:00Z',
    userId: 'U-003',
    userName: 'Elena Rodriguez',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'compliance_check',
    description: 'GDP compliance verification completed successfully',
    laneId: 'LN-007',
    severity: 'success'
  },
  {
    id: 'AL-004',
    timestamp: '2024-03-15T14:15:00Z',
    userId: 'U-001',
    userName: 'Sarah Chen',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'lane_created',
    description: 'New transport lane created: Copenhagen (CPH) to Los Angeles (LAX)',
    laneId: 'LN-008',
    severity: 'info'
  },
  {
    id: 'AL-005',
    timestamp: '2024-03-15T13:45:00Z',
    userId: 'U-004',
    userName: 'James Liu',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'temperature_alert',
    description: 'Temperature deviation detected: 9°C exceeds maximum threshold of 8°C',
    laneId: 'LN-006',
    severity: 'warning'
  },
  {
    id: 'AL-006',
    timestamp: '2024-03-15T12:00:00Z',
    userId: 'U-002',
    userName: 'Marcus Weber',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'lane_updated',
    description: 'Carrier information updated for lane LN-002',
    laneId: 'LN-002',
    severity: 'info'
  },
  {
    id: 'AL-007',
    timestamp: '2024-03-15T10:30:00Z',
    userId: 'U-003',
    userName: 'Elena Rodriguez',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'shipment_arrived',
    description: 'Shipment arrived at Tokyo Narita (NRT) - all parameters within spec',
    laneId: 'LN-005',
    severity: 'success'
  },
  {
    id: 'AL-008',
    timestamp: '2024-03-15T09:15:00Z',
    userId: 'U-005',
    userName: 'Anna Kowalski',
    userAvatar: '/placeholder.svg?height=32&width=32',
    action: 'compliance_check',
    description: 'Routine GDP audit initiated for active lanes',
    laneId: 'LN-001',
    severity: 'info'
  }
]

export const carriers = [
  'DHL Express',
  'FedEx Express',
  'UPS Healthcare',
  'Lufthansa Cargo',
  'Emirates SkyCargo',
  'Swiss WorldCargo',
  'KLM Cargo',
  'Air France Cargo',
  'Maersk Line',
  'MSC',
  'CMA CGM',
  'Hapag-Lloyd'
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
