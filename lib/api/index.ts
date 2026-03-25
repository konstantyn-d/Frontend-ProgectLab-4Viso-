import apiClient from './client'

export interface DashboardKPIs {
  activeLanes: number
  gdpPercent: number
  temperatureDeviations: number
  highRiskLanes: number
}

export interface CorridorStatus {
  corridor: string
  lanes: number
  avgRisk: number
  compliance: number
  status: 'compliant' | 'warning' | 'critical'
}

export interface Port {
  id: string
  code: string
  name: string
  city: string
  country: string
  type: string
}

export interface Carrier {
  id: string
  name: string
  gdp_certified: boolean
  modes: string[]
}

export interface LaneRow {
  id: string
  mode: string
  status: string
  product_type: string
  temp_min: number
  temp_max: number
  temp_current: number | null
  gdp_compliant: boolean
  risk_score: number
  progress_step: number
  created_at: string
  updated_at: string
  origin_port: Port
  dest_port: Port
  carrier: Carrier
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
}

export interface TemperatureReading {
  id: string
  lane_id: string
  value: number
  is_deviation: boolean
  recorded_at: string
}

export interface ShipmentRow {
  id: string
  lane_id: string
  carrier_id: string
  departure_at: string
  eta: string
  arrived_at: string | null
  status: string
  created_at: string
  lane?: LaneRow
  carrier?: Carrier
}

export interface ComplianceRow {
  id: string
  lane_id: string
  score: number
  gdp_status: boolean
  audited_at: string
  audited_by: string | null
  open_issues: number
  notes: string | null
  lane?: LaneRow
}

export interface AuditEventRow {
  id: string
  type: string
  severity: string
  title: string
  description: string | null
  lane_id: string | null
  user_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

// Dashboard
export const getDashboardKPIs = () =>
  apiClient.get<DashboardKPIs>('/api/dashboard/kpis').then((r) => r.data)

export const getDashboardCorridors = () =>
  apiClient.get<CorridorStatus[]>('/api/dashboard/corridors').then((r) => r.data)

// Lanes
export const getLanes = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<Paginated<LaneRow>>('/api/lanes', { params }).then((r) => r.data)

export const getLaneById = (id: string) =>
  apiClient.get<LaneRow>(`/api/lanes/${id}`).then((r) => r.data)

export const createLane = (body: {
  originPortId: string
  destPortId: string
  carrierId: string
  mode: string
  productType: string
  tempMin: number
  tempMax: number
  notifications: {
    emailOnDeviation: boolean
    pushOnStatusChange: boolean
    dailyDigest: boolean
    highRiskAlerts: boolean
  }
}) => apiClient.post<LaneRow>('/api/lanes', body).then((r) => r.data)

export const deleteLane = (id: string) =>
  apiClient.delete(`/api/lanes/${id}`)

// Temperature
export const getTemperatureReadings = (laneId: string, params?: Record<string, string>) =>
  apiClient
    .get<{ readings: TemperatureReading[]; deviations: number }>(
      `/api/lanes/${laneId}/temperature`,
      { params },
    )
    .then((r) => r.data)

// Shipments
export const getShipments = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<Paginated<ShipmentRow>>('/api/shipments', { params }).then((r) => r.data)

export const getShipmentById = (id: string) =>
  apiClient.get<ShipmentRow>(`/api/shipments/${id}`).then((r) => r.data)

// Compliance
export const getComplianceRecords = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<Paginated<ComplianceRow>>('/api/compliance', { params }).then((r) => r.data)

export const createComplianceRecord = (body: {
  laneId: string
  score: number
  gdpStatus: boolean
  notes?: string
  openIssues: number
}) => apiClient.post<ComplianceRow>('/api/compliance', body).then((r) => r.data)

// Audit
export const getAuditEvents = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<Paginated<AuditEventRow>>('/api/audit', { params }).then((r) => r.data)

// Reference data
export const getPorts = () =>
  apiClient.get<Port[]>('/api/ports').then((r) => r.data)

export const getCarriers = () =>
  apiClient.get<Carrier[]>('/api/carriers').then((r) => r.data)
