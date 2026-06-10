/**
 * Status → visual meaning.
 *
 * MapLibre paint properties need concrete color values (not CSS variables),
 * so each status carries an explicit `dark` / `light` hex aligned to the
 * site's Liquid Nord emerald palette. `glow` is a softer outer-stroke tone.
 */

import type { LaneStatus } from './types'

export type ThemeMode = 'dark' | 'light'

export interface StatusStyle {
  label: string
  description: string
  /** Core line / marker color per theme */
  color: Record<ThemeMode, string>
  /** Outer glow color per theme (usually a lighter tint of color) */
  glow: Record<ThemeMode, string>
}

export const STATUS_STYLES: Record<LaneStatus, StatusStyle> = {
  on_track: {
    label: 'On track',
    description: 'Healthy cold chain, on schedule',
    color: { dark: '#2DD4A7', light: '#10B981' },
    glow: { dark: '#5EEAC4', light: '#5CD3AC' },
  },
  delayed: {
    label: 'Delayed',
    description: 'Behind schedule, monitor ETA',
    color: { dark: '#F0A53C', light: '#EA8C2E' },
    glow: { dark: '#FFC576', light: '#F5B45E' },
  },
  temperature_risk: {
    label: 'Temperature risk',
    description: 'Cold-chain excursion detected',
    color: { dark: '#54C8F0', light: '#2F8FE4' },
    glow: { dark: '#8FE0FB', light: '#74B6F2' },
  },
  customs_hold: {
    label: 'Customs hold',
    description: 'Held at border / documentation',
    color: { dark: '#E6C13E', light: '#CA8A04' },
    glow: { dark: '#F5DB78', light: '#E3B341' },
  },
  delivered: {
    label: 'Delivered',
    description: 'Arrived, chain complete',
    color: { dark: '#6FA98F', light: '#5C9B81' },
    glow: { dark: '#94C7AF', light: '#84BBA1' },
  },
  critical: {
    label: 'Critical',
    description: 'Requires immediate attention',
    color: { dark: '#F2675B', light: '#E0483B' },
    glow: { dark: '#FF9489', light: '#F0796C' },
  },
}

export const LANE_STATUS_ORDER: LaneStatus[] = [
  'on_track',
  'delayed',
  'temperature_risk',
  'customs_hold',
  'critical',
  'delivered',
]

export function statusColor(status: LaneStatus, theme: ThemeMode): string {
  return STATUS_STYLES[status].color[theme]
}

export function statusGlow(status: LaneStatus, theme: ThemeMode): string {
  return STATUS_STYLES[status].glow[theme]
}

export function statusLabel(status: LaneStatus): string {
  return STATUS_STYLES[status].label
}
