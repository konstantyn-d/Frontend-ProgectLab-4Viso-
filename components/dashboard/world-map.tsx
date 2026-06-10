'use client'

import { useMemo } from 'react'
import { mockLanes, mockPorts } from '@/lib/mock-data'
import { LogisticsMap } from '@/components/map/LogisticsMap'
import { lanesToShipmentLanes } from '@/components/map/mockLanes'

/**
 * Dashboard "Global Network Map" — now a premium, interactive MapLibre map.
 * Lanes are derived from the app's existing lane/port data and rendered as
 * status-aware, clickable shipment lanes. Swap `lanesToShipmentLanes(...)`
 * for live API/Supabase data when ready.
 */
export function WorldMap() {
  const lanes = useMemo(() => lanesToShipmentLanes(mockLanes, mockPorts), [])
  return <LogisticsMap lanes={lanes} height="100%" />
}
