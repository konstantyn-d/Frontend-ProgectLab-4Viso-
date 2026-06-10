'use client'

import { useState, useMemo } from 'react'
import { mockShipments, shipmentFlow, type Shipment } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, Filter, ChevronDown, Thermometer, MapPin, Clock, Download, User } from 'lucide-react'

function ShipmentStatusBadge({ status }: { status: Shipment['status'] }) {
  const config = {
    'in-transit': { label: 'IN TRANSIT', className: 'border border-[#3B82F6] text-[#3B82F6]', dot: true },
    customs: { label: 'CUSTOMS', className: 'border border-[#8B5CF6] text-[#8B5CF6]', dot: false },
    arrived: { label: 'ARRIVED', className: 'bg-[#10B981] text-[#0A0A0A]', dot: false },
    delayed: { label: 'DELAYED', className: 'bg-[#E53E3E] text-white danger-glow', dot: false },
    loading: { label: 'LOADING', className: 'border border-[#C97B1A] text-[#C97B1A]', dot: false },
  }[status]

  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm font-medium', config.className)}>
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

export default function ShipmentsPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Shipment | null>(null)

  const stats = [
    { label: 'Active Shipments', value: String(mockShipments.length), color: '#F5F5F5' },
    { label: 'In Transit', value: String(mockShipments.filter(s => s.status === 'in-transit').length), color: '#3B82F6' },
    { label: 'Delivered Today', value: String(mockShipments.filter(s => s.status === 'arrived').length), color: '#10B981' },
    { label: 'Delayed', value: String(mockShipments.filter(s => s.status === 'delayed').length), color: '#E53E3E' },
  ]

  const filtered = useMemo(() => {
    return mockShipments.filter(s => {
      const q = query.trim().toLowerCase()
      const matchQ = !q ||
        s.id.toLowerCase().includes(q) ||
        s.laneCode.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q) ||
        s.currentLocation.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchQ && matchStatus
    })
  }, [query, statusFilter])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[20px] font-medium text-[#F5F5F5]">Shipments</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-1">Track individual shipments across all transport lanes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111111] border border-[#222222] p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">{stat.label}</p>
            <div className="text-[32px] font-light leading-none" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Timeline chart */}
      <div className="bg-[#111111] border border-[#222222]">
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Today&apos;s Shipment Flow</h2>
          <p className="text-[12px] text-[#3D3D3D] mt-1">Hourly departures vs arrivals</p>
        </div>
        <div className="h-[220px] px-4 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shipmentFlow} barCategoryGap={2}>
              <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" vertical={false} />
              <XAxis
                dataKey="hour"
                stroke="#3D3D3D"
                tick={{ fontSize: 10, fill: '#6B6B6B' }}
                axisLine={{ stroke: '#222222' }}
                tickLine={false}
              />
              <YAxis
                stroke="#3D3D3D"
                tick={{ fontSize: 10, fill: '#6B6B6B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0A0A0A', border: '1px solid #222222', fontSize: 12 }}
                labelStyle={{ color: '#6B6B6B' }}
                cursor={{ fill: 'rgba(16,185,129,0.05)' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6B6B6B' }} iconType="square" />
              <Bar dataKey="departures" name="Departures" fill="#10B981" />
              <Bar dataKey="arrivals" name="Arrivals" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Shipments table */}
      <div className="bg-[#111111] border border-[#222222]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#1A1A1A]">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3D3D3D]" strokeWidth={1.5} />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shipment ID, lane, carrier..."
                className="pl-9 h-8 text-[13px] bg-[#0A0A0A] border-[#222222] focus:border-[#10B981]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
                  <Filter className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {statusFilter === 'all' ? 'All Statuses' : statusFilter}
                  <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#0A0A0A] border-[#222222]">
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-[13px]">All Statuses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('in-transit')} className="text-[13px]">In Transit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('customs')} className="text-[13px]">Customs</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('loading')} className="text-[13px]">Loading</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('delayed')} className="text-[13px]">Delayed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('arrived')} className="text-[13px]">Arrived</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-[12px] text-[#6B6B6B]">{filtered.length} of {mockShipments.length}</span>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
            <Download className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Shipment ID</th>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Lane</th>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Carrier</th>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Location</th>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Temp</th>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">ETA</th>
                <th className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, index) => {
                const deviation = s.lastTemp > s.tempMax || s.lastTemp < s.tempMin
                return (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={cn(
                      'h-[52px] cursor-pointer hover:bg-[rgba(16,185,129,0.04)]',
                      index !== filtered.length - 1 && 'border-b border-[#1A1A1A]'
                    )}
                  >
                    <td className="px-4 font-mono text-[13px] text-[#F5F5F5]">{s.id}</td>
                    <td className="px-4 font-mono text-[13px] text-[#F5F5F5] font-semibold">{s.laneCode}</td>
                    <td className="px-4 text-[12px] text-[#A0A0A0]">{s.carrier}</td>
                    <td className="px-4 text-[12px] text-[#A0A0A0]">{s.currentLocation}</td>
                    <td className="px-4 text-[12px]">
                      <span className={cn('font-mono', deviation ? 'text-[#E53E3E]' : 'text-[#10B981]')}>
                        {s.lastTemp}°C
                      </span>
                    </td>
                    <td className="px-4 text-[12px] text-[#A0A0A0]">
                      {new Date(s.eta).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4"><ShipmentStatusBadge status={s.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] bg-[#0A0A0A] border-l border-[#222222] overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <SheetTitle className="text-[16px] font-medium text-[#F5F5F5] font-mono">
                    {selected.id}
                  </SheetTitle>
                  <ShipmentStatusBadge status={selected.status} />
                </div>
                <SheetDescription className="text-[13px] text-[#6B6B6B]">
                  <span className="font-mono text-[#A0A0A0]">{selected.laneCode}</span>
                  <span className="mx-2 text-[#3D3D3D]">·</span>
                  {selected.carrier}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Current location */}
                <div className="bg-[#111111] border border-[#222222] p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-[#10B981] mt-0.5" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1">Current location</p>
                      <p className="text-[14px] text-[#F5F5F5]">{selected.currentLocation}</p>
                    </div>
                  </div>
                </div>

                {/* Temperature */}
                <div className="bg-[#111111] border border-[#222222] p-4">
                  <div className="flex items-start gap-3">
                    <Thermometer className="w-4 h-4 text-[#10B981] mt-0.5" strokeWidth={1.5} />
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-1">Temperature</p>
                      <div className="flex items-baseline gap-2">
                        <span className={cn('text-[20px] font-light', selected.lastTemp > selected.tempMax || selected.lastTemp < selected.tempMin ? 'text-[#E53E3E]' : 'text-[#10B981]')}>
                          {selected.lastTemp}°C
                        </span>
                        <span className="text-[12px] text-[#6B6B6B]">range {selected.tempMin}–{selected.tempMax}°C</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-[#111111] border border-[#222222] p-4">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">Timeline</p>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-2" />
                      <div>
                        <p className="text-[12px] text-[#F5F5F5]">Departed</p>
                        <p className="text-[11px] text-[#6B6B6B]">{new Date(selected.departedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#6B6B6B] mt-2" />
                      <div>
                        <p className="text-[12px] text-[#F5F5F5]">ETA</p>
                        <p className="text-[11px] text-[#6B6B6B]">{new Date(selected.eta).toLocaleString()}</p>
                      </div>
                    </div>
                    {selected.arrivedAt && (
                      <div className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mt-2" />
                        <div>
                          <p className="text-[12px] text-[#F5F5F5]">Arrived</p>
                          <p className="text-[11px] text-[#6B6B6B]">{new Date(selected.arrivedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned */}
                <div className="bg-[#111111] border border-[#222222] p-4">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">Assigned</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center">
                      <User className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-[13px] text-[#F5F5F5]">Sarah Chen</p>
                      <p className="text-[11px] text-[#6B6B6B]">Logistics Lead</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1 h-9 text-[13px] bg-[#10B981] text-white hover:bg-[#059669]">
                    View Lane
                  </Button>
                  <Button variant="outline" className="flex-1 h-9 text-[13px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
                    <Clock className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> History
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
