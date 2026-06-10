'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, AlertTriangle, Truck, FileCheck, Clock, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/lib/theme-context'
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
  critical: { border: 'border-[var(--danger)]', text: 'text-[var(--danger)]' },
  warning: { border: 'border-[var(--warn)]', text: 'text-[var(--warn)]' },
  info: { border: 'border-[var(--info-c)]', text: 'text-[var(--info-c)]' },
  success: { border: 'border-[var(--primary)]', text: 'text-[var(--primary)]' },
}

function IconButton({
  children,
  onClick,
  label,
  badge,
  className,
}: {
  children: React.ReactNode
  onClick?: () => void
  label?: string
  badge?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'relative w-[38px] h-[38px] rounded-full flex items-center justify-center',
        'bg-secondary border border-border text-muted-foreground',
        'hover:text-[var(--accent-deep)] hover:border-[var(--accent-line)]',
        'transition-all duration-200 hover:-translate-y-px',
        className
      )}
    >
      {children}
      {badge && (
        <span
          className="absolute top-[9px] right-[9px] w-[7px] h-[7px] rounded-full"
          style={{ background: 'var(--danger)', border: '1.5px solid var(--card)' }}
        />
      )}
    </button>
  )
}

export function Header() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
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
    return {
      lanes: mockLanes
        .filter(l =>
          `${l.originCode}-${l.destinationCode}`.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q) ||
          l.origin.toLowerCase().includes(q) ||
          l.destination.toLowerCase().includes(q)
        )
        .slice(0, 4),
      carriers: carriers.filter(c => c.toLowerCase().includes(q)).slice(0, 3),
      shipments: mockShipments
        .filter(s =>
          s.id.toLowerCase().includes(q) ||
          s.laneCode.toLowerCase().includes(q) ||
          s.carrier.toLowerCase().includes(q)
        )
        .slice(0, 4),
    }
  }, [query])

  const hasResults = results.lanes.length > 0 || results.carriers.length > 0 || results.shipments.length > 0

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 border-b border-border"
      style={{
        height: 62,
        padding: '0 32px',
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      }}
    >
      {/* Breadcrumb / title area (spacer) */}
      <div className="flex-1" />

      {/* Search */}
      <div ref={searchRef} className="relative">
        <div
          className="flex items-center gap-2.5 h-[38px] px-4 rounded-full border border-border text-muted-foreground transition-all duration-200 focus-within:border-[var(--accent-line)] focus-within:bg-card min-w-[260px]"
          style={{ background: 'var(--secondary)' }}
        >
          <Search className="w-[15px] h-[15px] shrink-0" strokeWidth={1.5} />
          <input
            type="search"
            placeholder="Search lanes, ports, carriers…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
          />
          <kbd className="font-mono text-[10px] text-muted-foreground border border-border rounded-[5px] px-1.5 py-0.5 bg-card">⌘K</kbd>
        </div>

        {open && query && (
          <div
            className="absolute top-full right-0 mt-2 bg-card border border-border max-h-[360px] overflow-auto z-50 min-w-[320px]"
            style={{ borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-2)' }}
          >
            {!hasResults && (
              <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
                No results for &quot;{query}&quot;
              </div>
            )}
            {results.lanes.length > 0 && (
              <div className="py-1">
                <div className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.09em] text-muted-foreground">Lanes</div>
                {results.lanes.map(l => (
                  <button
                    key={l.id}
                    onClick={() => { router.push(`/dashboard/lanes/${l.id}`); setOpen(false); setQuery('') }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] hover:bg-secondary transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-foreground">{l.originCode}–{l.destinationCode}</span>
                      <span className="text-muted-foreground text-[11px]">{l.carrier}</span>
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">{l.id}</span>
                  </button>
                ))}
              </div>
            )}
            {results.carriers.length > 0 && (
              <div className="py-1 border-t border-border">
                <div className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.09em] text-muted-foreground">Carriers</div>
                {results.carriers.map(c => (
                  <button key={c} onClick={() => setOpen(false)} className="w-full text-left px-3 py-1.5 text-[13px] text-[var(--text-body)] hover:bg-secondary transition-colors">
                    {c}
                  </button>
                ))}
              </div>
            )}
            {results.shipments.length > 0 && (
              <div className="py-1 border-t border-border">
                <div className="px-3 pt-2 pb-1 font-mono text-[10px] uppercase tracking-[0.09em] text-muted-foreground">Shipments</div>
                {results.shipments.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { router.push('/dashboard/shipments'); setOpen(false); setQuery('') }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] hover:bg-secondary transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono text-foreground">{s.id}</span>
                      <span className="text-muted-foreground text-[11px]">{s.laneCode}</span>
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">{s.currentLocation}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <IconButton onClick={toggleTheme} label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          {theme === 'dark'
            ? <Sun className="w-[17px] h-[17px]" strokeWidth={1.5} />
            : <Moon className="w-[17px] h-[17px]" strokeWidth={1.5} />
          }
        </IconButton>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div>
              <IconButton label="Notifications" badge>
                <Bell className="w-[17px] h-[17px]" strokeWidth={1.5} />
              </IconButton>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-card border-border" style={{ borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-2)' }}>
            <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.09em] text-muted-foreground">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            {notifications.map(n => {
              const colors = notifSeverityColors[n.severity]
              return (
                <DropdownMenuItem
                  key={n.id}
                  className={cn('flex gap-3 py-3 border-l-2 rounded-none cursor-pointer items-start', colors.border)}
                >
                  <div className={cn('mt-0.5 shrink-0', colors.text)}>{notifIconMap[n.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-0.5">
                      <span className="text-[12px] text-foreground font-medium">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--text-body)] leading-snug">{n.description}</p>
                  </div>
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="justify-center text-[12px] text-[var(--accent-deep)] hover:text-[var(--primary)] cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-200 hover:-translate-y-px cursor-pointer"
              style={{
                background: 'var(--primary)',
                color: 'var(--on-accent)',
                fontFamily: 'var(--font-display)',
              }}
              title="Sarah Chen"
            >
              SC
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border" style={{ borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-2)' }}>
            <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-[0.09em] text-muted-foreground">
              Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-[13px] text-[var(--text-body)] cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px] text-[var(--text-body)] cursor-pointer">Settings</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="text-[13px] text-[var(--danger)] cursor-pointer">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
