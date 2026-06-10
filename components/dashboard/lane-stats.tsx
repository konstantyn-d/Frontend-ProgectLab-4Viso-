'use client'

import { Route, Plane, Clock, Thermometer } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLanes } from '@/lib/services/lanesService'

const iconBg = { accent: 'var(--accent-wash)', warn: 'var(--warn-bg)', danger: 'var(--danger-bg)' }
const iconColor = { accent: 'var(--accent-deep)', warn: 'var(--warn)', danger: 'var(--danger)' }

export function LaneStats() {
  const { data: lanes, loading, error } = useQuery(getLanes, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px]">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="border border-border shimmer" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', height: 118, boxShadow: 'var(--shadow-1)' }} />
        ))}
      </div>
    )
  }

  if (error || !lanes) {
    return (
      <div className="border border-border p-5 text-[13px]" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', color: 'var(--danger)' }}>
        Could not load lane stats{error ? `: ${error}` : ''}.
      </div>
    )
  }

  const data = [
    { label: 'Total Lanes', value: lanes.length, variant: 'accent' as const, icon: <Route className="w-[17px] h-[17px]" strokeWidth={1.6} /> },
    { label: 'In Transit', value: lanes.filter(l => l.status === 'in-transit').length, variant: 'accent' as const, icon: <Plane className="w-[17px] h-[17px]" strokeWidth={1.6} /> },
    { label: 'Delayed', value: lanes.filter(l => l.status === 'delayed').length, variant: 'warn' as const, icon: <Clock className="w-[17px] h-[17px]" strokeWidth={1.6} /> },
    { label: 'Temp Deviations', value: lanes.filter(l => l.tempDeviation).length, variant: 'danger' as const, icon: <Thermometer className="w-[17px] h-[17px]" strokeWidth={1.6} /> },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] reveal-stagger">
      {data.map(s => (
        <div
          key={s.label}
          className="border border-border overflow-hidden"
          style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.12em]" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            <div className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px]" style={{ background: iconBg[s.variant], color: iconColor[s.variant] }}>
              {s.icon}
            </div>
          </div>
          <div
            className="text-[40px] leading-none tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--foreground)' }}
          >
            {s.value}
          </div>
        </div>
      ))}
    </div>
  )
}
