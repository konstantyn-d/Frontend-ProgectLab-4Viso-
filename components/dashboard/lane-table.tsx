'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockLanes as initialLanes, type Lane, type TransportMode } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Plane,
  Ship,
  Truck,
  Layers,
  ChevronDown,
  Plus,
  Filter,
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
  air: <Plane className="w-3.5 h-3.5" strokeWidth={1.5} />,
  sea: <Ship className="w-3.5 h-3.5" strokeWidth={1.5} />,
  road: <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />,
  multimodal: <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />,
}

const modeLabels: Record<TransportMode, string> = {
  air: 'Air',
  sea: 'Sea',
  road: 'Road',
  multimodal: 'Multimodal',
}

function StatusBadge({ status }: { status: Lane['status'] }) {
  const config = {
    active: {
      label: 'ACTIVE',
      className: 'border border-[#10B981] text-[#10B981] bg-transparent',
      dot: false,
    },
    'in-transit': {
      label: 'IN TRANSIT',
      className: 'border border-[#3B82F6] text-[#3B82F6] bg-transparent',
      dot: true,
    },
    customs: {
      label: 'CUSTOMS',
      className: 'border border-[#8B5CF6] text-[#8B5CF6] bg-transparent',
      dot: false,
    },
    arrived: {
      label: 'ARRIVED',
      className: 'bg-[#10B981] text-[#0A0A0A]',
      dot: false,
    },
    delayed: {
      label: 'DELAYED',
      className: 'bg-[#E53E3E] text-white danger-glow',
      dot: false,
    },
  }[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm font-medium',
        config.className
      )}
    >
      {config.dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-70 live-pulse-dot" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#3B82F6]" />
        </span>
      )}
      {config.label}
    </span>
  )
}

function GdpBadge({ compliant }: { compliant: boolean }) {
  if (compliant) {
    return (
      <span className="inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm border border-[#10B981] text-[#10B981] font-medium">
        COMPLIANT
      </span>
    )
  }
  return (
    <span className="inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm bg-[#C97B1A] text-[#0A0A0A] font-medium">
      WARNING
    </span>
  )
}

