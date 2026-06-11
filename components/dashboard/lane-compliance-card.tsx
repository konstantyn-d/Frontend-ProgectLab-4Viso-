'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertTriangle, XCircle, Clock, FileText } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLaneChecklist, type CheckStatus } from '@/lib/services/complianceService'

const cfg: Record<CheckStatus, { color: string; icon: React.ReactNode; label: string }> = {
  passed: { color: 'var(--accent-deep)', icon: <CheckCircle2 className="w-[15px] h-[15px]" strokeWidth={1.6} />, label: 'Passed' },
  warning: { color: 'var(--warn)', icon: <AlertTriangle className="w-[15px] h-[15px]" strokeWidth={1.6} />, label: 'Warning' },
  failed: { color: 'var(--danger)', icon: <XCircle className="w-[15px] h-[15px]" strokeWidth={1.6} />, label: 'Failed' },
  pending: { color: 'var(--muted-foreground)', icon: <Clock className="w-[15px] h-[15px]" strokeWidth={1.6} />, label: 'Pending' },
}

export function LaneComplianceCard({ laneCode }: { laneCode: string }) {
  const router = useRouter()
  const { data: checklist, loading } = useQuery(() => getLaneChecklist(laneCode), [laneCode])

  return (
    <section className="border border-border overflow-hidden" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}>
      <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-[18px] h-[18px]" style={{ color: 'var(--accent-deep)' }} strokeWidth={1.6} />
          <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
            Compliance Checklist
          </h2>
          {checklist && (
            <span className="font-mono text-[10px] uppercase tracking-[0.07em] px-2 py-0.5 rounded-full" style={{ color: cfg[checklist.overall].color, background: 'var(--secondary)' }}>
              {cfg[checklist.overall].label}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push(`/dashboard/compliance/report/${laneCode}`)}
          className="inline-flex items-center gap-2 h-[32px] px-[13px] rounded-full text-[12px] font-medium transition-all hover:-translate-y-px"
          style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 8px 18px -8px rgba(16,185,129,0.55)' }}
        >
          <FileText className="w-[13px] h-[13px]" strokeWidth={1.6} /> Generate report
        </button>
      </div>

      <div>
        {loading && <div className="px-[22px] py-6 text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>Running checks…</div>}
        {checklist?.items.map((item, i) => {
          const c = cfg[item.status]
          return (
            <div key={i} className="flex items-center justify-between gap-3 px-[22px] py-[11px]" style={{ borderTop: i > 0 ? '1px solid var(--line-soft)' : undefined }}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span style={{ color: c.color }}>{c.icon}</span>
                <span className="text-[13px] truncate" style={{ color: 'var(--foreground)' }}>{item.label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {item.detail && <span className="font-mono text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{item.detail}</span>}
                <span className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: c.color }}>{c.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
