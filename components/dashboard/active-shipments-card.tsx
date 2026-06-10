'use client'

import { useRouter } from 'next/navigation'
import { Package, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getShipmentsForLane } from '@/lib/services/shipmentsService'

const statusColor: Record<string, string> = {
  'in-transit': 'var(--info-c)',
  customs: '#8B5CF6',
  arrived: 'var(--accent-deep)',
  delayed: 'var(--danger)',
  loading: 'var(--warn)',
}

export function ActiveShipmentsCard({ laneCode }: { laneCode: string }) {
  const router = useRouter()
  const { data: shipments, loading, error } = useQuery(() => getShipmentsForLane(laneCode), [laneCode])

  return (
    <section className="border border-border overflow-hidden" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}>
      <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
        <div className="flex items-center gap-2.5">
          <Package className="w-[18px] h-[18px]" style={{ color: 'var(--accent-deep)' }} strokeWidth={1.6} />
          <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
            Active Shipments
          </h2>
        </div>
        <span className="font-mono text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{shipments?.length ?? 0}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line-soft)' }}>
              {['Shipment', 'Location', 'Temp', 'ETA', 'Status'].map(h => (
                <th key={h} className="text-left px-[18px] py-[11px] font-mono text-[10px] uppercase tracking-[0.09em] font-medium" style={{ color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-[18px] py-8 text-center text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>Loading shipments…</td></tr>}
            {!loading && error && <tr><td colSpan={6} className="px-[18px] py-8 text-center text-[12.5px]" style={{ color: 'var(--danger)' }}>{error}</td></tr>}
            {!loading && !error && (shipments?.length ?? 0) === 0 && <tr><td colSpan={6} className="px-[18px] py-8 text-center text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>No shipments on this lane.</td></tr>}
            {!loading && !error && shipments?.map(s => {
              const deviation = s.lastTemp > s.tempMax || s.lastTemp < s.tempMin
              return (
                <tr
                  key={s.id}
                  onClick={() => router.push('/dashboard/shipments')}
                  className="cursor-pointer group transition-colors"
                  style={{ borderBottom: '1px solid var(--line-soft)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-wash)')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td className="px-[18px] py-[12px] font-mono text-[13px] font-semibold" style={{ color: 'var(--foreground)' }}>{s.id}</td>
                  <td className="px-[18px] py-[12px] text-[12.5px]" style={{ color: 'var(--text-body)' }}>{s.currentLocation}</td>
                  <td className="px-[18px] py-[12px] text-[12.5px] font-mono" style={{ color: deviation ? 'var(--danger)' : 'var(--foreground)' }}>{s.lastTemp}°C</td>
                  <td className="px-[18px] py-[12px] text-[12px]" style={{ color: 'var(--muted-foreground)' }}>{s.eta ? new Date(s.eta).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="px-[18px] py-[12px]"><span className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: statusColor[s.status] ?? 'var(--muted-foreground)' }}>{s.status}</span></td>
                  <td className="px-[18px] py-[12px] text-right"><ArrowUpRight className="w-[14px] h-[14px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent-deep)' }} strokeWidth={1.6} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
