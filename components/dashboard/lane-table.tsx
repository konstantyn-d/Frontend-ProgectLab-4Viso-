'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockLanes as initialLanes, type Lane, type TransportMode } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  Plane,
  Ship,
  Truck,
  Layers,
  ArrowUpRight,
  Plus,
  Eye,
  MoreHorizontal,
  Trash2,
  Copy,
  Download,
  Pencil,
  Archive,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LaneModal } from '@/components/dashboard/lane-modal'

const modeIcons: Record<TransportMode, React.ReactNode> = {
  air: <Plane className="w-[16px] h-[16px]" strokeWidth={1.5} />,
  sea: <Ship className="w-[16px] h-[16px]" strokeWidth={1.5} />,
  road: <Truck className="w-[16px] h-[16px]" strokeWidth={1.5} />,
  multimodal: <Layers className="w-[16px] h-[16px]" strokeWidth={1.5} />,
}

const modeLabels: Record<TransportMode, string> = {
  air: 'Air',
  sea: 'Sea',
  road: 'Road',
  multimodal: 'Multi',
}

function StatusBadge({ status }: { status: Lane['status'] }) {
  const map = {
    active: { label: 'Active', style: { color: 'var(--accent-deep)', background: 'var(--accent-wash)', borderColor: 'var(--accent-line)' } },
    'in-transit': { label: 'In Transit', style: { color: 'var(--info-c)', background: 'var(--info-bg)', borderColor: 'rgba(106,160,245,0.3)' }, dot: true },
    customs: { label: 'Customs', style: { color: '#8B5CF6', background: 'rgba(139,92,246,0.12)', borderColor: 'rgba(139,92,246,0.3)' } },
    arrived: { label: 'Arrived', style: { color: 'var(--on-accent)', background: 'var(--primary)', borderColor: 'transparent' } },
    delayed: { label: 'Delayed', style: { color: '#fff', background: 'var(--danger)', borderColor: 'transparent' }, glow: true },
  }[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] rounded-full border font-medium',
        map.glow && 'danger-glow'
      )}
      style={map.style}
    >
      {map.dot && (
        <span className="relative flex h-[7px] w-[7px]">
          <span className="absolute inset-0 rounded-full bg-current opacity-60 live-pulse-dot" />
          <span className="relative rounded-full h-[7px] w-[7px] bg-current" />
        </span>
      )}
      {map.label}
    </span>
  )
}

function GdpBadge({ compliant }: { compliant: boolean }) {
  return compliant ? (
    <span
      className="inline-flex px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] rounded-full border font-medium"
      style={{ color: 'var(--accent-deep)', background: 'var(--accent-wash)', borderColor: 'var(--accent-line)' }}
    >
      Compliant
    </span>
  ) : (
    <span
      className="inline-flex px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.06em] rounded-full border font-medium"
      style={{ color: '#fff', background: 'var(--warn)', borderColor: 'transparent' }}
    >
      Warning
    </span>
  )
}

const modeFilters: { k: TransportMode | 'all'; label: string; icon?: React.ReactNode }[] = [
  { k: 'all', label: 'All Modes' },
  { k: 'air', label: 'Air', icon: <Plane className="w-[14px] h-[14px]" strokeWidth={1.5} /> },
  { k: 'sea', label: 'Sea', icon: <Ship className="w-[14px] h-[14px]" strokeWidth={1.5} /> },
  { k: 'road', label: 'Road', icon: <Truck className="w-[14px] h-[14px]" strokeWidth={1.5} /> },
  { k: 'multimodal', label: 'Multi', icon: <Layers className="w-[14px] h-[14px]" strokeWidth={1.5} /> },
]

