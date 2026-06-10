'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, User, AlertTriangle, Truck, FileCheck, Clock, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { mockLanes, mockShipments, carriers } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'alert' | 'shipment' | 'compliance' | 'delay'
  title: string
  description: string
  time: string
  severity: 'critical' | 'warning' | 'info' | 'success'
}

const notifications: Notification[] = [
  { id: 'N1', type: 'alert', title: 'Temperature deviation', description: 'LN-003: 11°C exceeds 8°C threshold', time: '2m ago', severity: 'critical' },
  { id: 'N2', type: 'delay', title: 'Customs delay', description: 'LN-008 delayed 4h at LAX', time: '18m ago', severity: 'warning' },
  { id: 'N3', type: 'shipment', title: 'Shipment departed', description: 'SH-48211 left Mumbai', time: '1h ago', severity: 'info' },
  { id: 'N4', type: 'compliance', title: 'Audit completed', description: 'Q1 GDP audit passed, 0 findings', time: '3h ago', severity: 'success' },
  { id: 'N5', type: 'shipment', title: 'Shipment arrived', description: 'SH-48150 arrived Tokyo NRT', time: '5h ago', severity: 'success' },
]

const notifIconMap: Record<Notification['type'], React.ReactNode> = {
  alert: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />,
  shipment: <Truck className="w-3.5 h-3.5" strokeWidth={1.5} />,
  compliance: <FileCheck className="w-3.5 h-3.5" strokeWidth={1.5} />,
  delay: <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />,
}

const notifSeverityColors = {
  critical: 'text-[#E53E3E] border-[#E53E3E]',
  warning: 'text-[#C97B1A] border-[#C97B1A]',
  info: 'text-[#3B82F6] border-[#3B82F6]',
  success: 'text-[#10B981] border-[#10B981]',
}

export function Header() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return { lanes: [], carriers: [], shipments: [] }

    const lanes = mockLanes
      .filter(l =>
        `${l.originCode}-${l.destinationCode}`.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q) ||
        l.origin.toLowerCase().includes(q) ||
        l.destination.toLowerCase().includes(q)
      )
      .slice(0, 4)

    const carrierResults = carriers.filter(c => c.toLowerCase().includes(q)).slice(0, 3)

    const shipments = mockShipments
      .filter(s =>
        s.id.toLowerCase().includes(q) ||
        s.laneCode.toLowerCase().includes(q) ||
        s.carrier.toLowerCase().includes(q)
      )
      .slice(0, 4)

    return { lanes, carriers: carrierResults, shipments }
  }, [query])

  const hasResults =
    results.lanes.length > 0 ||
    results.carriers.length > 0 ||
    results.shipments.length > 0

  return (
    <header className="h-14 border-b border-[#222222] bg-[#0A0A0A] flex items-center justify-between px-6">
      {/* Search */}
      <div ref={searchRef} className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3D3D3D]" strokeWidth={1.5} />
        <Input
          type="search"
          placeholder="Try: BRU-SIN, DHL, LN-003..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          className="pl-9 h-8 text-[13px] bg-[#111111] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#10B981] focus-visible:ring-[#10B981]"
        />
        {open && query && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-[#222222] max-h-[360px] overflow-auto z-50">
            {!hasResults && (
              <div className="px-4 py-6 text-center text-[12px] text-[#6B6B6B]">
                No results for &quot;{query}&quot;
              </div>
            )}
            {results.lanes.length > 0 && (
              <div className="py-1">
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
                  Lanes
                </div>
                {results.lanes.map(l => (
                  <button
                    key={l.id}
                    onClick={() => {
                      router.push(`/dashboard/lanes/${l.id}`)
                      setOpen(false)
                      setQuery('')
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] hover:bg-[#111111]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[#F5F5F5]">
                        {l.originCode}-{l.destinationCode}
                      </span>
                      <span className="text-[#6B6B6B] text-[11px]">{l.carrier}</span>
                    </span>
                    <span className="font-mono text-[10px] text-[#3D3D3D]">{l.id}</span>
                  </button>
                ))}
              </div>
            )}
            {results.carriers.length > 0 && (
              <div className="py-1 border-t border-[#1A1A1A]">
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
                  Carriers
                </div>
                {results.carriers.map(c => (
                  <button
                    key={c}
                    onClick={() => setOpen(false)}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-[#A0A0A0] hover:bg-[#111111]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
            {results.shipments.length > 0 && (
              <div className="py-1 border-t border-[#1A1A1A]">
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
                  Shipments
                </div>
                {results.shipments.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      router.push('/dashboard/shipments')
                      setOpen(false)
                      setQuery('')
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] hover:bg-[#111111]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-[#F5F5F5]">{s.id}</span>
                      <span className="text-[#6B6B6B] text-[11px]">{s.laneCode}</span>
                    </span>
                    <span className="text-[10px] text-[#3D3D3D]">{s.currentLocation}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <Bell className="w-4 h-4" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#E53E3E] rounded-full" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-[#0A0A0A] border-[#222222]">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            {notifications.map(n => (
              <DropdownMenuItem
                key={n.id}
                className={cn(
                  'flex gap-3 py-3 border-l-2 rounded-none cursor-pointer items-start',
                  notifSeverityColors[n.severity].split(' ')[1]
                )}
              >
                <div className={cn('mt-0.5 shrink-0', notifSeverityColors[n.severity].split(' ')[0])}>
                  {notifIconMap[n.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-0.5">
                    <span className="text-[12px] text-[#F5F5F5] font-medium">{n.title}</span>
                    <span className="text-[10px] text-[#6B6B6B] shrink-0">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[#A0A0A0] leading-snug">{n.description}</p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="justify-center text-[12px] text-[#10B981] hover:text-[#34D399] cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2.5 px-2 h-8 hover:bg-[#1A1A1A]"
            >
              <div className="w-6 h-6 rounded-sm bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <p className="text-[12px] text-[#F5F5F5]">Sarah Chen</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#0A0A0A] border-[#222222]">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
              Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="text-[13px] text-[#A0A0A0] cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px] text-[#A0A0A0] cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#1A1A1A]" />
            <DropdownMenuItem className="text-[13px] text-[#E53E3E] cursor-pointer">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
