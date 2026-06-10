'use client'

import { cn } from '@/lib/utils'

interface CorridorData {
  corridor: string
  activeLanes: number
  avgRisk: number
  compliance: number
  throughput: string
  status: 'compliant' | 'warning' | 'deviation'
}

const corridors: CorridorData[] = [
  { corridor: 'EU - APAC', activeLanes: 12, avgRisk: 18, compliance: 97.2, throughput: '24.5k units', status: 'compliant' },
  { corridor: 'EU - NAM', activeLanes: 8, avgRisk: 24, compliance: 94.8, throughput: '18.2k units', status: 'compliant' },
  { corridor: 'APAC - NAM', activeLanes: 6, avgRisk: 45, compliance: 91.3, throughput: '12.8k units', status: 'warning' },
  { corridor: 'EU - LATAM', activeLanes: 5, avgRisk: 62, compliance: 88.5, throughput: '8.4k units', status: 'deviation' },
  { corridor: 'EU - MEA', activeLanes: 4, avgRisk: 32, compliance: 93.1, throughput: '6.2k units', status: 'warning' },
  { corridor: 'APAC - MEA', activeLanes: 3, avgRisk: 15, compliance: 98.4, throughput: '4.1k units', status: 'compliant' },
]

const statusBorder = {
  compliant: 'border-l-[var(--primary)]',
  warning: 'border-l-[var(--warn)]',
  deviation: 'border-l-[var(--danger)]',
}

const statusText = {
  compliant: 'text-[var(--accent-deep)]',
  warning: 'text-[var(--warn)]',
  deviation: 'text-[var(--danger)]',
}

export function NetworkStatus() {
  return (
    <div
      className="border border-border overflow-hidden"
      style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}
    >
      {/* Column headers */}
      <div
        className="grid grid-cols-6 px-[22px] py-[16px] border-b"
        style={{ borderColor: 'var(--line-soft)' }}
      >
        {['Corridor', 'Active Lanes', 'Avg Risk', 'Compliance', 'Throughput', 'Status'].map(h => (
          <span key={h} className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {corridors.map((row, idx) => (
        <div
          key={row.corridor}
          className={cn(
            'grid grid-cols-6 px-[22px] py-[18px] border-l-[3px] items-center transition-colors hover:bg-secondary',
            statusBorder[row.status],
            idx !== corridors.length - 1 && 'border-b'
          )}
          style={{ borderBottomColor: 'var(--line-soft)' }}
        >
          <span className="font-mono text-[13.5px] font-medium text-foreground">{row.corridor}</span>
          <span className="text-[13.5px]" style={{ color: 'var(--text-body)' }}>{row.activeLanes}</span>
          <span className={cn('text-[13.5px]', row.avgRisk > 60 ? 'text-[var(--danger)]' : '')} style={row.avgRisk <= 60 ? { color: 'var(--text-body)' } : {}}>
            {row.avgRisk}%
          </span>
          <div>
            <span className="text-[13.5px]" style={{ color: 'var(--text-body)' }}>{row.compliance}%</span>
            <div className="h-[4px] rounded-full mt-1.5 max-w-[90px] overflow-hidden" style={{ background: 'var(--secondary)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${row.compliance}%`, background: 'var(--primary)' }}
              />
            </div>
          </div>
          <span className="text-[13.5px]" style={{ color: 'var(--text-body)' }}>{row.throughput}</span>
          <span className={cn('font-mono text-[10px] uppercase tracking-[0.08em]', statusText[row.status])}>
            {row.status}
          </span>
        </div>
      ))}
    </div>
  )
}
