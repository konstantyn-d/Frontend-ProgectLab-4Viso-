'use client'

import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react'
import type { RiskAssessment, RiskSeverity } from '@/lib/services/riskEngine'

const sevColor: Record<RiskSeverity, string> = {
  critical: 'var(--danger)',
  warning: 'var(--warn)',
  info: 'var(--info-c)',
}

const sevBg: Record<RiskSeverity, string> = {
  critical: 'var(--danger-bg)',
  warning: 'var(--warn-bg)',
  info: 'var(--info-bg)',
}

/** "Why is this lane risky?" — reasons + recommended actions. */
export function RiskBreakdownCard({ risk }: { risk: RiskAssessment }) {
  const healthy = risk.reasons.length === 0
  return (
    <section
      className="border border-border overflow-hidden"
      style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}
    >
      <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-[18px] h-[18px]" style={{ color: 'var(--warn)' }} strokeWidth={1.6} />
          <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
            Why is this lane risky?
          </h2>
        </div>
        <span className="font-mono text-[12px]" style={{ color: risk.level === 'low' ? 'var(--accent-deep)' : risk.level === 'critical' ? 'var(--danger)' : 'var(--warn)' }}>
          {risk.score}% · {risk.level}
        </span>
      </div>

      {healthy ? (
        <div className="flex items-center gap-2.5 px-[22px] py-[20px] text-[13px]" style={{ color: 'var(--accent-deep)' }}>
          <CheckCircle2 className="w-[16px] h-[16px]" strokeWidth={1.6} />
          No active risk factors detected for this lane.
        </div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--line-soft)' }}>
          {risk.reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-[22px] py-[14px]" style={{ borderTopColor: 'var(--line-soft)' }}>
              <div className="w-[28px] h-[28px] rounded-[8px] flex items-center justify-center shrink-0" style={{ background: sevBg[r.severity], color: sevColor[r.severity] }}>
                <AlertTriangle className="w-[14px] h-[14px]" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{r.message}</p>
                  <span className="font-mono text-[11px] shrink-0" style={{ color: sevColor[r.severity] }}>+{r.impact}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
                  <span className="font-mono uppercase tracking-[0.06em]">{r.type.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>{r.affectedEntity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {risk.recommendedActions.length > 0 && (
        <div className="px-[22px] py-[16px] border-t" style={{ borderColor: 'var(--line-soft)', background: 'var(--secondary)' }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2.5" style={{ color: 'var(--muted-foreground)' }}>Recommended actions</p>
          <ul className="space-y-1.5">
            {risk.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-[12.5px]" style={{ color: 'var(--text-body)' }}>
                <span className="mt-[6px] w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--accent-deep)' }} />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
