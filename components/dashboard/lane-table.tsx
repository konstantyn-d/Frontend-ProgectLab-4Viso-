'use client'

import { useState } from 'react'
import { mockLanes, type Lane, type TransportMode } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  Plane, 
  Ship, 
  Truck, 
  Layers, 
  ChevronDown,
  Plus,
  Filter
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddLaneModal } from '@/components/dashboard/add-lane-modal'

const modeIcons: Record<TransportMode, React.ReactNode> = {
  air: <Plane className="w-3.5 h-3.5" />,
  sea: <Ship className="w-3.5 h-3.5" />,
  road: <Truck className="w-3.5 h-3.5" />,
  multimodal: <Layers className="w-3.5 h-3.5" />,
}

const modeLabels: Record<TransportMode, string> = {
  air: 'Air',
  sea: 'Sea',
  road: 'Road',
  multimodal: 'Multimodal',
}

function getMilestoneText(milestone: Lane['milestone'], status: Lane['status']): string {
  const stages = ['departure', 'in-transit', 'customs', 'arrived'] as const
  const currentIndex = stages.indexOf(milestone) + 1
  const total = stages.length
  
  const labels: Record<typeof milestone, string> = {
    'departure': 'Departure',
    'in-transit': 'In Transit',
    'customs': 'Customs',
    'arrived': 'Arrived'
  }
  
  return `${labels[milestone]} · Step ${currentIndex}/${total}`
}

export function LaneTable() {
  const [filterMode, setFilterMode] = useState<TransportMode | 'all'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredLanes = filterMode === 'all' 
    ? mockLanes 
    : mockLanes.filter(lane => lane.mode === filterMode)

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
                <Filter className="w-3.5 h-3.5" />
                {filterMode === 'all' ? 'All Modes' : modeLabels[filterMode]}
                <ChevronDown className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#111111] border-[#222222]">
              <DropdownMenuItem onClick={() => setFilterMode('all')} className="text-[13px]">
                All Modes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('air')} className="text-[13px]">
                <Plane className="w-3.5 h-3.5 mr-2" /> Air
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('sea')} className="text-[13px]">
                <Ship className="w-3.5 h-3.5 mr-2" /> Sea
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('road')} className="text-[13px]">
                <Truck className="w-3.5 h-3.5 mr-2" /> Road
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterMode('multimodal')} className="text-[13px]">
                <Layers className="w-3.5 h-3.5 mr-2" /> Multimodal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-[12px] text-[#6B6B6B]">
            {filteredLanes.length} lanes
          </span>
        </div>
        <Button 
          size="sm" 
          className="gap-2 h-8 text-[12px] bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-3.5 h-3.5" />
          Add Lane
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Mode
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Route
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Carrier
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Progress
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Temperature
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                GDP
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Risk
              </th>
              <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLanes.map((lane, index) => (
              <tr 
                key={lane.id} 
                className={cn(
                  'h-[52px] transition-colors hover:bg-[#1A1A1A] cursor-pointer',
                  index !== filteredLanes.length - 1 && 'border-b border-[#1A1A1A]'
                )}
              >
                <td className="px-4">
                  <div className="flex items-center gap-2 text-[#6B6B6B]">
                    {modeIcons[lane.mode]}
                  </div>
                </td>
                <td className="px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] text-[#F5F5F5]">{lane.originCode}</span>
                    <span className="text-[#3D3D3D]">-&gt;</span>
                    <span className="font-mono text-[13px] text-[#F5F5F5]">{lane.destinationCode}</span>
                  </div>
                </td>
                <td className="px-4">
                  <span className="text-[13px] text-[#A0A0A0]">{lane.carrier}</span>
                </td>
                <td className="px-4">
                  <span className="text-[13px] text-[#A0A0A0]">
                    {getMilestoneText(lane.milestone, lane.status)}
                  </span>
                </td>
                <td className="px-4">
                  <span className={cn(
                    'text-[13px]',
                    lane.tempDeviation ? 'text-[#E53E3E]' : 'text-[#A0A0A0]'
                  )}>
                    {lane.tempMin}°C – {lane.tempMax}°C · {lane.currentTemp}°C actual
                  </span>
                </td>
                <td className="px-4">
                  <span className={cn(
                    'text-[13px]',
                    lane.gdpCompliant ? 'text-[#A0A0A0]' : 'text-[#E53E3E]'
                  )}>
                    {lane.gdpCompliant ? '✓' : '✗'}
                  </span>
                </td>
                <td className="px-4">
                  <span className={cn(
                    'text-[13px]',
                    lane.riskScore > 60 ? 'text-[#E53E3E]' : 'text-[#A0A0A0]'
                  )}>
                    {lane.riskScore}%
                  </span>
                </td>
                <td className="px-4">
                  <span className={cn(
                    'inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm',
                    lane.status === 'active' && 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
                    lane.status === 'in-transit' && 'bg-[rgba(44,82,130,0.1)] text-[#2C5282]',
                    lane.status === 'customs' && 'bg-[rgba(201,123,26,0.1)] text-[#C97B1A]',
                    lane.status === 'arrived' && 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
                    lane.status === 'delayed' && 'bg-[rgba(229,62,62,0.1)] text-[#E53E3E]'
                  )}>
                    {lane.status === 'in-transit' ? 'In Transit' : lane.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Lane Modal */}
      <AddLaneModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
