/**
 * Geometry helpers for the logistics map — built on Turf.js.
 *
 * - Curved lanes via great-circle interpolation.
 * - GeoJSON sources for lanes (lines) and endpoints (points).
 * - Distance + along-route sampling to animate the shipment marker.
 */

import * as turf from '@turf/turf'
import type { Feature, FeatureCollection, LineString, Point } from 'geojson'
import type { LngLat, ShipmentLane } from './types'

export interface LaneArc {
  /** Continuous great-circle line used for rendering + animation. */
  line: Feature<LineString>
  /** Route length in kilometres (for turf.along sampling). */
  lengthKm: number
}

/** A coordinate is usable only if it's a pair of finite, in-range numbers. */
function isValidLngLat(c: unknown): c is LngLat {
  return (
    Array.isArray(c) &&
    c.length >= 2 &&
    Number.isFinite(c[0]) && Number.isFinite(c[1]) &&
    Math.abs(c[0] as number) <= 180 && Math.abs(c[1] as number) <= 90
  )
}

/** True when a lane has valid, non-identical endpoints (drawable arc). */
function laneHasValidGeometry(lane: ShipmentLane): boolean {
  if (!isValidLngLat(lane.from) || !isValidLngLat(lane.to)) return false
  return lane.from[0] !== lane.to[0] || lane.from[1] !== lane.to[1]
}

/** An arc is sampleable only with ≥2 coords and a positive length. */
function arcIsSampleable(arc: LaneArc | undefined): arc is LaneArc {
  return Boolean(arc && arc.lengthKm > 0 && (arc.line.geometry.coordinates?.length ?? 0) >= 2)
}

/**
 * Great-circle arc between two points. Returns a single continuous LineString.
 * Falls back to a straight 2-point line if the arc crosses the antimeridian
 * (rare for these corridors) so `turf.along` stays well-defined.
 */
export function buildLaneArc(lane: ShipmentLane): LaneArc {
  // Guard against missing/NaN coordinates (e.g. a port code that didn't
  // resolve) — an empty geometry would make turf.along throw.
  if (!laneHasValidGeometry(lane)) {
    return { line: turf.lineString([[0, 0], [0, 0]]), lengthKm: 0 }
  }
  const from = turf.point(lane.from)
  const to = turf.point(lane.to)
  let line: Feature<LineString>
  try {
    const gc = turf.greatCircle(from, to, { npoints: 96 })
    if (gc.geometry.type === 'LineString' && (gc.geometry.coordinates?.length ?? 0) >= 2) {
      line = gc as Feature<LineString>
    } else {
      // MultiLineString (antimeridian split) — use a plain line for continuity.
      line = turf.lineString([lane.from, lane.to])
    }
  } catch {
    line = turf.lineString([lane.from, lane.to])
  }
  const lengthKm = turf.length(line, { units: 'kilometers' })
  return { line, lengthKm }
}

/** Cache of arcs keyed by lane id so we don't recompute every frame. */
export function buildArcMap(lanes: ShipmentLane[]): Map<string, LaneArc> {
  const map = new Map<string, LaneArc>()
  for (const lane of lanes) map.set(lane.id, buildLaneArc(lane))
  return map
}

/** FeatureCollection of lane arcs for the line layers. */
export function lanesToArcCollection(
  lanes: ShipmentLane[],
  arcs: Map<string, LaneArc>,
  selectedId: string | null,
): FeatureCollection<LineString> {
  return {
    type: 'FeatureCollection',
    features: lanes
      .filter(laneHasValidGeometry)
      .map(lane => {
        const arc = arcs.get(lane.id) ?? buildLaneArc(lane)
        return {
          type: 'Feature' as const,
          geometry: arc.line.geometry,
          properties: {
            id: lane.id,
            status: lane.status,
            laneCode: lane.laneCode,
            selected: lane.id === selectedId,
          },
        }
      }),
  }
}

/** FeatureCollection of origin + destination markers. */
export function lanesToEndpointCollection(lanes: ShipmentLane[]): FeatureCollection<Point> {
  const features: Feature<Point>[] = []
  for (const lane of lanes) {
    if (isValidLngLat(lane.from)) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: lane.from },
        properties: { laneId: lane.id, role: 'origin', name: lane.fromName, status: lane.status, laneCode: lane.laneCode },
      })
    }
    if (isValidLngLat(lane.to)) {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: lane.to },
        properties: { laneId: lane.id, role: 'destination', name: lane.toName, status: lane.status, laneCode: lane.laneCode },
      })
    }
  }
  return { type: 'FeatureCollection', features }
}

/** Animated shipment markers — one moving point per non-delivered lane. */
export function buildShipmentCollection(
  lanes: ShipmentLane[],
  arcs: Map<string, LaneArc>,
  progress: number, // 0..1 looped phase
): FeatureCollection<Point> {
  const features: Feature<Point>[] = []
  lanes.forEach((lane, i) => {
    if (lane.status === 'delivered') return
    const arc = arcs.get(lane.id)
    if (!arcIsSampleable(arc)) return // skip degenerate/missing arcs
    // Per-lane phase offset so markers aren't all synced (more "alive").
    const phase = (progress + i * 0.137) % 1
    const dist = arc.lengthKm * phase
    try {
      const pt = turf.along(arc.line, dist, { units: 'kilometers' })
      features.push({
        type: 'Feature',
        geometry: pt.geometry,
        properties: { laneId: lane.id, status: lane.status },
      })
    } catch {
      /* arc not sampleable this frame — skip rather than crash the loop */
    }
  })
  return { type: 'FeatureCollection', features }
}

/** Bounding box [[minLng,minLat],[maxLng,maxLat]] covering all lane arcs. */
export function lanesBounds(
  lanes: ShipmentLane[],
  arcs: Map<string, LaneArc>,
): [[number, number], [number, number]] | null {
  if (lanes.length === 0) return null
  const fc = lanesToArcCollection(lanes, arcs, null)
  if (fc.features.length === 0) return null
  const [minX, minY, maxX, maxY] = turf.bbox(fc)
  if (![minX, minY, maxX, maxY].every(Number.isFinite)) return null
  return [
    [minX, minY],
    [maxX, maxY],
  ]
}

/** Midpoint of a single lane arc (used to centre the camera on focus). */
export function laneMidpoint(arc: LaneArc): LngLat {
  const coords = arc.line.geometry.coordinates
  if (arc.lengthKm <= 0 || coords.length < 2) return (coords[0] ?? [0, 0]) as LngLat
  const mid = turf.along(arc.line, arc.lengthKm / 2, { units: 'kilometers' })
  return mid.geometry.coordinates as LngLat
}
