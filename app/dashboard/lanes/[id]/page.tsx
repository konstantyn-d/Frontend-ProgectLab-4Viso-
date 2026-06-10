'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mockLanes, mockPorts, mockTeam, mockDocuments, generateTempHistory, getLaneWaypoints, getLaneEvents } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { RouteEditModal } from '@/components/dashboard/route-edit-modal'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import { ComposableMap, Geographies, Geography, Line as MapLine, Marker } from 'react-simple-maps'
import {
  ArrowLeft,
  Pencil,
  Pause,
  Archive,
  Check,
  FileText,
  Download,
  Plane,
  Ship,
  Truck,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react'

const modeIcons = {
  air: <Plane className="w-4 h-4" strokeWidth={1.5} />,
  sea: <Ship className="w-4 h-4" strokeWidth={1.5} />,
  road: <Truck className="w-4 h-4" strokeWidth={1.5} />,
  multimodal: <Layers className="w-4 h-4" strokeWidth={1.5} />,
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function eventSeverityConfig(severity: 'info' | 'success' | 'warning' | 'critical') {
  return {
    info: { color: '#3B82F6', icon: <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    success: { color: '#10B981', icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    warning: { color: '#C97B1A', icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    critical: { color: '#E53E3E', icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  }[severity]
}

export default function LaneDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [routeEditOpen, setRouteEditOpen] = useState(false)
  const lane = mockLanes.find(l => l.id === id)

  const tempHistory = useMemo(() => lane ? generateTempHistory(lane) : [], [lane])
  const waypoints = useMemo(() => lane ? getLaneWaypoints(lane) : [], [lane])
  const events = useMemo(() => lane ? getLaneEvents(lane) : [], [lane])

  const originPort = lane ? mockPorts.find(p => p.code === lane.originCode) : null
  const destPort = lane ? mockPorts.find(p => p.code === lane.destinationCode) : null

  // Current position along the route
  const currentPosition = useMemo(() => {
    if (!originPort || !destPort || !lane) return null
    const t = lane.progress / 100
    return {
      lng: originPort.lng + (destPort.lng - originPort.lng) * t,
      lat: originPort.lat + (destPort.lat - originPort.lat) * t,
    }
  }, [originPort, destPort, lane])

  if (!lane) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[14px] text-[#6B6B6B]">Lane not found</p>
        <Button
          variant="outline"
          className="mt-4 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
          onClick={() => router.push('/dashboard/lanes')}
        >
          Back to lanes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[12px] text-[#6B6B6B] hover:text-[#F5F5F5]"
      >
        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] font-mono">{lane.id}</span>
            {lane.tempDeviation && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm bg-[#E53E3E] text-white danger-glow font-medium">
                <AlertTriangle className="w-3 h-3" strokeWidth={1.5} />
                Temp Deviation
              </span>
            )}
            {lane.gdpCompliant && !lane.tempDeviation && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm border border-[#10B981] text-[#10B981] font-medium">
                <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} />
                GDP Compliant
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[#6B6B6B]">{modeIcons[lane.mode]}</div>
            <h1 className="font-mono text-[24px] text-[#F5F5F5] font-medium">
              {lane.originCode} <span className="text-[#3D3D3D]">→</span> {lane.destinationCode}
            </h1>
          </div>
          <p className="text-[13px] text-[#6B6B6B] mt-1">
            {lane.origin} to {lane.destination} · {lane.carrier}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setRouteEditOpen(true)}
            className="h-8 text-[12px] bg-[#10B981] text-white hover:bg-[#059669]"
          >
            <Pencil className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
            Edit Route
          </Button>
          <Button variant="outline" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
            <Pause className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
            Pause
          </Button>
          <Button variant="outline" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
            <Archive className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
            Archive
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="bg-[#111111] border border-[#222222] p-5">
        <div className="flex items-center gap-2">
          {waypoints.map((wp, idx) => (
            <div key={wp.code + idx} className="flex items-center flex-1">
              <div className="flex flex-col items-start gap-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0',
                    wp.completed
                      ? 'bg-[#10B981] text-[#0A0A0A]'
                      : wp.current
                      ? 'border-2 border-[#10B981] text-[#10B981] bg-[rgba(16,185,129,0.1)]'
                      : 'border border-[#2E2E2E] text-[#6B6B6B] bg-transparent'
                  )}
                >
                  {wp.completed ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : idx + 1}
                </div>
                <div>
                  <p className={cn('text-[11px] uppercase tracking-[0.06em]', wp.current ? 'text-[#10B981]' : 'text-[#6B6B6B]')}>
                    {wp.type}
                  </p>
                  <p className="font-mono text-[12px] text-[#F5F5F5] mt-0.5">{wp.code}</p>
                </div>
              </div>
              {idx < waypoints.length - 1 && (
                <div className={cn('flex-1 h-px mx-2 mb-8', wp.completed ? 'bg-[#10B981]' : 'bg-[#222222]')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map + temp chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Route Map</h2>
            <p className="text-[12px] text-[#3D3D3D] mt-1">Current position marked</p>
          </div>
          <div className="h-[280px]">
            <ComposableMap projectionConfig={{ scale: 120, center: [originPort && destPort ? (originPort.lng + destPort.lng) / 2 : 0, 30] }} width={500} height={280} style={{ width: '100%', height: '100%' }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography key={geo.rsmKey} geography={geo} style={{
                      default: { fill: '#141414', stroke: '#1F1F1F', strokeWidth: 0.4, outline: 'none' },
                      hover: { fill: '#141414', outline: 'none' },
                      pressed: { fill: '#141414', outline: 'none' },
                    }} />
                  ))
                }
              </Geographies>
              {originPort && destPort && (
                <>
                  <MapLine
                    from={[originPort.lng, originPort.lat]}
                    to={[destPort.lng, destPort.lat]}
                    stroke={lane.tempDeviation ? '#E53E3E' : '#10B981'}
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                    strokeLinecap="round"
                  />
                  <Marker coordinates={[originPort.lng, originPort.lat]}>
                    <circle r={3} fill="#10B981" stroke="#0A0A0A" strokeWidth={0.8} />
                    <text textAnchor="middle" y={-8} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: '#A0A0A0' }}>{originPort.code}</text>
                  </Marker>
                  <Marker coordinates={[destPort.lng, destPort.lat]}>
                    <circle r={3} fill="#10B981" stroke="#0A0A0A" strokeWidth={0.8} />
                    <text textAnchor="middle" y={-8} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fill: '#A0A0A0' }}>{destPort.code}</text>
                  </Marker>
                  {currentPosition && lane.status !== 'arrived' && (
                    <Marker coordinates={[currentPosition.lng, currentPosition.lat]}>
                      <circle r={3} fill="none" stroke={lane.tempDeviation ? '#E53E3E' : '#10B981'} strokeWidth={1}>
                        <animate attributeName="r" from="3" to="12" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                      <circle r={3} fill={lane.tempDeviation ? '#E53E3E' : '#10B981'} stroke="#0A0A0A" strokeWidth={0.8} />
                    </Marker>
                  )}
                </>
              )}
            </ComposableMap>
          </div>
        </div>

        {/* Temperature chart */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center justify-between">
            <div>
              <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Temperature</h2>
              <p className="text-[12px] text-[#3D3D3D] mt-1">48-hour history</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={cn('text-[20px] font-light', lane.tempDeviation ? 'text-[#E53E3E]' : 'text-[#10B981]')}>
                {lane.currentTemp}°C
              </span>
              <span className="text-[11px] text-[#6B6B6B]">/ {lane.tempMin}–{lane.tempMax}°C</span>
            </div>
          </div>
          <div className="h-[230px] px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tempHistory}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" vertical={false} />
                <XAxis dataKey="time" stroke="#3D3D3D" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={{ stroke: '#222222' }} tickLine={false} interval="preserveStartEnd" minTickGap={40} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#3D3D3D" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0A0A0A', border: '1px solid #222222', fontSize: 12 }} labelStyle={{ color: '#6B6B6B' }} />
                <ReferenceLine y={lane.tempMax} stroke="#E53E3E" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: `Max ${lane.tempMax}°`, fill: '#E53E3E', fontSize: 9, position: 'right' }} />
                <ReferenceLine y={lane.tempMin} stroke="#3B82F6" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: `Min ${lane.tempMin}°`, fill: '#3B82F6', fontSize: 9, position: 'right' }} />
                <Area type="monotone" dataKey="temp" stroke="#10B981" strokeWidth={1.5} fill="url(#tempGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Events + Team + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Events */}
        <div className="lg:col-span-2 bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Event Timeline</h2>
          </div>
          <div className="p-4 space-y-4">
            {events.map((event, idx) => {
              const cfg = eventSeverityConfig(event.severity)
              return (
                <div key={event.id} className="relative flex gap-3">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-px bg-[#222222]" />
                  )}
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{ background: '#0A0A0A', border: `1px solid ${cfg.color}`, color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] text-[#F5F5F5]">{event.title}</p>
                      <span className="text-[10px] text-[#6B6B6B] shrink-0">
                        {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#A0A0A0] mt-0.5">{event.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Team + Documents */}
        <div className="space-y-4">
          <div className="bg-[#111111] border border-[#222222]">
            <div className="px-4 py-3 border-b border-[#1A1A1A]">
              <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Assigned Team</h2>
            </div>
            <div className="p-4 space-y-3">
              {mockTeam.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center text-[11px] text-[#10B981] font-medium shrink-0">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-[12px] text-[#F5F5F5]">{member.name}</p>
                    <p className="text-[10px] text-[#6B6B6B]">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-[#222222]">
            <div className="px-4 py-3 border-b border-[#1A1A1A]">
              <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Documents</h2>
            </div>
            <div className="divide-y divide-[#1A1A1A]">
              {mockDocuments.map(doc => (
                <button
                  key={doc.id}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[rgba(16,185,129,0.03)] text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#F5F5F5] truncate">{doc.name}</p>
                    <p className="text-[10px] text-[#6B6B6B]">{doc.size}</p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RouteEditModal
        lane={lane}
        open={routeEditOpen}
        onOpenChange={setRouteEditOpen}
        onSave={() => {}}
      />
    </div>
  )
}