export function LaneTable() {
  const router = useRouter()
  const [lanes, setLanes] = useState<Lane[]>(initialLanes)
  const [filterMode, setFilterMode] = useState<TransportMode | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLane, setEditingLane] = useState<Lane | null>(null)

  const filteredLanes = filterMode === 'all' ? lanes : lanes.filter(l => l.mode === filterMode)

  const handleAddLane = () => {
    setEditingLane(null)
    setIsModalOpen(true)
  }
  const handleEditLane = (lane: Lane) => {
    setEditingLane(lane)
    setIsModalOpen(true)
  }
  const handleDuplicateLane = (lane: Lane) => {
    const newLane: Lane = {
      ...lane,
      id: `LN-${String(lanes.length + 1).padStart(3, '0')}`,
      status: 'active',
      progress: 0,
      milestone: 'departure',
      lastUpdated: new Date().toISOString(),
    }
    setLanes([...lanes, newLane])
  }
  const handleDeleteLane = (laneId: string) => {
    setLanes(lanes.filter(l => l.id !== laneId))
  }
  const handleViewDetails = (lane: Lane) => {
    router.push(`/dashboard/lanes/${lane.id}`)
  }
  const handleSaveLane = (laneData: Partial<Lane> & { mode: TransportMode }) => {
    if (editingLane) {
      setLanes(lanes.map(l =>
        l.id === editingLane.id
          ? { ...l, ...laneData, lastUpdated: new Date().toISOString() }
          : l
      ))
    } else {
      const newLane: Lane = {
        id: `LN-${String(lanes.length + 1).padStart(3, '0')}`,
        origin: laneData.origin || '',
        originCode: laneData.originCode || '',
        destination: laneData.destination || '',
        destinationCode: laneData.destinationCode || '',
        carrier: laneData.carrier || '',
        mode: laneData.mode,
        status: 'active',
        currentTemp: Math.round((Number(laneData.tempMin) + Number(laneData.tempMax)) / 2),
        tempMin: laneData.tempMin || 2,
        tempMax: laneData.tempMax || 8,
        tempDeviation: false,
        gdpCompliant: true,
        riskScore: Math.floor(Math.random() * 30) + 5,
        progress: 0,
        milestone: 'departure',
        lastUpdated: new Date().toISOString(),
      }
      setLanes([...lanes, newLane])
    }
  }

  return (
    <div className="bg-[#111111] border border-[#222222]">
      {/* Table Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
              >
                <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
                {filterMode === 'all' ? 'All Modes' : modeLabels[filterMode]}
                <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0A0A0A] border-[#222222]">
              <DropdownMenuItem onClick={() => setFilterMode('all')} className="text-[13px]">All Modes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('air')} className="text-[13px]"><Plane className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Air</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('sea')} className="text-[13px]"><Ship className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Sea</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('road')} className="text-[13px]"><Truck className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Road</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('multimodal')} className="text-[13px]"><Layers className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Multimodal</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-[12px] text-[#6B6B6B]">{filteredLanes.length} lanes</span>
        </div>
        <Button
          size="sm"
          className="gap-2 h-8 text-[12px] bg-[#10B981] text-white hover:bg-[#059669]"
          onClick={handleAddLane}
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
          Add Lane
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Mode</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Route</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Carrier</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Progress</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Temperature</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">GDP</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Risk</th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Status</th>
              <th className="text-right text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLanes.map((lane, index) => (
              <tr
                key={lane.id}
                onClick={() => handleViewDetails(lane)}
                className={cn(
                  'h-[52px] hover:bg-[rgba(16,185,129,0.04)] group cursor-pointer',
                  index !== filteredLanes.length - 1 && 'border-b border-[#1A1A1A]'
                )}
              >
                <td className="px-4"><div className="text-[#6B6B6B] group-hover:text-[#10B981]">{modeIcons[lane.mode]}</div></td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[14px] text-[#F5F5F5] font-semibold">{lane.originCode}</span>
                    <span className="text-[#3D3D3D]">→</span>
                    <span className="font-mono text-[14px] text-[#F5F5F5] font-semibold">{lane.destinationCode}</span>
                  </div>
                </td>
                <td className="px-4"><span className="text-[12px] text-[#A0A0A0]">{lane.carrier}</span></td>
                <td className="px-4 min-w-[140px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#6B6B6B] capitalize">{lane.milestone.replace('-', ' ')}</span>
                      <span className="text-[#6B6B6B]">{lane.progress}%</span>
                    </div>
                    <div className="h-0.5 bg-[#222222] overflow-hidden">
                      <div
                        className={cn(
                          'h-full',
                          lane.tempDeviation || lane.status === 'delayed' ? 'bg-[#E53E3E]' : 'bg-[#10B981]'
                        )}
                        style={{ width: `${lane.progress}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4">
                  <span className={cn('text-[12px]', lane.tempDeviation ? 'text-[#E53E3E]' : 'text-[#A0A0A0]')}>
                    <span className="text-[#F5F5F5]">{lane.currentTemp}°C</span>
                    <span className="text-[#3D3D3D]"> / {lane.tempMin}–{lane.tempMax}°C</span>
                  </span>
                </td>
                <td className="px-4"><GdpBadge compliant={lane.gdpCompliant} /></td>
                <td className="px-4">
                  <span className={cn('text-[12px] font-mono', lane.riskScore > 60 ? 'text-[#E53E3E]' : lane.riskScore > 30 ? 'text-[#C97B1A]' : 'text-[#10B981]')}>
                    {lane.riskScore}%
                  </span>
                </td>
                <td className="px-4"><StatusBadge status={lane.status} /></td>
                <td className="px-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#222222]"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
                          <span className="sr-only">More actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#0A0A0A] border-[#222222]">
                        <DropdownMenuItem onClick={() => handleViewDetails(lane)} className="text-[13px] gap-2">
                          <Eye className="w-3.5 h-3.5" strokeWidth={1.5} /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditLane(lane)} className="text-[13px] gap-2">
                          <Pencil className="w-3.5 h-3.5" strokeWidth={1.5} /> Edit Route
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateLane(lane)} className="text-[13px] gap-2">
                          <Copy className="w-3.5 h-3.5" strokeWidth={1.5} /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] gap-2">
                          <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Export
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[13px] gap-2">
                          <Archive className="w-3.5 h-3.5" strokeWidth={1.5} /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#222222]" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteLane(lane.id)}
                          className="text-[13px] gap-2 text-[#E53E3E] focus:text-[#E53E3E] focus:bg-[rgba(229,62,62,0.1)]"
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
