'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLaneDetail } from '@/lib/services/lanesService'
import { getLaneChecklist, type CheckStatus } from '@/lib/services/complianceService'
import { getAlertsForLane } from '@/lib/services/alertsService'
import { getAuditLog, logAudit } from '@/lib/services/auditService'

const checkIcon: Record<CheckStatus, React.ReactNode> = {
  passed: <CheckCircle2 className="w-[14px] h-[14px]" style={{ color: 'var(--accent-deep)' }} strokeWidth={1.6} />,
  warning: <AlertTriangle className="w-[14px] h-[14px]" style={{ color: 'var(--warn)' }} strokeWidth={1.6} />,
  failed: <XCircle className="w-[14px] h-[14px]" style={{ color: 'var(--danger)' }} strokeWidth={1.6} />,
  pending: <Clock className="w-[14px] h-[14px]" style={{ color: 'var(--muted-foreground)' }} strokeWidth={1.6} />,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border overflow-hidden mb-[16px]" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}>
      <div className="px-[20px] py-[14px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
        <h2 className="font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>{title}</h2>
      </div>
      <div className="p-[20px]">{children}</div>
    </section>
  )
}

export default function ComplianceReportPage() {
  const router = useRouter()
  const params = useParams()
  const laneCode = params?.laneCode as string

  const { data: detail, loading } = useQuery(() => getLaneDetail(laneCode), [laneCode])
  const { data: checklist } = useQuery(() => getLaneChecklist(laneCode), [laneCode])
  const { data: alerts } = useQuery(() => getAlertsForLane(laneCode), [laneCode])
  const { data: audit } = useQuery(getAuditLog, [])
  const logged = useRef(false)

  useEffect(() => {
    if (detail && !logged.current) {
      logged.current = true
      logAudit({ actionType: 'report_generated', entityType: 'lane', description: `Compliance report generated for ${laneCode}` }).catch(() => {})
    }
  }, [detail, laneCode])

  if (loading) return <div className="py-24 text-center text-[14px]" style={{ color: 'var(--muted-foreground)' }}>Building report…</div>
  if (!detail) return <div className="py-24 text-center text-[14px]" style={{ color: 'var(--muted-foreground)' }}>Lane not found</div>

  const { lane, nodes, risk } = detail
  const laneAudit = (audit ?? []).filter(a => a.laneId === laneCode)

  return (
    <div className="max-w-[920px] mx-auto">
      {/* Toolbar (hidden in print) */}
      <div className="flex items-center justify-between mb-[24px] print:hidden">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft className="w-[15px] h-[15px]" strokeWidth={1.5} /> Back
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 h-[36px] px-[16px] rounded-full text-[12.5px] font-medium" style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}>
          <Printer className="w-[14px] h-[14px]" strokeWidth={1.6} /> Print / Save PDF
        </button>
      </div>

      {/* Report header */}
      <div className="mb-[20px]">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em]" style={{ color: 'var(--accent-deep)' }}>4Viso PharmaTrack · Compliance Report</p>
        <h1 className="font-mono mt-2" style={{ fontWeight: 600, fontSize: 26, color: 'var(--foreground)' }}>{lane.originCode} → {lane.destinationCode}</h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--muted-foreground)' }}>
          {lane.id} · {lane.origin} to {lane.destination} · {lane.carrier} · generated {new Date().toLocaleString()}
        </p>
      </div>

      <Section title="Lane summary">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
          {[
            ['Mode', lane.mode],
            ['Temperature range', `${lane.tempMin}–${lane.tempMax}°C`],
            ['Current temperature', `${lane.currentTemp}°C${lane.tempDeviation ? ' (deviation)' : ''}`],
            ['Risk score', `${risk.score}% · ${risk.level}`],
            ['Compliance', lane.gdpCompliant ? 'Compliant' : 'Non-compliant'],
            ['Status', lane.status],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="font-mono text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--muted-foreground)' }}>{k}</div>
              <div className="text-[13.5px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </Section>

      {checklist && (
        <Section title={`Compliance checklist — ${checklist.overall}`}>
          <div className="space-y-2">
            {checklist.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">{checkIcon[item.status]}<span className="text-[13px]" style={{ color: 'var(--foreground)' }}>{item.label}</span></div>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: 'var(--muted-foreground)' }}>{item.detail ?? item.status}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {nodes.length > 0 && (
        <Section title="Route nodes">
          <div className="space-y-3">
            {nodes.map(n => (
              <div key={n.id} className="flex items-start justify-between gap-3 pb-3 border-b last:border-0" style={{ borderColor: 'var(--line-soft)' }}>
                <div>
                  <div className="text-[13px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{n.name} <span className="font-mono text-[11px]" style={{ color: 'var(--muted-foreground)' }}>· {n.type}</span></div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {n.responsibleCompany ?? 'Unassigned'} · temp control: {n.temperatureControl ? 'yes' : 'no'} · security: {n.securityLevel ?? '—'}
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] shrink-0" style={{ color: n.validationStatus === 'validated' ? 'var(--accent-deep)' : n.validationStatus === 'missing' || n.validationStatus === 'rejected' ? 'var(--danger)' : 'var(--warn)' }}>
                  {n.validationStatus}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {risk.reasons.length > 0 && (
        <Section title="Risk findings">
          <div className="space-y-2">
            {risk.reasons.map((r, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <span className="text-[12.5px]" style={{ color: 'var(--text-body)' }}>{r.message}</span>
                <span className="font-mono text-[11px] shrink-0" style={{ color: 'var(--danger)' }}>+{r.impact}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Alerts">
        {(alerts ?? []).length === 0 ? (
          <p className="text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>No alerts recorded for this lane.</p>
        ) : (
          <div className="space-y-2">
            {(alerts ?? []).map(a => (
              <div key={a.id} className="flex items-center justify-between gap-3">
                <span className="text-[12.5px]" style={{ color: 'var(--foreground)' }}>{a.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em]" style={{ color: a.status === 'resolved' ? 'var(--accent-deep)' : 'var(--warn)' }}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Audit trail">
        {laneAudit.length === 0 ? (
          <p className="text-[12.5px]" style={{ color: 'var(--muted-foreground)' }}>No audit entries for this lane.</p>
        ) : (
          <div className="space-y-2">
            {laneAudit.map(e => (
              <div key={e.id} className="flex items-start justify-between gap-3">
                <span className="text-[12.5px]" style={{ color: 'var(--text-body)' }}>{e.description}</span>
                <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--muted-foreground)' }}>{new Date(e.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      <p className="text-center text-[11px] mt-6 mb-10" style={{ color: 'var(--text-muted)' }}>
        © 2026 4Viso · Confidential compliance evidence · {lane.id}
      </p>
    </div>
  )
}
