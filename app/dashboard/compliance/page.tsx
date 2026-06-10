'use client'

import { useState } from 'react'
import { mockAudits, regionCompliance, complianceTrend, type Audit } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useQuery } from '@/lib/hooks/useQuery'
import { getComplianceSummary } from '@/lib/services/complianceService'
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
  Legend,
} from 'recharts'
import { CheckCircle2, AlertTriangle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react'

const statusConfig: Record<Audit['status'], {
  label: string
  icon: React.ReactNode
  color: string
  bg: string
}> = {
  passed: { label: 'PASSED', icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />, color: 'var(--primary)', bg: 'rgba(16,185,129,0.1)' },
  warnings: { label: 'WARNINGS', icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />, color: 'var(--warn)', bg: 'rgba(201,123,26,0.1)' },
  failed: { label: 'FAILED', icon: <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />, color: 'var(--danger)', bg: 'rgba(229,62,62,0.1)' },
  'in-progress': { label: 'IN PROGRESS', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />, color: 'var(--info-c)', bg: 'rgba(59,130,246,0.1)' },
}

export default function CompliancePage() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const { data: summary } = useQuery(getComplianceSummary, [])

  const metrics = [
    { label: 'GDP Compliance Rate', value: summary ? String(summary.gdpComplianceRate) : '—', suffix: '%', delta: 'Across active lanes', deltaColor: 'var(--primary)' },
    { label: 'Audits Completed', value: summary ? String(summary.auditsCompleted) : '—', delta: 'Logged events', deltaColor: 'var(--muted-foreground)' },
    { label: 'Open Issues', value: summary ? String(summary.openIssues) : '—', delta: summary && summary.openIssues > 0 ? 'Require attention' : 'All clear', deltaColor: summary && summary.openIssues > 0 ? 'var(--warn)' : 'var(--primary)' },
    { label: 'Pass Rate', value: summary ? String(summary.passRate) : '—', suffix: '%', delta: 'Low-risk & compliant', deltaColor: 'var(--primary)' },
  ]

  return (
    <div className="space-y-8">
      <div className="mb-[30px]">
        <h1 className="leading-none tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}>Compliance</h1>
        <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)' }}>
          Monitor GDP compliance and regulatory requirements.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-card border border-border rounded-[var(--r-lg)] shadow-[var(--shadow-1)] p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-3">{metric.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-light text-foreground leading-none">{metric.value}</span>
              {metric.suffix && <span className="text-[14px] text-muted-foreground">{metric.suffix}</span>}
            </div>
            <p className="text-[12px] mt-2" style={{ color: metric.deltaColor }}>{metric.delta}</p>
          </div>
        ))}
      </div>

      {/* Compliance trend - 12 weeks */}
      <div className="border border-border overflow-hidden" style={{ background: "var(--card)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-1)" }}>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Compliance Trend</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">12-week rolling window</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-light text-[var(--primary)]">94.2%</span>
            <span className="text-[11px] text-[var(--primary)]">+3.0 pts</span>
          </div>
        </div>
        <div className="h-[220px] px-4 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={complianceTrend}>
              <defs>
                <linearGradient id="cmpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
              <YAxis domain={[88, 96]} stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', fontSize: 12 }} labelStyle={{ color: 'var(--muted-foreground)' }} />
              <Area type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={1.5} fill="url(#cmpGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance by Region */}
        <div className="border border-border overflow-hidden" style={{ background: "var(--card)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-1)" }}>
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Compliance by Region</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">Distribution of lane compliance levels</p>
          </div>
          <div className="h-[320px] px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionCompliance} layout="vertical" barCategoryGap={8}>
                <CartesianGrid strokeDasharray="2 2" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                <YAxis dataKey="region" type="category" stroke="var(--text-muted)" tick={{ fontSize: 11, fill: 'var(--text-body)' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', fontSize: 12 }} labelStyle={{ color: 'var(--muted-foreground)' }} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" />
                <Bar dataKey="compliant" name="Compliant" stackId="a" fill="var(--primary)" />
                <Bar dataKey="warning" name="Warning" stackId="a" fill="var(--warn)" />
                <Bar dataKey="deviation" name="Deviation" stackId="a" fill="var(--danger)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audits Timeline */}
        <div className="border border-border overflow-hidden" style={{ background: "var(--card)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-1)" }}>
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Recent Audits</h2>
            <p className="text-[12px] text-[var(--text-muted)] mt-1">Last {mockAudits.length} audits</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {mockAudits.map((audit, idx) => {
              const config = statusConfig[audit.status]
              const isExpanded = expanded === audit.id
              return (
                <div key={audit.id} className={cn('relative', idx !== mockAudits.length - 1 && 'border-b border-border')}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : audit.id)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[rgba(16,185,129,0.03)] text-left"
                  >
                    {/* Auditor avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium shrink-0"
                      style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}40` }}
                    >
                      {audit.auditorInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-[13px] text-foreground font-medium">{audit.title}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">{audit.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-1">
                        <span>{audit.auditor}</span>
                        <span className="text-[var(--text-muted)]">·</span>
                        <span>{new Date(audit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[var(--text-muted)]">·</span>
                        <span>{audit.region}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm font-medium"
                          style={{ color: config.color, border: `1px solid ${config.color}` }}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                        {audit.findings > 0 && (
                          <span className="text-[10px] text-muted-foreground">{audit.findings} finding{audit.findings !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" strokeWidth={1.5} />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-[60px] space-y-2 text-[12px] text-[var(--text-body)]">
                      <div className="flex justify-between py-1 border-t border-border pt-3">
                        <span className="text-muted-foreground">Scope</span>
                        <span>{audit.scope}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Region</span>
                        <span>{audit.region}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-muted-foreground">Date</span>
                        <span>{new Date(audit.date).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

