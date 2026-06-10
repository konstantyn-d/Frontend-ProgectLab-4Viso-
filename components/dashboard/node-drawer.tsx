'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { MapPin, Building2, ShieldCheck, Thermometer, Lock, Boxes, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { LaneNode } from '@/lib/services/lanesService'
import { assessLaneRisk, type RiskSeverity } from '@/lib/services/riskEngine'

const sevColor: Record<RiskSeverity, string> = { critical: 'var(--danger)', warning: 'var(--warn)', info: 'var(--info-c)' }

const validationColor: Record<string, string> = {
  validated: 'var(--accent-deep)', claimed: 'var(--warn)', missing: 'var(--danger)', rejected: 'var(--danger)', expired: 'var(--danger)',
}

function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b" style={{ borderColor: 'var(--line-soft)' }}>
      <div className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shrink-0" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.09em] mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
        <div className="text-[13px]" style={{ color: 'var(--foreground)' }}>{children}</div>
      </div>
    </div>
  )
}

export function NodeDrawer({
  node, laneTempMin, laneTempMax, onOpenChange,
}: { node: LaneNode | null; laneTempMin: number; laneTempMax: number; onOpenChange: (open: boolean) => void }) {
  const risk = node
    ? assessLaneRisk({
        laneCode: node.name,
        requiredTempMin: laneTempMin,
        requiredTempMax: laneTempMax,
        nodes: [{
          name: node.name,
          type: node.type,
          validationStatus: node.validationStatus,
          temperatureControl: node.temperatureControl,
          tempMin: node.tempMin,
          tempMax: node.tempMax,
          securityLevel: node.securityLevel as 'low' | 'medium' | 'high' | null,
          handlingCapabilities: node.handlingCapabilities,
          specialConditions: node.specialConditions,
          certifications: node.certifications,
        }],
        package: { goodsType: 'pharma', requiredTempMin: laneTempMin, requiredTempMax: laneTempMax },
      })
    : null

  return (
    <Sheet open={node !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-[460px] overflow-y-auto" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        {node && risk && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="font-mono text-[11px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>{node.type.replace('_', ' ')}</span>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.07em] px-2 py-0.5 rounded-full"
                  style={{ color: validationColor[node.validationStatus] ?? 'var(--muted-foreground)', background: 'var(--secondary)' }}
                >
                  {node.validationStatus}
                </span>
              </div>
              <SheetTitle style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
                {node.name}{node.code ? ` · ${node.code}` : ''}
              </SheetTitle>
            </SheetHeader>

            {/* risk banner */}
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--r-md)] my-4"
              style={{ background: risk.level === 'low' ? 'var(--accent-wash)' : risk.level === 'medium' ? 'var(--warn-bg)' : 'var(--danger-bg)' }}
            >
              <span className="text-[12.5px] font-medium" style={{ color: risk.level === 'low' ? 'var(--accent-deep)' : risk.level === 'medium' ? 'var(--warn)' : 'var(--danger)' }}>
                Node risk
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: risk.level === 'low' ? 'var(--accent-deep)' : risk.level === 'medium' ? 'var(--warn)' : 'var(--danger)' }}>
                {risk.score}% · {risk.level}
              </span>
            </div>

            <Row icon={<MapPin className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Location">{node.locationName || '—'}</Row>
            <Row icon={<Building2 className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Responsible company">{node.responsibleCompany || 'Unassigned'}</Row>
            <Row icon={<Thermometer className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Temperature control">
              {node.temperatureControl ? <span style={{ color: 'var(--accent-deep)' }}>Yes{node.tempMin != null ? ` · ${node.tempMin}–${node.tempMax}°C` : ''}</span> : <span style={{ color: 'var(--danger)' }}>No</span>}
            </Row>
            <Row icon={<Lock className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Security level">
              <span style={{ color: node.securityLevel === 'low' ? 'var(--danger)' : 'var(--foreground)' }}>{node.securityLevel ?? '—'}</span>
            </Row>
            <Row icon={<Boxes className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Handling capabilities">
              {node.handlingCapabilities.length ? node.handlingCapabilities.join(', ') : <span style={{ color: 'var(--muted-foreground)' }}>Unknown</span>}
            </Row>
            {node.specialConditions.length > 0 && (
              <Row icon={<AlertTriangle className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Special conditions">{node.specialConditions.join(', ')}</Row>
            )}
            <Row icon={<ShieldCheck className="w-[15px] h-[15px]" strokeWidth={1.6} />} label="Certifications">
              {node.certifications.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {node.certifications.map((c, i) => (
                    <span key={i} className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--secondary)', color: c.status === 'valid' ? 'var(--accent-deep)' : c.status === 'expired' ? 'var(--danger)' : 'var(--warn)' }}>
                      {c.type}:{c.status}
                    </span>
                  ))}
                </div>
              ) : <span style={{ color: 'var(--danger)' }}>None on record</span>}
            </Row>

            {/* issues / recommended actions */}
            <div className="mt-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-2.5" style={{ color: 'var(--muted-foreground)' }}>Issues &amp; recommended actions</p>
              {risk.reasons.length === 0 ? (
                <div className="flex items-center gap-2 text-[12.5px]" style={{ color: 'var(--accent-deep)' }}>
                  <CheckCircle2 className="w-[15px] h-[15px]" strokeWidth={1.6} /> No issues at this node.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {risk.reasons.map((r, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <AlertTriangle className="w-[14px] h-[14px] mt-0.5 shrink-0" style={{ color: sevColor[r.severity] }} strokeWidth={1.6} />
                      <p className="text-[12.5px]" style={{ color: 'var(--text-body)' }}>{r.message}</p>
                    </div>
                  ))}
                  {risk.recommendedActions.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {risk.recommendedActions.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
                          <span className="mt-[6px] w-[5px] h-[5px] rounded-full shrink-0" style={{ background: 'var(--accent-deep)' }} />{a}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
