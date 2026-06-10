'use client'

/**
 * LogisticsMap — premium 3D shipment-lane map.
 *
 * Engine:  MapLibre GL JS (free, open source)
 * Tiles:   OpenFreeMap (dark / positron) — no API key, no paid service
 * Geometry: Turf.js (great-circle arcs, along-route animation, bbox)
 *
 * Data-driven: pass `lanes` (ShipmentLane[]). Falls back to demo lanes.
 * Theme-aware: follows the site ThemeContext (dark / light), recolours the
 * base style + lanes to the Liquid Nord palette.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, {
  type ExpressionSpecification,
  type GeoJSONSource,
  type LngLatBoundsLike,
  type MapGeoJSONFeature,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { Layers, Crosshair, RotateCcw, AlertTriangle, X, Thermometer, Gauge, Package, Truck, Clock, MapPin } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'
import type { LaneStatus, LogisticsMapProps, ShipmentLane } from './types'
import { LANE_STATUS_ORDER, STATUS_STYLES, statusColor, statusGlow, type ThemeMode } from './statusStyles'
import { demoLanes } from './mockLanes'
import { buildArcMap, buildShipmentCollection, lanesBounds, lanesToArcCollection, lanesToEndpointCollection, type LaneArc } from './mapUtils'

const STYLE_URLS: Record<ThemeMode, string> = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
}

const ANIM_DURATION = 17000 // ms for a full route traversal (subtle)

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

/** Resolve a CSS custom property from the document for exact palette match. */
function readVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function statusMatchExpr(theme: ThemeMode, kind: 'color' | 'glow'): ExpressionSpecification {
  const expr: unknown[] = ['match', ['get', 'status']]
  for (const s of LANE_STATUS_ORDER) {
    expr.push(s, kind === 'color' ? statusColor(s, theme) : statusGlow(s, theme))
  }
  expr.push(theme === 'dark' ? '#8AA398' : '#5C7268') // default
  return expr as unknown as ExpressionSpecification
}