export function LaneTable() {
  const router = useRouter()
  const [lanes, setLanes] = useState<Lane[]>(initialLanes)
  const [filterMode, setFilterMode] = useState<TransportMode | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLane, setEditingLane] = useState<Lane | null>(null)

  const filteredLanes = filterMode === 'all' ? lanes : lanes.filter(l => l.mode === filterMode)

  const handleAddLane = () => { setEditingLane(null); setIsModalOpen(true) }
  const handleEditLane = (lane: Lane) => { setEditingLane(lane); setIsModalOpen(true) }
  const handleDuplicateLane = (lane: Lane) => {
    setLanes([...lanes, { ...lane, id: `LN-${String(lanes.length + 1).padStart(3, '0')}`, status: 'active', progress: 0, milestone: 'departure', lastUpdated: new Date().toISOString() }])
  }
  const handleDeleteLane = (laneId: string) => setLanes(lanes.filter(l => l.id !== laneId))
  const handleViewDetails = (lane: Lane) => router.push(`/dashboard/lanes/${lane.id}`)
  const handleSaveLane = (laneData: Partial<Lane> & { mode: TransportMode }) => {
    if (editingLane) {
      setLanes(lanes.map(l => l.id === editingLane.id ? { ...l, ...laneData, lastUpdated: new Date().toISOString() } : l))
    } else {
      setLanes([...lanes, {
        id: `LN-${String(lanes.length + 1).padStart(3, '0')}`,
        origin: laneData.origin || '', originCode: laneData.originCode || '',
        destination: laneData.destination || '', destinationCode: laneData.destinationCode || '',
        carrier: laneData.carrier || '', mode: laneData.mode, status: 'active',
        currentTemp: Math.round((Number(laneData.tempMin) + Number(laneData.tempMax)) / 2),
        tempMin: laneData.tempMin || 2, tempMax: laneData.tempMax || 8,
        tempDeviation: false, gdpCompliant: true,
        riskScore: Math.floor(Math.random() * 30) + 5,
        progress: 0, milestone: 'departure', lastUpdated: new Date().toISOString(),
      }])
    }
  }

  return (
    <div
      className="border border-border overflow-hidden"
      style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-[22px] py-[16px] flex-wrap" style={{ borderBottom: '1px solid var(--line-soft)' }}>
        <div className="flex items-center gap-2 flex-wrap">
          {modeFilters.map(f => (
            <button
              key={f.k}
              onClick={() => setFilterMode(f.k)}
              className={cn(
                'inline-flex items-center gap-[7px] h-[32px] px-[14px] rounded-full text-[12.5px] font-medium border transition-all duration-200',
                filterMode === f.k
                  ? 'bg-[var(--primary)] text-[var(--on-accent)] border-transparent'
                  : 'text-muted-foreground bg-secondary border-border hover:text-foreground hover:border-[var(--accent-line)]'
              )}
              style={filterMode === f.k ? { boxShadow: '0 8px 18px -8px rgba(16,185,129,0.55)' } : {}}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
          <span className="text-[12.5px] ml-1" style={{ color: 'var(--muted-foreground)' }}>
            {filteredLanes.length} lanes
          </span>
        </div>
        <button
          onClick={handleAddLane}
          className="inline-flex items-center gap-[9px] h-[32px] px-[13px] rounded-full text-[12.5px] font-medium transition-all duration-200 hover:-translate-y-px"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}
        >
          <Plus className="w-[14px] h-[14px]" strokeWidth={2} />
          Add Lane
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px]" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
              {['Mode', 'Route', 'Carrier', 'Progress', 'Temperature', 'GDP', 'Risk', 'Status', ''].map(h => (
                <th key={h} className="text-left px-[18px] py-[14px] font-mono text-[10px] uppercase tracking-[0.09em] font-medium" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredLanes.map((lane, index) => (
              <tr
                key={lane.id}
                onClick={() => handleViewDetails(lane)}
                className="cursor-pointer group transition-colors"
                style={{
                  borderBottom: index !== filteredLanes.length - 1 ? '1px solid var(--line-soft)' : undefined,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-wash)')}
                onMouseLeave={e => (e.currentTarget.style.background = '')}
              >
                {/* Mode icon */}
                <td className="px-[18px] py-[15px]">
                  <div
                    className="w-[34px] h-[34px] rounded-[9px] flex items-center justify-center transition-colors"
                    style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
                  >
                    {modeIcons[lane.mode]}
                  </div>
                </td>

                {/* Route codes */}
                <td className="px-[18px] py-[15px]">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[14px] font-semibold text-foreground">{lane.originCode}</span>
                    <ArrowUpRight className="w-[13px] h-[13px]" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                    <span className="font-mono text-[14px] font-semibold text-foreground">{lane.destinationCode}</span>
                  </div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {lane.origin} → {lane.destination}
                  </div>
                </td>

                {/* Carrier */}
                <td className="px-[18px] py-[15px]">
                  <span className="text-[13px]" style={{ color: 'var(--text-body)' }}>{lane.carrier}</span>
                </td>

                {/* Progress */}
                <td className="px-[18px] py-[15px] min-w-[130px]">
                  <div className="flex justify-between text-[11px] mb-[6px]" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="capitalize">{lane.milestone.replace('-', ' ')}</span>
                    <span>{lane.progress}%</span>
                  </div>
                  <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${lane.progress}%`,
                        background: lane.tempDeviation || lane.status === 'delayed' ? 'var(--danger)' : 'var(--primary)',
                      }}
                    />
                  </div>
                </td>

                {/* Temperature */}
                <td className="px-[18px] py-[15px]">
                  <span className="text-[13px]">
                    <span className="font-semibold" style={{ color: lane.tempDeviation ? 'var(--danger)' : 'var(--foreground)' }}>
                      {lane.currentTemp}°C
                    </span>
                    <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}> / {lane.tempMin}–{lane.tempMax}°</span>
                  </span>
                </td>

                <td className="px-[18px] py-[15px]"><GdpBadge compliant={lane.gdpCompliant} /></td>

                {/* Risk */}
                <td className="px-[18px] py-[15px]">
                  <span
                    className="font-mono text-[13px] font-semibold"
                    style={{ color: lane.riskScore > 60 ? 'var(--danger)' : lane.riskScore > 30 ? 'var(--warn)' : 'var(--accent-deep)' }}
                  >
                    {lane.riskScore}%
                  </span>
                </td>

                <td className="px-[18px] py-[15px]"><StatusBadge status={lane.status} /></td>

                {/* Actions */}
                <td className="px-[18px] py-[15px]" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {/* Go arrow */}
                    <div
                      className="w-[30px] h-[30px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                      style={{ background: 'var(--primary)', color: 'var(--on-accent)' }}
                      onClick={() => handleViewDetails(lane)}
                    >
                      <ArrowUpRight className="w-[14px] h-[14px]" strokeWidth={1.5} />
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="w-[30px] h-[30px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          <MoreHorizontal className="w-[14px] h-[14px]" strokeWidth={1.5} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border" style={{ borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-2)' }}>
                        <DropdownMenuItem onClick={() => handleViewDetails(lane)} className="text-[13px] gap-2"><Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditLane(lane)} className="text-[13px] gap-2"><Pencil className="w-3.5 h-3.5" strokeWidth={1.5} /> Edit Route</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateLane(lane)} className="text-[13px] gap-2"><Copy className="w-3.5 h-3.5" strokeWidth={1.5} /> Duplicate</DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] gap-2"><Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Export</DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] gap-2"><Archive className="w-3.5 h-3.5" strokeWidth={1.5} /> Archive</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteLane(lane.id)}
                          className="text-[13px] gap-2"
                          style={{ color: 'var(--danger)' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Delete Lane
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <LaneModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        lane={editingLane}
        onSave={handleSaveLane}
      />
    </div>
  )
}
