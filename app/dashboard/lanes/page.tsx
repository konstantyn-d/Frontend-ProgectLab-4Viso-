import { mockLanes } from '@/lib/mock-data'
import { LaneTable } from '@/components/dashboard/lane-table'
import { Route, Plane, Clock, Thermometer } from 'lucide-react'

const stats = [
  { label: 'Total Lanes', value: 0, key: 'total', icon: <Route className="w-[17px] h-[17px]" strokeWidth={1.6} />, variant: 'accent' as const },
  { label: 'In Transit', value: 0, key: 'transit', icon: <Plane className="w-[17px] h-[17px]" strokeWidth={1.6} />, variant: 'accent' as const },
  { label: 'Delayed', value: 0, key: 'delayed', icon: <Clock className="w-[17px] h-[17px]" strokeWidth={1.6} />, variant: 'warn' as const },
  { label: 'Temp Deviations', value: 0, key: 'tempDev', icon: <Thermometer className="w-[17px] h-[17px]" strokeWidth={1.6} />, variant: 'danger' as const },
]

const iconBg = { accent: 'var(--accent-wash)', warn: 'var(--warn-bg)', danger: 'var(--danger-bg)' }
const iconColor = { accent: 'var(--accent-deep)', warn: 'var(--warn)', danger: 'var(--danger)' }

function LaneStats() {
  const lanes = mockLanes
  const data = [
    { label: 'Total Lanes', value: lanes.length, variant: 'accent' as const, icon: stats[0].icon },
    { label: 'In Transit', value: lanes.filter(l => l.status === 'in-transit').length, variant: 'accent' as const, icon: stats[1].icon },
    { label: 'Delayed', value: lanes.filter(l => l.status === 'delayed').length, variant: 'warn' as const, icon: stats[2].icon },
    { label: 'Temp Deviations', value: lanes.filter(l => l.tempDeviation).length, variant: 'danger' as const, icon: stats[3].icon },
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

export default function LanesPage() {
  return (
    <div className="space-y-[18px]">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-[30px]">
        <div>
          <h1
            className="leading-none tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}
          >
            Transport <span style={{ color: 'var(--accent-deep)', fontStyle: 'italic' }}>Lanes</span>
          </h1>
          <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)', maxWidth: 540 }}>
            Every active and recent cold-chain lane across the network. Select a lane to inspect its route, temperature history and event timeline.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 h-[38px] px-[16px] rounded-full text-[13.5px] font-medium transition-all duration-200 hover:-translate-y-px"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'var(--shadow-1)' }}
        >
          Export
        </button>
      </div>

      <LaneStats />
      <LaneTable />
    </div>
  )
}
