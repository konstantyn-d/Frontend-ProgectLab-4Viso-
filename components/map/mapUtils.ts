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

/**
 * Great-circle arc between two points. Returns a single continuous LineString.
 * Falls back to a straight 2-point line if the arc crosses the antimeridian
 * (rare for these corridors) so `turf.along` stays well-defined.
 */
export function buildLaneArc(lane: ShipmentLane): LaneArc {
  const from = turf.point(lane.from)
  const to = turf.point(lane.to)
  let line: Feature<LineString>
  try {
    const gc = turf.greatCircle(from, to, { npoints: 96 })
    if (gc.geometry.type === 'LineString') {
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
    features: lanes.map(lane => {
      const arc = arcs.get(lane.id) ?? buildLaneArc(lane)
      return {
        type: 'Feature',
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
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: lane.from },
      properties: { laneId: lane.id, role: 'origin', name: lane.fromName, status: lane.status, laneCode: lane.laneCode },
    })
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: lane.to },
      properties: { laneId: lane.id, role: 'destination', name: lane.toName, status: lane.status, laneCode: lane.laneCode },
    })
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
    if (!arc) return
    // Per-lane phase offset so markers aren't all synced (more "alive").
    const phase = (progress + i * 0.137) % 1
    const dist = arc.lengthKm * phase
    const pt = turf.along(arc.line, dist, { units: 'kilometers' })
    features.push({
      type: 'Feature',
      geometry: pt.geometry,
      properties: { laneId: lane.id, status: lane.status },
    })
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
  const [minX, minY, maxX, maxY] = turf.bbox(fc)
  return [
    [minX, minY],
    [maxX, maxY],
  ]
}

/** Midpoint of a single lane arc (used to centre the camera on focus). */
export function laneMidpoint(arc: LaneArc): LngLat {
  const mid = turf.along(arc.line, arc.lengthKm / 2, { units: 'kilometers' })
  return mid.geometry.coordinates as LngLat
}
