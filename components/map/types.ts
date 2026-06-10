/**
 * Logistics map — shared types
 *
 * `ShipmentLane` is the API/database-ready shape the map renders. Keep this
 * decoupled from the app's internal `Lane` model so the map can later be fed
 * directly from Supabase / a REST endpoint without touching the component.
 */

export type LaneStatus =
  | 'on_track'
  | 'delayed'
  | 'temperature_risk'
  | 'customs_hold'
  | 'delivered'
  | 'critical'

/** [longitude, latitude] — GeoJSON order */
export type LngLat = [number, number]

export interface ShipmentLane {
  /** Stable unique id, e.g. "SHIP-1024" */
  id: string
  /** Human lane code, e.g. "ANT-FRA-001" */
  laneCode: string
  fromName: string
  toName: string
  from: LngLat
  to: LngLat
  status: LaneStatus
  eta: string
  temperature: string
  /** 0–100 */
  riskScore: number
  carrier: string
  productType: string
  lastUpdate: string
}

export interface LogisticsMapProps {
  /** Lanes to render. If omitted, the component falls back to demo lanes. */
  lanes?: ShipmentLane[]
  /**
   * Single-lane mode (lane detail view): hides filters/summary, auto-fits the
   * one lane and renders a compact chrome. The first lane in `lanes` is used.
   */
  singleLane?: boolean
  /** Lane id to pre-select / focus on mount. */
  focusLaneId?: string
  /** Extra classes for the outer wrapper. */
  className?: string
  /** Wrapper height (CSS value). Defaults to 100%. */
  height?: string
  /** Hide the status legend (e.g. when the panel already shows a legend). */
  hideLegend?: boolean
  /** Hide the status filter chips + counters. */
  hideFilters?: boolean
}
