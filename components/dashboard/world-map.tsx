'use client'

import { useMemo } from 'react'
import { mockPorts } from '@/lib/mock-data'
import { LogisticsMap } from '@/components/map/LogisticsMap'
import { lanesToShipmentLanes } from '@/components/map/mockLanes'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLanes } from '@/lib/services/lanesService'

/**
 * Dashboard "Global Network Map" — premium, interactive MapLibre map.
 * Lanes come from the data service (Supabase when configured, else demo)
 * and are rendered as status-aware, clickable shipment lanes. Port
 * coordinates are resolved from the bundled port reference (codes match
 * the seeded ports).
 */
export function WorldMap() {
  const { data: lanes } = useQuery(getLanes, [])
  const shipmentLanes = useMemo(
    () => (lanes ? lanesToShipmentLanes(lanes, mockPorts) : []),
    [lanes],
  )
  return <LogisticsMap lanes={shipmentLanes} height="100%" />
}
