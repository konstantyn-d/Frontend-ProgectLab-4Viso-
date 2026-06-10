/**
 * Hand-written types mirroring the Supabase schema
 * (backend repo: src/database/migrations/002_pharmatrack_schema.sql).
 *
 * These are the DB row shapes. Services map them to the UI domain types
 * declared in `lib/mock-data.ts` so existing components stay unchanged.
 */

// ---- domain enums -------------------------------------------------
export type Role = 'admin' | 'operations_manager' | 'compliance_officer' | 'validator' | 'viewer'
export type CompanyType = 'carrier' | 'warehouse' | 'forwarder' | 'airport_handler' | 'port_operator' | 'customs_broker'
export type CertType = 'GDP' | 'IATA' | 'ISO_9001' | 'ISO_28000' | 'LOCAL_COMPLIANCE' | 'CEIV_PHARMA'
export type CertStatus = 'claimed' | 'valid' | 'expired' | 'rejected' | 'pending_review'
export type LaneMode = 'air' | 'sea' | 'road' | 'multi'
export type LaneDbStatus = 'active' | 'in_transit' | 'delayed' | 'customs' | 'delivered' | 'archived'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ComplianceStatus = 'compliant' | 'warning' | 'non_compliant' | 'pending'
export type NodeType = 'warehouse' | 'airport' | 'port' | 'hub' | 'customs' | 'final_delivery'
export type ValidationStatus = 'claimed' | 'validated' | 'missing' | 'rejected' | 'expired'
export type SegmentStatus = 'on_track' | 'delayed' | 'temperature_risk' | 'customs_hold' | 'critical' | 'delivered'
export type ShipmentDbStatus = 'loading' | 'in_transit' | 'customs' | 'delayed' | 'arrived' | 'delivered'
export type AlertType = 'temperature' | 'customs' | 'delay' | 'certification' | 'validator' | 'weather' | 'security' | 'sensor_offline'
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertStatus = 'open' | 'assigned' | 'resolved' | 'dismissed'

// ---- row types ----------------------------------------------------
export interface ProfileRow {
  id: string
  auth_user_id: string | null
  first_name: string
  last_name: string
  email: string
  avatar_url: string | null
  role: Role
  created_at: string
  updated_at: string
}

export interface PortRow {
  code: string
  name: string
  country: string
  city: string | null
  latitude: number | null
  longitude: number | null
  active_shipments: number | null
  compliance_rate: number | null
}

export interface CompanyRow {
  id: string
  name: string
  type: CompanyType
  location_name: string | null
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  contact_email: string | null
  contact_phone: string | null
  supported_modes: string[] | null
  storage_capabilities: string[] | null
  handling_capabilities: string[] | null
  temperature_capabilities: string[] | null
  security_level: 'low' | 'medium' | 'high' | null
  monitoring_systems: boolean | null
  created_at: string
  updated_at: string
}

export interface ValidatorRow {
  id: string
  user_id: string | null
  name: string
  organization: string | null
  email: string | null
  can_verify_certifications: boolean
  can_verify_capabilities: boolean
  can_verify_compliance: boolean
  active: boolean
  created_at: string
  updated_at: string
}

export interface CertificationRow {
  id: string
  company_id: string | null
  type: CertType
  certificate_number: string | null
  issued_by: string | null
  valid_from: string | null
  valid_until: string | null
  document_url: string | null
  status: CertStatus
  verified_by_validator_id: string | null
  verified_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface LaneRow {
  id: string
  code: string
  origin_code: string
  destination_code: string
  origin_name: string | null
  destination_name: string | null
  carrier_id: string | null
  mode: LaneMode
  status: LaneDbStatus
  required_temp_min: number | null
  required_temp_max: number | null
  required_certifications: string[] | null
  risk_score: number
  risk_level: RiskLevel
  compliance_status: ComplianceStatus
  progress: number
  current_node_id: string | null
  last_updated: string
  created_at: string
  updated_at: string
}

export interface NodeRow {
  id: string
  lane_id: string
  sequence: number
  code: string | null
  name: string | null
  location_name: string | null
  country: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  type: NodeType
  mode_from_previous: 'air' | 'sea' | 'road' | null
  responsible_company_id: string | null
  temperature_control: boolean
  temp_min: number | null
  temp_max: number | null
  security_level: 'low' | 'medium' | 'high' | null
  handling_capabilities: string[] | null
  special_conditions: string[] | null
  validation_status: ValidationStatus
  risk_score: number
  issues: unknown
  created_at: string
  updated_at: string
}

export interface LaneSegmentRow {
  id: string
  lane_id: string
  from_node_id: string | null
  to_node_id: string | null
  sequence: number
  mode: 'air' | 'sea' | 'road' | null
  carrier_id: string | null
  status: SegmentStatus
  risk_score: number
  estimated_duration_hours: number | null
  created_at: string
  updated_at: string
}

export interface PackageProfileRow {
  id: string
  goods_type: 'pharma' | 'perishable' | 'dangerous_goods'
  product_name: string | null
  cooling_type: 'passive' | 'active' | 'none'
  cooling_duration_hours: number | null
  sensitivity_temperature: boolean
  sensitivity_shock: boolean
  sensitivity_time: boolean
  required_temp_min: number | null
  required_temp_max: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ShipmentRow {
  id: string
  shipment_number: string
  lane_id: string | null
  package_profile_id: string | null
  current_node_id: string | null
  current_location_name: string | null
  current_latitude: number | null
  current_longitude: number | null
  eta: string | null
  status: ShipmentDbStatus
  current_temp: number | null
  last_sensor_update: string | null
  progress: number
  created_at: string
  updated_at: string
}

export interface TemperatureReadingRow {
  id: string
  shipment_id: string | null
  lane_id: string | null
  node_id: string | null
  value: number
  unit: string
  recorded_at: string
  source: 'sensor' | 'manual' | 'carrier_api' | 'demo'
  created_at: string
}

export interface AlertRow {
  id: string
  type: AlertType
  severity: AlertSeverity
  lane_id: string | null
  shipment_id: string | null
  node_id: string | null
  title: string
  message: string | null
  recommended_action: string | null
  status: AlertStatus
  assigned_to: string | null
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
}

export interface AuditLogRow {
  id: string
  actor_id: string | null
  action_type: string
  entity_type: string | null
  entity_id: string | null
  lane_id: string | null
  shipment_id: string | null
  description: string | null
  metadata: unknown
  created_at: string
}

export interface DocumentRow {
  id: string
  entity_type: 'company' | 'lane' | 'shipment' | 'certification' | 'audit'
  entity_id: string | null
  lane_id: string | null
  shipment_id: string | null
  type: string
  name: string
  file_url: string | null
  uploaded_by: string | null
  created_at: string
}

// ---- Database map for createClient<Database>() --------------------
type TableShape<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> }

export interface Database {
  public: {
    Tables: {
      profiles: TableShape<ProfileRow>
      ports: TableShape<PortRow>
      companies: TableShape<CompanyRow>
      validators: TableShape<ValidatorRow>
      certifications: TableShape<CertificationRow>
      lanes: TableShape<LaneRow>
      nodes: TableShape<NodeRow>
      lane_segments: TableShape<LaneSegmentRow>
      package_profiles: TableShape<PackageProfileRow>
      shipments: TableShape<ShipmentRow>
      temperature_readings: TableShape<TemperatureReadingRow>
      alerts: TableShape<AlertRow>
      audit_logs: TableShape<AuditLogRow>
      documents: TableShape<DocumentRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
