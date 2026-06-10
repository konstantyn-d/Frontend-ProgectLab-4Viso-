'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mockPorts, mockTeam, generateTempHistory, getLaneWaypoints, getLaneEvents } from '@/lib/mock-data'
import { getDocumentsForLane } from '@/lib/services/documentsService'
import { cn } from '@/lib/utils'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLaneDetail, type LaneNode } from '@/lib/services/lanesService'
import { getShipmentsForLane } from '@/lib/services/shipmentsService'
import { getAlertsForLane } from '@/lib/services/alertsService'
import { LaneHealthPanel } from '@/components/dashboard/lane-health-panel'
import { RiskBreakdownCard } from '@/components/dashboard/risk-breakdown-card'
import { ActiveShipmentsCard } from '@/components/dashboard/active-shipments-card'
import { NodeDrawer } from '@/components/dashboard/node-drawer'
import { RouteEditModal } from '@/components/dashboard/route-edit-modal'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts'
import { LogisticsMap } from '@/components/map/LogisticsMap'
import { lanesToShipmentLanes } from '@/components/map/mockLanes'
import {
  ArrowLeft,
  ArrowUpRight,
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
} from 'lucide-react'

const modeIcons = {
  air: <Plane className="w-[19px] h-[19px]" strokeWidth={1.5} />,
  sea: <Ship className="w-[19px] h-[19px]" strokeWidth={1.5} />,
  road: <Truck className="w-[19px] h-[19px]" strokeWidth={1.5} />,
  multimodal: <Layers className="w-[19px] h-[19px]" strokeWidth={1.5} />,
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

function eventSeverityConfig(severity: 'info' | 'success' | 'warning' | 'critical') {
  return {
    info: { color: 'var(--info-c)', icon: <Clock className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    success: { color: 'var(--accent-deep)', icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    warning: { color: 'var(--warn)', icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> },
    critical: { color: 'var(--danger)', icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} /> },
  }[severity]
}

function PanelHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
      <div>
        <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
          {title}
        </h2>
        {sub && <p className="text-[12.5px] mt-[3px]" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  background: 'var(--card)',
  borderRadius: 'var(--r-lg)',
  boxShadow: 'var(--shadow-1)',
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 h-[32px] px-[13px] rounded-full text-[12.5px] font-medium transition-all duration-200 hover:-translate-y-px"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'var(--shadow-1)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-line)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-deep)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
    >
      {children}
    </button>
  )
}

export default function LaneDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [routeEditOpen, setRouteEditOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<LaneNode | null>(null)
  const { data: detail, loading } = useQuery(() => getLaneDetail(id), [id])
  const { data: laneAlerts } = useQuery(() => getAlertsForLane(id), [id])
  const { data: laneShipments } = useQuery(() => getShipmentsForLane(id), [id])
  const { data: laneDocuments } = useQuery(() => getDocumentsForLane(id), [id])
  const lane = detail?.lane ?? null

  const tempHistory = useMemo(() => lane ? generateTempHistory(lane) : [], [lane])
  const waypoints = useMemo(() => lane ? getLaneWaypoints(lane) : [], [lane])
  const events = useMemo(() => lane ? getLaneEvents(lane) : [], [lane])

  // Single shipment lane for the interactive map (only this lane is shown).
  const mapLanes = useMemo(() => (lane ? lanesToShipmentLanes([lane], mockPorts) : []), [lane])

  const openAlerts = (laneAlerts ?? []).filter(a => a.status === 'open' || a.status === 'assigned').length

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[14px]" style={{ color: 'var(--muted-foreground)' }}>Loading lane…</p>
      </div>
    )
  }

  if (!lane || !detail) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-[14px]" style={{ color: 'var(--muted-foreground)' }}>Lane not found</p>
        <GhostButton onClick={() => router.push('/dashboard/lanes')}>Back to lanes</GhostButton>
      </div>
    )
  }

  // Open a node drawer for the clicked route stop. Positional mapping to
  // the rich nodes when present, otherwise a node synthesized from the
  // derived waypoint (demo mode).
  const openStop = (idx: number) => {
    if (detail.nodes.length > 0) {
      setSelectedNode(detail.nodes[Math.min(idx, detail.nodes.length - 1)])
      return
    }
    const wp = waypoints[idx]
    if (!wp) return
    setSelectedNode({
      id: `demo-${idx}`, sequence: idx, code: wp.code, name: wp.name, locationName: wp.name,
      type: wp.type === 'origin' ? 'port' : wp.type === 'customs' ? 'customs' : wp.type === 'destination' ? 'final_delivery' : 'hub',
      modeFromPrevious: null, responsibleCompany: lane.carrier,
      temperatureControl: wp.type !== 'transit' && wp.type !== 'customs',
      tempMin: lane.tempMin, tempMax: lane.tempMax, securityLevel: 'medium',
      handlingCapabilities: ['pharma'], specialConditions: ['pharma'],
      validationStatus: lane.gdpCompliant ? 'validated' : 'claimed', riskScore: 0,
      latitude: null, longitude: null,
      certifications: lane.gdpCompliant ? [{ type: 'GDP', status: 'valid', verified: true }] : [{ type: 'GDP', status: 'expired', verified: false }],
    })
  }

  const attributes = [
    { k: 'Carrier', v: lane.carrier },
    { k: 'Mode', v: lane.mode.charAt(0).toUpperCase() + lane.mode.slice(1) },
    { k: 'Temp Range', v: `${lane.tempMin}–${lane.tempMax}°C` },
    { k: 'Current Temp', v: `${lane.currentTemp}°C`, bad: lane.tempDeviation },
    { k: 'Risk Score', v: `${detail.risk.score}%`, risk: detail.risk.score > 60 ? 'high' : detail.risk.score > 30 ? 'mid' : 'low' },
    { k: 'Last Updated', v: new Date(lane.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) },
  ]

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-[12.5px] mb-[22px] transition-colors"
        style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-deep)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted-foreground)')}
      >
        <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={1.5} />
        Back to lanes
      </button>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-6 mb-[26px]">
        <div>
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>{lane.id}</span>
            {lane.tempDeviation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] rounded-full font-medium danger-glow" style={{ color: '#fff', background: 'var(--danger)' }}>
                <AlertTriangle className="w-3 h-3" strokeWidth={1.5} /> Temp Deviation
              </span>
            )}
            {lane.gdpCompliant && !lane.tempDeviation && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] rounded-full border font-medium" style={{ color: 'var(--accent-deep)', background: 'var(--accent-wash)', borderColor: 'var(--accent-line)' }}>
                <CheckCircle2 className="w-3 h-3" strokeWidth={1.5} /> GDP Compliant
              </span>
            )}
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center" style={{ background: 'var(--accent-wash)', color: 'var(--accent-deep)' }}>
              {modeIcons[lane.mode]}
            </div>
            <h1 className="font-mono flex items-center gap-3" style={{ fontWeight: 600, fontSize: 30, letterSpacing: '-0.01em', color: 'var(--foreground)', margin: 0 }}>
              {lane.originCode}
              <ArrowUpRight className="w-[20px] h-[20px]" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
              {lane.destinationCode}
            </h1>
          </div>
          <p className="text-[13.5px] mt-2" style={{ color: 'var(--muted-foreground)' }}>
            {lane.origin} to {lane.destination} · {lane.carrier}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setRouteEditOpen(true)}
            className="inline-flex items-center gap-2 h-[32px] px-[13px] rounded-full text-[12.5px] font-medium transition-all duration-200 hover:-translate-y-px"
            style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}
          >
            <Pencil className="w-[14px] h-[14px]" strokeWidth={1.5} /> Edit Route
          </button>
          <GhostButton><Pause className="w-[14px] h-[14px]" strokeWidth={1.5} /> Pause</GhostButton>
          <GhostButton><Archive className="w-[14px] h-[14px]" strokeWidth={1.5} /> Archive</GhostButton>
        </div>
      </div>

      {/* Lane Health */}
      <div className="mb-[18px]">
        <LaneHealthPanel lane={lane} risk={detail.risk} openAlerts={openAlerts} shipmentCount={laneShipments?.length ?? 0} />
      </div>

      {/* Waypoints */}
      <section className="border border-border mb-[18px]" style={panelStyle}>
        <div className="flex items-start px-[24px] py-[26px]">
          {waypoints.map((wp, idx) => (
            <div key={wp.code + idx} className="flex items-start flex-1">
              <button onClick={() => openStop(idx)} title="View node details" className="flex flex-col gap-2.5 min-w-[76px] text-left cursor-pointer group">
                <div
                  className={cn('w-[36px] h-[36px] rounded-full flex items-center justify-center font-mono text-[12px] font-semibold shrink-0')}
                  style={
                    wp.completed
                      ? { background: 'var(--primary)', color: 'var(--on-accent)' }
                      : wp.current
                      ? { border: '2px solid var(--primary)', color: 'var(--accent-deep)', background: 'var(--accent-wash)' }
                      : { border: '1px solid var(--border)', color: 'var(--text-muted)', background: 'var(--card)' }
                  }
                >
                  {wp.completed ? <Check className="w-4 h-4" strokeWidth={2} /> : idx + 1}
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: wp.current ? 'var(--accent-deep)' : 'var(--muted-foreground)' }}>
                    {wp.type}
                  </p>
                  <p className="font-mono text-[13px] font-semibold mt-[3px] group-hover:text-[var(--accent-deep)] transition-colors" style={{ color: 'var(--foreground)' }}>{wp.code}</p>
                </div>
              </button>
              {idx < waypoints.length - 1 && (
                <div className="flex-1 h-[2px] rounded mx-2 mt-[17px]" style={{ background: wp.completed ? 'var(--primary)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Map + Temp */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-[18px]">
        {/* Route Map */}
        <section className="border border-border overflow-hidden" style={panelStyle}>
          <PanelHead
            title="Route Map"
            sub="Current position marked"
            right={
              <span className="font-mono text-[10px] uppercase tracking-[0.07em] px-2.5 py-1 rounded-full border" style={{ color: 'var(--muted-foreground)', background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                {lane.progress}% complete
              </span>
            }
          />
          <div className="h-[300px]">
            <LogisticsMap lanes={mapLanes} singleLane hideLegend height="100%" />
          </div>
        </section>

        {/* Temperature chart */}
        <section className="border border-border overflow-hidden" style={panelStyle}>
          <PanelHead
            title="Temperature"
            sub="48-hour history"
            right={
              <div className="flex items-baseline gap-1.5">
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: lane.tempDeviation ? 'var(--danger)' : 'var(--accent-deep)' }}>
                  {lane.currentTemp}°C
                </span>
                <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>/ {lane.tempMin}–{lane.tempMax}°C</span>
              </div>
            }
          />
          <div className="h-[230px] px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tempHistory}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--line-soft)" vertical={false} />
                <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} interval="preserveStartEnd" minTickGap={40} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: 'var(--muted-foreground)' }} />
                <ReferenceLine y={lane.tempMax} stroke="var(--danger)" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: `Max ${lane.tempMax}°`, fill: 'var(--danger)', fontSize: 9, position: 'right' }} />
                <ReferenceLine y={lane.tempMin} stroke="var(--info-c)" strokeDasharray="3 3" strokeOpacity={0.5} label={{ value: `Min ${lane.tempMin}°`, fill: 'var(--info-c)', fontSize: 9, position: 'right' }} />
                <Area type="monotone" dataKey="temp" stroke="var(--primary)" strokeWidth={1.5} fill="url(#tempGrad)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Risk breakdown + active shipments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[18px] mb-[18px] items-start">
        <RiskBreakdownCard risk={detail.risk} />
        <ActiveShipmentsCard laneCode={lane.id} />
      </div>

      {/* Lane Attributes */}
      <section className="border border-border overflow-hidden mb-[18px]" style={panelStyle}>
        <PanelHead title="Lane Attributes" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {attributes.map((c, i) => (
            <div
              key={c.k}
              className="px-[22px] py-[18px]"
              style={{
                borderRight: '1px solid var(--line-soft)',
                borderBottom: i < attributes.length - (attributes.length % 6 || 6) ? '1px solid var(--line-soft)' : undefined,
              }}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--muted-foreground)' }}>{c.k}</div>
              <div
                className="text-[14px]"
                style={{
                  color: c.bad ? 'var(--danger)' : c.risk ? (c.risk === 'high' ? 'var(--danger)' : c.risk === 'mid' ? 'var(--warn)' : 'var(--accent-deep)') : 'var(--foreground)',
                  fontWeight: 500,
                }}
              >
                {c.v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Events + Team + Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px]">
        {/* Events */}
        <section className="lg:col-span-2 border border-border overflow-hidden" style={panelStyle}>
          <PanelHead title="Event Timeline" />
          <div className="p-[22px] space-y-1">
            {events.map((event, idx) => {
              const cfg = eventSeverityConfig(event.severity)
              return (
                <div key={event.id} className="relative flex gap-3.5 py-2.5">
                  {idx !== events.length - 1 && (
                    <div className="absolute left-[13px] top-[38px] bottom-[-10px] w-px" style={{ background: 'var(--border)' }} />
                  )}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{ background: 'var(--card)', border: `1px solid ${cfg.color}`, color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{event.title}</p>
                      <span className="text-[10px] shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(event.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-body)' }}>{event.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Team + Documents */}
        <div className="space-y-[18px]">
          <section className="border border-border overflow-hidden" style={panelStyle}>
            <PanelHead title="Assigned Team" />
            <div className="p-[18px] space-y-3.5">
              {mockTeam.map(member => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0" style={{ background: 'var(--accent-wash)', color: 'var(--accent-deep)', fontFamily: 'var(--font-display)' }}>
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-[12.5px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{member.name}</p>
                    <p className="text-[10.5px]" style={{ color: 'var(--muted-foreground)' }}>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="border border-border overflow-hidden" style={panelStyle}>
            <PanelHead title="Documents" />
            <div>
              {(laneDocuments ?? []).length === 0 && (
                <div className="px-[18px] py-6 text-center text-[12px]" style={{ color: 'var(--muted-foreground)' }}>No documents attached.</div>
              )}
              {(laneDocuments ?? []).map((doc, idx) => (
                <button
                  key={doc.id}
                  onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                  className="w-full flex items-center gap-3 px-[18px] py-3 text-left transition-colors"
                  style={{ borderTop: idx > 0 ? '1px solid var(--line-soft)' : undefined }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-wash)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>
                    <FileText className="w-[15px] h-[15px]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] truncate" style={{ color: 'var(--foreground)' }}>{doc.name}</p>
                    <p className="text-[10.5px]" style={{ color: 'var(--muted-foreground)' }}>{doc.meta}</p>
                  </div>
                  <Download className="w-[15px] h-[15px] shrink-0" style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      <RouteEditModal
        lane={lane}
        open={routeEditOpen}
        onOpenChange={setRouteEditOpen}
        onSave={() => {}}
      />

      <NodeDrawer
        node={selectedNode}
        laneTempMin={lane.tempMin}
        laneTempMax={lane.tempMax}
        onOpenChange={(o) => { if (!o) setSelectedNode(null) }}
      />
    </div>
  )
}