export function LogisticsMap({
  lanes,
  singleLane = false,
  focusLaneId,
  className,
  height = '100%',
  hideLegend = false,
  hideFilters = false,
}: LogisticsMapProps) {
  const { theme } = useTheme()
  const themeMode: ThemeMode = theme === 'light' ? 'light' : 'dark'

  const allLanes = useMemo<ShipmentLane[]>(
    () => (lanes && lanes.length > 0 ? lanes : demoLanes),
    [lanes],
  )
  const arcs = useMemo<Map<string, LaneArc>>(() => buildArcMap(allLanes), [allLanes])

  // ---- UI state ----
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(focusLaneId ?? (singleLane ? (allLanes[0]?.id ?? null) : null))
  const [active, setActive] = useState<Set<LaneStatus>>(() => new Set(LANE_STATUS_ORDER))
  const [legendOpen, setLegendOpen] = useState(!hideLegend && !singleLane)

  const visibleLanes = useMemo(
    () => (singleLane ? allLanes : allLanes.filter(l => active.has(l.status))),
    [allLanes, active, singleLane],
  )

  // ---- refs ----
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const hoverPopupRef = useRef<maplibregl.Popup | null>(null)
  const markerPopupRef = useRef<maplibregl.Popup | null>(null)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number>(0)
  const hoveredRef = useRef<string | null>(null)
  const themeRef = useRef<ThemeMode>(themeMode)
  const visibleLanesRef = useRef<ShipmentLane[]>(visibleLanes)
  const arcsRef = useRef<Map<string, LaneArc>>(arcs)
  const selectedRef = useRef<string | null>(selectedId)

  themeRef.current = themeMode
  visibleLanesRef.current = visibleLanes
  arcsRef.current = arcs
  selectedRef.current = selectedId

  const selectedLane = useMemo(
    () => allLanes.find(l => l.id === selectedId) ?? null,
    [allLanes, selectedId],
  )

  // ---- camera helpers ----
  const fitToLanes = useCallback((lanesToFit: ShipmentLane[], opts?: { duration?: number }) => {
    const map = mapRef.current
    if (!map) return
    const bounds = lanesBounds(lanesToFit, arcsRef.current)
    if (!bounds) return
    map.fitBounds(bounds as LngLatBoundsLike, {
      padding: singleLane ? 64 : { top: 70, bottom: 70, left: 70, right: 70 },
      pitch: singleLane ? 42 : 38,
      bearing: singleLane ? 0 : -6,
      maxZoom: singleLane ? 6.5 : 5.5,
      duration: opts?.duration ?? 900,
    })
  }, [singleLane])

  const focusLane = useCallback((id: string) => {
    const lane = visibleLanesRef.current.find(l => l.id === id) ?? allLanes.find(l => l.id === id)
    if (lane) fitToLanes([lane], { duration: 1100 })
  }, [allLanes, fitToLanes])

  // ---- (re)build the custom sources + layers; runs on every style (re)load ----
  const addLayers = useCallback(() => {
    const map = mapRef.current
    if (!map) return
    const t = themeRef.current

    // Recolour base style to the site palette (background + water).
    const bg = readVar('--map-bg', t === 'dark' ? '#0C1411' : '#EDF3F0')
    const water = t === 'dark' ? '#0B1F1A' : '#DCE9E4'
    try {
      const style = map.getStyle()
      for (const layer of style.layers ?? []) {
        if (layer.id === 'background') map.setPaintProperty(layer.id, 'background-color', bg)
        if (layer.type === 'fill' && /water/i.test(layer.id)) {
          try { map.setPaintProperty(layer.id, 'fill-color', water) } catch { /* layer paint mismatch */ }
        }
      }
    } catch { /* style not introspectable */ }

    // Find the first symbol (label) layer so lanes render under labels.
    let firstSymbolId: string | undefined
    const vectorSourceIds: string[] = []
    try {
      const style = map.getStyle()
      for (const [id, src] of Object.entries(style.sources ?? {})) {
        if ((src as { type?: string }).type === 'vector') vectorSourceIds.push(id)
      }
      for (const layer of style.layers ?? []) {
        if (layer.type === 'symbol') { firstSymbolId = layer.id; break }
      }
    } catch { /* ignore */ }

    // 3D buildings (premium when zoomed into a city). Guarded — only renders
    // if the vector source exposes a `building` source-layer.
    if (vectorSourceIds[0] && !map.getLayer('lm-buildings')) {
      try {
        map.addLayer({
          id: 'lm-buildings',
          type: 'fill-extrusion',
          source: vectorSourceIds[0],
          'source-layer': 'building',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': t === 'dark' ? '#16261F' : '#D7E4DD',
            'fill-extrusion-height': ['coalesce', ['get', 'render_height'], ['get', 'height'], 12],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0],
            'fill-extrusion-opacity': 0.75,
          },
        }, firstSymbolId)
      } catch { /* no building layer in this style */ }
    }

    // Sources --------------------------------------------------------------
    const arcFC = lanesToArcCollection(visibleLanesRef.current, arcsRef.current, selectedRef.current)
    const endpointFC = lanesToEndpointCollection(visibleLanesRef.current)
    const shipmentFC = buildShipmentCollection(visibleLanesRef.current, arcsRef.current, 0)

    if (!map.getSource('lm-lanes')) {
      map.addSource('lm-lanes', { type: 'geojson', data: arcFC, promoteId: 'id' })
    } else {
      (map.getSource('lm-lanes') as GeoJSONSource).setData(arcFC)
    }
    if (!map.getSource('lm-endpoints')) {
      map.addSource('lm-endpoints', { type: 'geojson', data: endpointFC })
    } else {
      (map.getSource('lm-endpoints') as GeoJSONSource).setData(endpointFC)
    }
    if (!map.getSource('lm-shipments')) {
      map.addSource('lm-shipments', { type: 'geojson', data: shipmentFC })
    } else {
      (map.getSource('lm-shipments') as GeoJSONSource).setData(shipmentFC)
    }

    const colorExpr = statusMatchExpr(t, 'color')
    const glowExpr = statusMatchExpr(t, 'glow')

    // Lane glow (wide, blurred, brighter when selected/hovered) -------------
    if (!map.getLayer('lm-lane-glow')) {
      map.addLayer({
        id: 'lm-lane-glow',
        type: 'line',
        source: 'lm-lanes',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': glowExpr,
          'line-blur': 6,
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            1, ['case', ['any', ['boolean', ['feature-state', 'selected'], false], ['boolean', ['feature-state', 'hover'], false]], 9, 5],
            6, ['case', ['any', ['boolean', ['feature-state', 'selected'], false], ['boolean', ['feature-state', 'hover'], false]], 16, 9],
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 0.45,
            ['boolean', ['feature-state', 'hover'], false], 0.4,
            0.18,
          ],
        },
      }, firstSymbolId)
    } else {
      map.setPaintProperty('lm-lane-glow', 'line-color', glowExpr)
    }

    // Lane main line -------------------------------------------------------
    if (!map.getLayer('lm-lane-line')) {
      map.addLayer({
        id: 'lm-lane-line',
        type: 'line',
        source: 'lm-lanes',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': colorExpr,
          'line-width': [
            'interpolate', ['linear'], ['zoom'],
            1, ['case', ['boolean', ['feature-state', 'selected'], false], 3.2, ['boolean', ['feature-state', 'hover'], false], 2.6, 1.6],
            6, ['case', ['boolean', ['feature-state', 'selected'], false], 5, ['boolean', ['feature-state', 'hover'], false], 4, 2.6],
          ],
          'line-opacity': [
            'case',
            ['boolean', ['feature-state', 'selected'], false], 1,
            ['boolean', ['feature-state', 'hover'], false], 0.95,
            0.82,
          ],
        },
      }, firstSymbolId)
    } else {
      map.setPaintProperty('lm-lane-line', 'line-color', colorExpr)
    }

    // Endpoint halo + dot --------------------------------------------------
    const ringStroke = readVar('--card', t === 'dark' ? '#121E19' : '#FFFFFF')
    if (!map.getLayer('lm-endpoint-halo')) {
      map.addLayer({
        id: 'lm-endpoint-halo',
        type: 'circle',
        source: 'lm-endpoints',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 5, 6, 11],
          'circle-color': colorExpr,
          'circle-opacity': 0.22,
          'circle-blur': 0.6,
        },
      }, firstSymbolId)
    } else {
      map.setPaintProperty('lm-endpoint-halo', 'circle-color', colorExpr)
    }
    if (!map.getLayer('lm-endpoint-dot')) {
      map.addLayer({
        id: 'lm-endpoint-dot',
        type: 'circle',
        source: 'lm-endpoints',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3, 6, 5.5],
          'circle-color': colorExpr,
          'circle-stroke-color': ringStroke,
          'circle-stroke-width': 1.5,
        },
      }, firstSymbolId)
    } else {
      map.setPaintProperty('lm-endpoint-dot', 'circle-color', colorExpr)
      map.setPaintProperty('lm-endpoint-dot', 'circle-stroke-color', ringStroke)
    }

    // Animated shipment glow + core ---------------------------------------
    if (!map.getLayer('lm-ship-glow')) {
      map.addLayer({
        id: 'lm-ship-glow',
        type: 'circle',
        source: 'lm-shipments',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 8, 6, 13],
          'circle-color': colorExpr,
          'circle-opacity': 0.35,
          'circle-blur': 0.8,
        },
      }, firstSymbolId)
    } else {
      map.setPaintProperty('lm-ship-glow', 'circle-color', colorExpr)
    }
    if (!map.getLayer('lm-ship-core')) {
      map.addLayer({
        id: 'lm-ship-core',
        type: 'circle',
        source: 'lm-shipments',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 1, 3.4, 6, 5],
          'circle-color': colorExpr,
          'circle-stroke-color': ringStroke,
          'circle-stroke-width': 1.5,
        },
      }, firstSymbolId)
    } else {
      map.setPaintProperty('lm-ship-core', 'circle-color', colorExpr)
      map.setPaintProperty('lm-ship-core', 'circle-stroke-color', ringStroke)
    }

    applySelectionState()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- selection feature-state ----
  const applySelectionState = useCallback(() => {
    const map = mapRef.current
    if (!map || !map.getSource('lm-lanes')) return
    try {
      map.removeFeatureState({ source: 'lm-lanes' })
      if (selectedRef.current) {
        map.setFeatureState({ source: 'lm-lanes', id: selectedRef.current }, { selected: true })
      }
    } catch { /* source not ready */ }
  }, [])

  // ---- re-apply geometry when the lanes data changes (async load / CRUD) ----
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const lanesSrc = map.getSource('lm-lanes') as GeoJSONSource | undefined
    const endpointsSrc = map.getSource('lm-endpoints') as GeoJSONSource | undefined
    if (lanesSrc) lanesSrc.setData(lanesToArcCollection(visibleLanes, arcs, selectedRef.current))
    if (endpointsSrc) endpointsSrc.setData(lanesToEndpointCollection(visibleLanes))
    applySelectionState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleLanes, arcs, ready])

  // ====================================================================
  // INIT (once)
  // ====================================================================
  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    if (!hasWebGL()) {
      setError('Your browser does not support WebGL, required for the map.')
      return
    }

    let map: maplibregl.Map
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URLS[themeRef.current],
        center: singleLane && allLanes[0] ? allLanes[0].from : [30, 30],
        zoom: singleLane ? 3 : 1.4,
        pitch: singleLane ? 42 : 38,
        bearing: singleLane ? 0 : -6,
        attributionControl: { compact: true },
        canvasContextAttributes: { antialias: true },
        dragRotate: true,
      })
    } catch (e) {
      setError('Failed to initialise the map engine.')
      return
    }
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showZoom: true, showCompass: true }), 'top-right')

    hoverPopupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: 'lm-popup lm-popup-hover', offset: 12, maxWidth: '260px' })
    markerPopupRef.current = new maplibregl.Popup({ closeButton: true, closeOnClick: true, className: 'lm-popup', offset: 14, maxWidth: '260px' })

    // Re-add custom data whenever the style (re)loads (init + theme switch).
    map.on('style.load', () => {
      try {
        map.setProjection({ type: singleLane ? 'mercator' : 'globe' })
      } catch { /* projection unsupported */ }
      addLayers()
    })

    map.on('load', () => {
      setReady(true)
      fitToLanes(singleLane ? allLanes.slice(0, 1) : visibleLanesRef.current, { duration: 0 })
      if (selectedRef.current && !singleLane) {
        const lane = allLanes.find(l => l.id === selectedRef.current)
        if (lane) fitToLanes([lane], { duration: 0 })
      }
      // Start the shipment animation ONLY after the initial load. Calling
      // setData on a source every frame keeps style.loaded() false, which
      // would otherwise prevent the 'load' event from ever firing.
      startRef.current = performance.now()
      const tick = (now: number) => {
        const phase = ((now - startRef.current) % ANIM_DURATION) / ANIM_DURATION
        const src = map.getSource('lm-shipments') as GeoJSONSource | undefined
        if (src) src.setData(buildShipmentCollection(visibleLanesRef.current, arcsRef.current, phase))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    })

    // ---- interactions ----
    const onLaneEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onLaneMove = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined
      if (!f) return
      const id = String(f.properties?.id ?? '')
      if (hoveredRef.current && hoveredRef.current !== id) {
        map.setFeatureState({ source: 'lm-lanes', id: hoveredRef.current }, { hover: false })
      }
      hoveredRef.current = id
      map.setFeatureState({ source: 'lm-lanes', id }, { hover: true })

      const lane = visibleLanesRef.current.find(l => l.id === id)
      if (lane && hoverPopupRef.current) {
        const meta = STATUS_STYLES[lane.status]
        hoverPopupRef.current
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="lm-tip">
               <div class="lm-tip-row"><span class="lm-dot" style="background:${meta.color[themeRef.current]}"></span>
               <b>${lane.laneCode}</b></div>
               <div class="lm-tip-sub">${lane.fromName} → ${lane.toName}</div>
               <div class="lm-tip-meta">${meta.label} · ${lane.temperature} · risk ${lane.riskScore}</div>
             </div>`,
          )
          .addTo(map)
      }
    }
    const onLaneLeave = () => {
      map.getCanvas().style.cursor = ''
      if (hoveredRef.current) {
        map.setFeatureState({ source: 'lm-lanes', id: hoveredRef.current }, { hover: false })
        hoveredRef.current = null
      }
      hoverPopupRef.current?.remove()
    }
    const onLaneClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined
      if (!f) return
      const id = String(f.properties?.id ?? '')
      setSelectedId(id)
      focusLane(id)
    }
    const onMarkerClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined
      if (!f || f.geometry.type !== 'Point') return
      const role = f.properties?.role === 'origin' ? 'Origin' : 'Destination'
      const name = String(f.properties?.name ?? '')
      const laneCode = String(f.properties?.laneCode ?? '')
      markerPopupRef.current
        ?.setLngLat(f.geometry.coordinates as [number, number])
        .setHTML(`<div class="lm-tip"><div class="lm-tip-meta">${role}</div><b>${name}</b><div class="lm-tip-sub">${laneCode}</div></div>`)
        .addTo(map)
    }
    const onMarkerEnter = () => { map.getCanvas().style.cursor = 'pointer' }
    const onMarkerLeave = () => { map.getCanvas().style.cursor = '' }
    const onBgClick = (e: maplibregl.MapMouseEvent) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: ['lm-lane-line', 'lm-endpoint-dot', 'lm-endpoint-halo'] })
      if (hits.length === 0 && !singleLane) setSelectedId(null)
    }

    map.on('mouseenter', 'lm-lane-line', onLaneEnter)
    map.on('mousemove', 'lm-lane-line', onLaneMove)
    map.on('mouseleave', 'lm-lane-line', onLaneLeave)
    map.on('click', 'lm-lane-line', onLaneClick)
    map.on('click', 'lm-endpoint-dot', onMarkerClick)
    map.on('mouseenter', 'lm-endpoint-dot', onMarkerEnter)
    map.on('mouseleave', 'lm-endpoint-dot', onMarkerLeave)
    map.on('click', onBgClick)

    // ---- responsive resize ----
    const ro = new ResizeObserver(() => map.resize())
    ro.observe(containerRef.current)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      hoverPopupRef.current?.remove()
      markerPopupRef.current?.remove()
      map.remove()
      mapRef.current = null
      setReady(false)
    }
    // Init must run once; theme/lane updates are handled by the effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- theme switch: swap the base style (style.load re-adds our layers) ----
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.setStyle(STYLE_URLS[themeMode])
  }, [themeMode, ready])

  // ---- lanes / filter changes: update sources + selection ----
  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const laneSrc = map.getSource('lm-lanes') as GeoJSONSource | undefined
    const endSrc = map.getSource('lm-endpoints') as GeoJSONSource | undefined
    if (laneSrc) laneSrc.setData(lanesToArcCollection(visibleLanes, arcsRef.current, selectedRef.current))
    if (endSrc) endSrc.setData(lanesToEndpointCollection(visibleLanes))
    applySelectionState()
  }, [visibleLanes, ready, applySelectionState])

  // ---- selection change: highlight ----
  useEffect(() => {
    if (!ready) return
    applySelectionState()
  }, [selectedId, ready, applySelectionState])

  // ---- counters ----
  const counts = useMemo(() => ({
    active: allLanes.filter(l => l.status !== 'delivered').length,
    delayed: allLanes.filter(l => l.status === 'delayed').length,
    critical: allLanes.filter(l => l.status === 'critical' || l.status === 'temperature_risk').length,
  }), [allLanes])

  const toggleStatus = (s: LaneStatus) => {
    setActive(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      if (next.size === 0) return new Set(LANE_STATUS_ORDER) // never empty
      return next
    })
  }
  const resetView = () => { setActive(new Set(LANE_STATUS_ORDER)); fitToLanes(allLanes) }
  const showOnlyCritical = () => setActive(new Set<LaneStatus>(['critical', 'temperature_risk']))

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <div className={cn('relative w-full overflow-hidden', className)} style={{ height, background: 'var(--map-bg)' }}>
      {/* MapLibre forces `.maplibregl-map { position: relative }`, which would
          override an `absolute inset-0` container and collapse it to 0 height
          (then `load` never fires). Size it explicitly instead. */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Loading */}
      {!ready && !error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ background: 'var(--map-bg)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="h-7 w-7 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--muted-foreground)' }}>Loading map…</span>
          </div>
        </div>
      )}

      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 text-center" style={{ background: 'var(--map-bg)' }}>
          <div className="max-w-[280px]">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[12px]" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
              <AlertTriangle className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <p className="text-[13px]" style={{ color: 'var(--foreground)' }}>{error}</p>
          </div>
        </div>
      )}

      {/* Filters + counters (multi-lane only) */}
      {!singleLane && !hideFilters && (
        <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-110px)] flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {LANE_STATUS_ORDER.map(s => {
              const on = active.has(s)
              const meta = STATUS_STYLES[s]
              return (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.05em] transition-all"
                  style={{
                    background: on ? 'var(--card)' : 'transparent',
                    borderColor: on ? 'var(--accent-line)' : 'var(--border)',
                    color: on ? 'var(--foreground)' : 'var(--text-muted)',
                    opacity: on ? 1 : 0.6,
                  }}
                >
                  <span className="h-[7px] w-[7px] rounded-full" style={{ background: meta.color[themeMode] }} />
                  {meta.label}
                </button>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Counter label="Active" value={counts.active} tone="var(--accent-deep)" />
            <Counter label="Delayed" value={counts.delayed} tone="var(--warn)" />
            <Counter label="At risk" value={counts.critical} tone="var(--danger)" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="absolute left-3 bottom-3 z-10 flex flex-col gap-1.5">
        {!singleLane && (
          <MapButton onClick={resetView} title="Reset view"><RotateCcw size={14} strokeWidth={1.6} /></MapButton>
        )}
        {!singleLane && (
          <MapButton onClick={showOnlyCritical} title="Show only at-risk"><AlertTriangle size={14} strokeWidth={1.6} /></MapButton>
        )}
        {selectedId && (
          <MapButton onClick={() => focusLane(selectedId)} title="Focus selected lane"><Crosshair size={14} strokeWidth={1.6} /></MapButton>
        )}
        {!hideLegend && (
          <MapButton onClick={() => setLegendOpen(o => !o)} title="Toggle legend" active={legendOpen}><Layers size={14} strokeWidth={1.6} /></MapButton>
        )}
      </div>

      {/* Legend */}
      {legendOpen && !hideLegend && (
        <div
          className="absolute bottom-3 z-10 rounded-[var(--r-md)] border p-3"
          style={{ right: 12, background: 'var(--bg-glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-2)' }}
        >
          <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: 'var(--muted-foreground)' }}>Lane status</p>
          <div className="grid gap-1.5">
            {LANE_STATUS_ORDER.map(s => (
              <div key={s} className="flex items-center gap-2">
                <span className="h-[3px] w-[16px] rounded-full" style={{ background: STATUS_STYLES[s].color[themeMode] }} />
                <span className="text-[11px]" style={{ color: 'var(--text-body)' }}>{STATUS_STYLES[s].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected lane side panel (multi-lane only) */}
      {!singleLane && selectedLane && (
        <LanePanel lane={selectedLane} themeMode={themeMode} onClose={() => setSelectedId(null)} onFocus={() => focusLane(selectedLane.id)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MapButton({ children, onClick, title, active }: { children: React.ReactNode; onClick: () => void; title: string; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--r-sm)] border transition-all hover:-translate-y-px"
      style={{
        background: active ? 'var(--accent-wash)' : 'var(--card)',
        borderColor: active ? 'var(--accent-line)' : 'var(--border)',
        color: active ? 'var(--accent-deep)' : 'var(--muted-foreground)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      {children}
    </button>
  )
}

function Counter({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px]"
      style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderColor: 'var(--border)', color: 'var(--text-body)' }}
    >
      <span className="h-[6px] w-[6px] rounded-full" style={{ background: tone }} />
      <b className="font-mono" style={{ color: 'var(--foreground)' }}>{value}</b>
      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
    </span>
  )
}

function LanePanel({ lane, themeMode, onClose, onFocus }: { lane: ShipmentLane; themeMode: ThemeMode; onClose: () => void; onFocus: () => void }) {
  const meta = STATUS_STYLES[lane.status]
  const color = meta.color[themeMode]
  const rows: { icon: React.ReactNode; label: string; value: string; tone?: string }[] = [
    { icon: <MapPin size={13} strokeWidth={1.6} />, label: 'Origin', value: lane.fromName },
    { icon: <MapPin size={13} strokeWidth={1.6} />, label: 'Destination', value: lane.toName },
    { icon: <Truck size={13} strokeWidth={1.6} />, label: 'Carrier', value: lane.carrier },
    { icon: <Package size={13} strokeWidth={1.6} />, label: 'Product', value: lane.productType },
    { icon: <Clock size={13} strokeWidth={1.6} />, label: 'ETA', value: lane.eta },
    { icon: <Thermometer size={13} strokeWidth={1.6} />, label: 'Temperature', value: lane.temperature, tone: lane.status === 'temperature_risk' || lane.status === 'critical' ? 'var(--danger)' : undefined },
    { icon: <Gauge size={13} strokeWidth={1.6} />, label: 'Risk score', value: `${lane.riskScore}`, tone: lane.riskScore > 60 ? 'var(--danger)' : lane.riskScore > 30 ? 'var(--warn)' : 'var(--accent-deep)' },
    { icon: <Clock size={13} strokeWidth={1.6} />, label: 'Last update', value: lane.lastUpdate },
  ]
  return (
    <div
      className="absolute right-3 top-3 z-10 w-[290px] max-w-[calc(100%-24px)] overflow-hidden rounded-[var(--r-lg)] border"
      style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(16px) saturate(140%)', WebkitBackdropFilter: 'blur(16px) saturate(140%)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-2)' }}
    >
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--line-soft)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="h-[8px] w-[8px] rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
            <span className="font-mono text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{lane.id}</span>
          </div>
          <p className="mt-0.5 font-mono text-[10.5px] uppercase tracking-[0.08em]" style={{ color: 'var(--muted-foreground)' }}>{lane.laneCode}</p>
        </div>
        <button onClick={onClose} aria-label="Close" className="text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]">
          <X size={16} strokeWidth={1.6} />
        </button>
      </div>

      <div className="px-4 py-2.5">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em]"
          style={{ color, borderColor: color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
        >
          {meta.label}
        </span>
      </div>

      <div className="px-4 pb-3">
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center justify-between gap-3 py-[7px]" style={{ borderTop: i === 0 ? undefined : '1px solid var(--line-soft)' }}>
            <span className="flex items-center gap-2 text-[11.5px]" style={{ color: 'var(--muted-foreground)' }}>
              <span style={{ color: 'var(--text-muted)' }}>{r.icon}</span>{r.label}
            </span>
            <span className="text-[12px] text-right" style={{ color: r.tone ?? 'var(--foreground)', fontWeight: 500 }}>{r.value}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={onFocus}
          className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-[12px] font-medium transition-all hover:-translate-y-px"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}
        >
          <Crosshair size={14} strokeWidth={1.6} /> Focus lane
        </button>
      </div>
    </div>
  )
}

export default LogisticsMap
