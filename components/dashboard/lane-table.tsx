'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLanes, type LaneRow } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plane, Ship, Truck, Layers, ChevronDown, Plus, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddLaneModal } from '@/components/dashboard/add-lane-modal'

type TransportMode = 'air' | 'sea' | 'road' | 'multimodal'

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

const statusSteps = ['departure', 'in_transit', 'customs', 'arrived']
const statusLabels: Record<string, string> = {
  departure: 'Departure',
  in_transit: 'In Transit',
  customs: 'Customs',
  arrived: 'Arrived',
}

function getProgressText(lane: LaneRow): string {
  const step = statusSteps.indexOf(lane.status) + 1
  return `${statusLabels[lane.status] || lane.status} · Step ${step}/${statusSteps.length}`
}

export function LaneTable() {
  const [filterMode, setFilterMode] = useState<TransportMode | 'all'>('all')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['lanes', filterMode, page],
    queryFn: () =>
      getLanes({
        mode: filterMode === 'all' ? undefined : filterMode,
        page,
        limit,
      }),
  })

  const lanes = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="bg-[#111111] border border-[#222222]">
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
              {(Object.keys(modeIcons) as TransportMode[]).map((mode) => (
                <DropdownMenuItem
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className="text-[13px]"
                >
                  <span className="mr-2">{modeIcons[mode]}</span> {modeLabels[mode]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-[12px] text-[#6B6B6B]">
            {data?.total ?? 0} lanes
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Mode', 'Route', 'Carrier', 'Progress', 'Temperature', 'GDP', 'Risk', 'Status'].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="h-[52px] border-b border-[#1A1A1A]">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4">
                        <div className="h-4 w-16 bg-[#1A1A1A] animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              : lanes.map((lane, index) => {
                  const isDeviation =
                    lane.temp_current !== null &&
                    (lane.temp_current < lane.temp_min || lane.temp_current > lane.temp_max)
                  return (
                    <tr
                      key={lane.id}
                      className={cn(
                        'h-[52px] transition-colors hover:bg-[#1A1A1A] cursor-pointer',
                        index !== lanes.length - 1 && 'border-b border-[#1A1A1A]',
                      )}
                    >
                      <td className="px-4">
                        <div className="flex items-center gap-2 text-[#6B6B6B]">
                          {modeIcons[lane.mode as TransportMode]}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[13px] text-[#F5F5F5]">
                            {lane.origin_port?.code}
                          </span>
                          <span className="text-[#3D3D3D]">→</span>
                          <span className="font-mono text-[13px] text-[#F5F5F5]">
                            {lane.dest_port?.code}
                          </span>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className="text-[13px] text-[#A0A0A0]">{lane.carrier?.name}</span>
                      </td>
                      <td className="px-4">
                        <span className="text-[13px] text-[#A0A0A0]">{getProgressText(lane)}</span>
                      </td>
                      <td className="px-4">
                        <span
                          className={cn(
                            'text-[13px]',
                            isDeviation ? 'text-[#E53E3E]' : 'text-[#A0A0A0]',
                          )}
                        >
                          {lane.temp_min}°C – {lane.temp_max}°C
                          {lane.temp_current !== null && ` · ${lane.temp_current}°C`}
                        </span>
                      </td>
                      <td className="px-4">
                        <span
                          className={cn(
                            'text-[13px]',
                            lane.gdp_compliant ? 'text-[#2D6A4F]' : 'text-[#E53E3E]',
                          )}
                        >
                          {lane.gdp_compliant ? '✓' : '✗'}
                        </span>
                      </td>
                      <td className="px-4">
                        <span
                          className={cn(
                            'text-[13px]',
                            lane.risk_score > 60 ? 'text-[#E53E3E]' : lane.risk_score > 40 ? 'text-[#C97B1A]' : 'text-[#A0A0A0]',
                          )}
                        >
                          {lane.risk_score}%
                        </span>
                      </td>
                      <td className="px-4">
                        <span
                          className={cn(
                            'inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm',
                            lane.status === 'departure' && 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
                            lane.status === 'in_transit' && 'bg-[rgba(44,82,130,0.1)] text-[#2C5282]',
                            lane.status === 'customs' && 'bg-[rgba(201,123,26,0.1)] text-[#C97B1A]',
                            lane.status === 'arrived' && 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
                          )}
                        >
                          {statusLabels[lane.status] || lane.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
            {!isLoading && lanes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[13px] text-[#6B6B6B]">
                  No lanes found. Create your first lane to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#1A1A1A]">
          <span className="text-[12px] text-[#6B6B6B]">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AddLaneModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  )
}
