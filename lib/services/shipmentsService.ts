/**
 * Shipments data service. Supabase when configured, else demo fallback.
 * Maps DB rows to the existing UI `Shipment` type.
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { ShipmentRow, TemperatureReadingRow } from '@/lib/supabase/types'
import type { Shipment } from '@/lib/mock-data'
import { demoShipments } from './demoData'

type ShipmentJoined = ShipmentRow & {
  lane?: {
    code: string
    origin_code: string
    destination_code: string
    required_temp_min: number | null
    required_temp_max: number | null
    carrier?: { name: string } | null
  } | null
}

function mapShipStatus(status: string): Shipment['status'] {
  if (status === 'in_transit') return 'in-transit'
  if (status === 'delivered') return 'arrived'
  return status as Shipment['status']
}

function mapShipment(row: ShipmentJoined): Shipment {
  const lane = row.lane
  const laneCode = lane ? `${lane.origin_code}-${lane.destination_code}` : ''
  const tempMin = lane?.required_temp_min ?? 2
  const tempMax = lane?.required_temp_max ?? 8
  const status = mapShipStatus(row.status)
  return {
    id: row.shipment_number,
    laneId: lane?.code ?? '',
    laneCode,
    carrier: lane?.carrier?.name ?? 'Unknown carrier',
    currentLocation: row.current_location_name ?? '',
    lastTemp: row.current_temp ?? (tempMin + tempMax) / 2,
    tempMin,
    tempMax,
    eta: row.eta ?? '',
    status,
    departedAt: row.created_at,
    arrivedAt: status === 'arrived' ? row.eta ?? undefined : undefined,
  }
}

const SHIPMENT_SELECT =
  '*, lane:lanes(code,origin_code,destination_code,required_temp_min,required_temp_max, carrier:companies(name))'

export async function getShipments(): Promise<Shipment[]> {
  if (!isSupabaseConfigured()) return demoShipments()
  const sb = getSupabase()!
  const { data, error } = await sb.from('shipments').select(SHIPMENT_SELECT).order('shipment_number')
  if (error) throw new Error(error.message)
  return (data as ShipmentJoined[] ?? []).map(mapShipment)
}

export async function getShipmentsForLane(laneCode: string): Promise<Shipment[]> {
  if (!isSupabaseConfigured()) return demoShipments().filter(s => s.laneId === laneCode)
  const sb = getSupabase()!
  const { data: laneRow } = await sb.from('lanes').select('id').eq('code', laneCode).maybeSingle()
  if (!laneRow) return []
  const laneId = (laneRow as { id: string }).id
  const { data, error } = await sb.from('shipments').select(SHIPMENT_SELECT).eq('lane_id', laneId)
  if (error) throw new Error(error.message)
  return (data as ShipmentJoined[] ?? []).map(mapShipment)
}

/** Temperature history for a shipment (chart). Falls back to a synthetic series. */
export async function getTemperatureHistory(shipmentNumber: string): Promise<{ time: string; temp: number }[]> {
  if (!isSupabaseConfigured()) return []
  const sb = getSupabase()!
  const { data: shipRow } = await sb.from('shipments').select('id').eq('shipment_number', shipmentNumber).maybeSingle()
  if (!shipRow) return []
  const shipId = (shipRow as { id: string }).id
  const { data, error } = await sb
    .from('temperature_readings')
    .select('value, recorded_at')
    .eq('shipment_id', shipId)
    .order('recorded_at', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as Pick<TemperatureReadingRow, 'value' | 'recorded_at'>[] ?? []).map(r => ({
    time: new Date(r.recorded_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    temp: r.value,
  }))
}
