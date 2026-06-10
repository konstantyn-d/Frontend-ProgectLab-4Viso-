'use client'

import { Activity, Thermometer, ShieldCheck, Clock, Package, Bell } from 'lucide-react'
import type { Lane } from '@/lib/mock-data'
import type { RiskAssessment } from '@/lib/services/riskEngine'

const levelColor = (level: string) =>
  level === 'critical' || level === 'high' ? 'var(--danger)' : level === 'medium' ? 'var(--warn)' : 'var(--accent-deep)'

function Tile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="flex-1 min-w-[150px]">
      <div className="flex items-center gap-1.5 mb-1.5 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: 'var(--muted-foreground)' }}>
        {icon}{label}
      </div>
      <div className="text-[15px]" style={{ color: color ?? 'var(--foreground)', fontWeight: 600 }}>{value}</div>
    </div>
  )
}

export function LaneHealthPanel({
  lane, risk, openAlerts, shipmentCount,
}: { lane: Lane; risk: RiskAssessment; openAlerts: number; shipmentCount: number }) {
  const mainIssue = risk.reasons[0]?.message ?? 'No active risk factors'
  const compliance = lane.gdpCompliant ? 'Compliant' : 'Non-compliant'

  return (
    <section
      className="border overflow-hidden"
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--r-lg)',
        boxShadow: 'var(--shadow-1)',
        borderColor: risk.level === 'low' ? 'var(--border)' : levelColor(risk.level),
      }}
    >
      <div className="flex items-center justify-between gap-4 px-[22px] py-[16px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
        <div className="flex items-center gap-2.5">
          <Activity className="w-[18px] h-[18px]" style={{ color: levelColor(risk.level) }} strokeWidth={1.6} />
          <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>
            Lane Health
          </h2>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.07em] px-2.5 py-1 rounded-full"
            style={{ color: levelColor(risk.level), background: risk.level === 'low' ? 'var(--accent-wash)' : risk.level === 'medium' ? 'var(--warn-bg)' : 'var(--danger-bg)' }}
          >
            {risk.level} risk
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: levelColor(risk.level) }}>{risk.score}</span>
          <span className="text-[13px]" style={{ color: 'var(--muted-foreground)' }}>/ 100</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-y-5 gap-x-6 px-[22px] py-[18px]">
        <Tile icon={<Thermometer className="w-[12px] h-[12px]" strokeWidth={1.6} />} label="Main issue" value={mainIssue} color={risk.reasons.length ? levelColor(risk.level) : 'var(--accent-deep)'} />
        <Tile icon={<ShieldCheck className="w-[12px] h-[12px]" strokeWidth={1.6} />} label="Compliance" value={compliance} color={lane.gdpCompliant ? 'var(--accent-deep)' : 'var(--danger)'} />
        <Tile icon={<Package className="w-[12px] h-[12px]" strokeWidth={1.6} />} label="Shipments" value={String(shipmentCount)} />
        <Tile icon={<Bell className="w-[12px] h-[12px]" strokeWidth={1.6} />} label="Active alerts" value={String(openAlerts)} color={openAlerts > 0 ? 'var(--danger)' : 'var(--accent-deep)'} />
        <Tile icon={<Clock className="w-[12px] h-[12px]" strokeWidth={1.6} />} label="Last update" value={new Date(lane.lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} />
      </div>
    </section>
  )
}
