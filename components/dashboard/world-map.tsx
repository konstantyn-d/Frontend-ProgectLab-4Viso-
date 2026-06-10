'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'
import { Plus, Minus, Home } from 'lucide-react'
import { mockLanes, mockPorts, type Lane } from '@/lib/mock-data'

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const MIN_ZOOM = 1
const MAX_ZOOM = 8
const INITIAL_CENTER: [number, number] = [10, 20]
const INITIAL_ZOOM = 1

interface Position {
  coordinates: [number, number]
  zoom: number
}

interface ActiveRoute {
  lane: Lane
  originCoords: [number, number]
  destCoords: [number, number]
  stroke: string
  highRisk: boolean
}

export function WorldMap() {
  const [position, setPosition] = useState<Position>({
    coordinates: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
  })
  const [isAnimating, setIsAnimating] = useState(false)
  const [hoveredLane, setHoveredLane] = useState<ActiveRoute | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMoveEnd = useCallback((newPosition: Position) => {
    setPosition(newPosition)
  }, [])

  const handleZoomIn = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.min(pos.zoom * 1.5, MAX_ZOOM),
    }))
  }, [])

  const handleZoomOut = useCallback(() => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.max(pos.zoom / 1.5, MIN_ZOOM),
    }))
  }, [])

  const handleReset = useCallback(() => {
    setIsAnimating(true)
    setPosition({
      coordinates: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    })
    setTimeout(() => setIsAnimating(false), 300)
  }, [])

  const activeRoutes = useMemo<ActiveRoute[]>(() => {
    return mockLanes
      .filter(l => l.status !== 'arrived')
      .map(lane => {
        const origin = mockPorts.find(p => p.code === lane.originCode)
        const dest = mockPorts.find(p => p.code === lane.destinationCode)
        if (!origin || !dest) return null
        const highRisk = lane.tempDeviation || lane.riskScore > 60 || lane.status === 'delayed'
        const compliant = lane.gdpCompliant && !lane.tempDeviation
        return {
          lane,
          originCoords: [origin.lng, origin.lat] as [number, number],
          destCoords: [dest.lng, dest.lat] as [number, number],
          stroke: highRisk ? '#E53E3E' : compliant ? '#10B981' : '#C97B1A',
          highRisk,
        }
      })
      .filter((r): r is ActiveRoute => r !== null)
  }, [])

  const endpointPorts = useMemo(() => {
    const codes = new Set<string>()
    mockLanes.forEach(l => {
      if (l.status !== 'arrived') {
        codes.add(l.originCode)
        codes.add(l.destinationCode)
      }
    })
    return mockPorts.filter(p => codes.has(p.code))
  }, [])

  const highRiskCodes = useMemo(() => {
    const codes = new Set<string>()
    mockLanes.forEach(l => {
      if (l.tempDeviation || l.riskScore > 60) {
        codes.add(l.originCode)
        codes.add(l.destinationCode)
      }
    })
    return codes
  }, [])

  // Inverse scale for markers and labels to keep them constant size
  const markerScale = 1 / position.zoom

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-[var(--map-bg)]">
      {/* Floating zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        <button
          onClick={handleZoomIn}
          disabled={position.zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className="w-7 h-7 flex items-center justify-center bg-card border border-[var(--border-hover)] text-muted-foreground hover:text-[#10B981] hover:border-[#10B981]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleZoomOut}
          disabled={position.zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className="w-7 h-7 flex items-center justify-center bg-card border border-[var(--border-hover)] text-muted-foreground hover:text-[#10B981] hover:border-[#10B981]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button
          onClick={handleReset}
          aria-label="Reset view"
          className="w-7 h-7 flex items-center justify-center bg-card border border-[var(--border-hover)] text-muted-foreground hover:text-[#10B981] hover:border-[#10B981]/30 transition-colors"
        >
          <Home size={14} strokeWidth={1.5} />
        </button>
      </div>

      <ComposableMap
        projectionConfig={{ scale: 140, center: [10, 20] }}
        width={980}
        height={460}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup
          center={position.coordinates}
          zoom={position.zoom}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onMoveEnd={handleMoveEnd}
          translateExtent={[
            [-200, -200],
            [1180, 660],
          ]}
          style={{
            transition: isAnimating ? 'transform 300ms ease-out' : undefined,
            cursor: 'grab',
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: 'var(--map-land)', stroke: 'var(--map-stroke)', strokeWidth: 0.5, outline: 'none' },
                    hover: { fill: 'var(--map-land)', stroke: 'var(--map-stroke-hover)', strokeWidth: 0.5, outline: 'none' },
                    pressed: { fill: 'var(--map-land)', stroke: 'var(--map-stroke)', strokeWidth: 0.5, outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Route lines with non-scaling stroke */}
          {activeRoutes.map((route) => (
            <Line
              key={route.lane.id}
              from={route.originCoords}
              to={route.destCoords}
              stroke={route.stroke}
              strokeWidth={1.2}
              strokeOpacity={0.55}
              strokeLinecap="round"
              className="map-flow-line"
              style={{
                cursor: 'pointer',
                vectorEffect: 'non-scaling-stroke',
              }}
              onMouseEnter={(e) => {
                setHoveredLane(route)
                setTooltipPos({ x: e.clientX, y: e.clientY })
              }}
              onMouseMove={(e) => {
                setTooltipPos({ x: e.clientX, y: e.clientY })
              }}
              onMouseLeave={() => {
                setHoveredLane(null)
                setTooltipPos(null)
              }}
            />
          ))}

          {/* Endpoint markers with inverse scale to maintain constant size */}
          {endpointPorts.map(port => {
            const isHighRisk = highRiskCodes.has(port.code)
            const color = isHighRisk ? '#E53E3E' : '#10B981'
            return (
              <Marker key={port.code} coordinates={[port.lng, port.lat]}>
                <g transform={`scale(${markerScale})`}>
                  {/* Pulsing ring */}
                  <circle
                    r={3}
                    fill="none"
                    stroke={color}
                    strokeWidth={1}
                    opacity={0.6}
                  >
                    <animate attributeName="r" from="3" to="11" dur={isHighRisk ? '1.2s' : '2s'} repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur={isHighRisk ? '1.2s' : '2s'} repeatCount="indefinite" />
                  </circle>
                  {/* Dot */}
                  <circle r={2.2} fill={color} style={{ stroke: 'var(--background)', strokeWidth: 0.6 }} />
                  <text
                    textAnchor="middle"
                    y={-8}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: 'var(--text-body)', letterSpacing: '0.05em' }}
                  >
                    {port.code}
                  </text>
                </g>
              </Marker>
            )
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {hoveredLane && tooltipPos && (
        <div
          className="fixed pointer-events-none z-50 bg-background border border-[var(--border-hover)] p-3 min-w-[200px]"
          style={{
            left: tooltipPos.x + 12,
            top: tooltipPos.y + 12,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] text-foreground">
              {hoveredLane.lane.originCode} → {hoveredLane.lane.destinationCode}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">{hoveredLane.lane.id}</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Carrier</span>
              <span className="text-[var(--text-body)]">{hoveredLane.lane.carrier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Temp</span>
              <span className={hoveredLane.lane.tempDeviation ? 'text-[#E53E3E]' : 'text-[#10B981]'}>
                {hoveredLane.lane.currentTemp}°C
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk</span>
              <span className={hoveredLane.lane.riskScore > 60 ? 'text-[#E53E3E]' : 'text-[var(--text-body)]'}>
                {hoveredLane.lane.riskScore}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-[var(--text-body)]">{hoveredLane.lane.progress}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
