'use client'

import { useState } from 'react'
import { mockAudits, regionCompliance, complianceTrend, type Audit } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
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
  passed: { label: 'PASSED', icon: <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.5} />, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  warnings: { label: 'WARNINGS', icon: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />, color: '#C97B1A', bg: 'rgba(201,123,26,0.1)' },
  failed: { label: 'FAILED', icon: <XCircle className="w-3.5 h-3.5" strokeWidth={1.5} />, color: '#E53E3E', bg: 'rgba(229,62,62,0.1)' },
  'in-progress': { label: 'IN PROGRESS', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
}

export default function CompliancePage() {
  const [expanded, setExpanded] = useState<string | null>(null)

  const metrics = [
    { label: 'GDP Compliance Rate', value: '94.2', suffix: '%', delta: '+1.8%', deltaColor: '#10B981' },
    { label: 'Audits Completed', value: '48', delta: 'This month', deltaColor: '#6B6B6B' },
    { label: 'Open Issues', value: '3', delta: '-2 from last week', deltaColor: '#10B981' },
    { label: 'Pass Rate (90d)', value: '92', suffix: '%', delta: '+0.4%', deltaColor: '#10B981' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[20px] font-medium text-[#F5F5F5]">Compliance</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-1">
          Monitor GDP compliance and regulatory requirements
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-[#111111] border border-[#222222] p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">{metric.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-light text-[#F5F5F5] leading-none">{metric.value}</span>
              {metric.suffix && <span className="text-[14px] text-[#6B6B6B]">{metric.suffix}</span>}
            </div>
            <p className="text-[12px] mt-2" style={{ color: metric.deltaColor }}>{metric.delta}</p>
          </div>
        ))}
      </div>

      {/* Compliance trend - 12 weeks */}
      <div className="bg-[#111111] border border-[#222222]">
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center justify-between">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Compliance Trend</h2>
            <p className="text-[12px] text-[#3D3D3D] mt-1">12-week rolling window</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[24px] font-light text-[#10B981]">94.2%</span>
            <span className="text-[11px] text-[#10B981]">+3.0 pts</span>
          </div>
        </div>
        <div className="h-[220px] px-4 py-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={complianceTrend}>
              <defs>
                <linearGradient id="cmpGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" vertical={false} />
              <XAxis dataKey="week" stroke="#3D3D3D" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={{ stroke: '#222222' }} tickLine={false} />
              <YAxis domain={[88, 96]} stroke="#3D3D3D" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0A0A0A', border: '1px solid #222222', fontSize: 12 }} labelStyle={{ color: '#6B6B6B' }} />
              <Area type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={1.5} fill="url(#cmpGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance by Region */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Compliance by Region</h2>
            <p className="text-[12px] text-[#3D3D3D] mt-1">Distribution of lane compliance levels</p>
          </div>
          <div className="h-[320px] px-4 py-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionCompliance} layout="vertical" barCategoryGap={8}>
                <CartesianGrid strokeDasharray="2 2" stroke="#1A1A1A" horizontal={false} />
                <XAxis type="number" stroke="#3D3D3D" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={{ stroke: '#222222' }} tickLine={false} />
                <YAxis dataKey="region" type="category" stroke="#3D3D3D" tick={{ fontSize: 11, fill: '#A0A0A0' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ background: '#0A0A0A', border: '1px solid #222222', fontSize: 12 }} labelStyle={{ color: '#6B6B6B' }} cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" />
                <Bar dataKey="compliant" name="Compliant" stackId="a" fill="#10B981" />
                <Bar dataKey="warning" name="Warning" stackId="a" fill="#C97B1A" />
                <Bar dataKey="deviation" name="Deviation" stackId="a" fill="#E53E3E" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audits Timeline */}
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Recent Audits</h2>
            <p className="text-[12px] text-[#3D3D3D] mt-1">Last {mockAudits.length} audits</p>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {mockAudits.map((audit, idx) => {
              const config = statusConfig[audit.status]
              const isExpanded = expanded === audit.id
              return (
                <div key={audit.id} className={cn('relative', idx !== mockAudits.length - 1 && 'border-b border-[#1A1A1A]')}>
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
                        <p className="text-[13px] text-[#F5F5F5] font-medium">{audit.title}</p>
                        <span className="text-[10px] text-[#6B6B6B] shrink-0 font-mono">{audit.id}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#6B6B6B] mb-1">
                        <span>{audit.auditor}</span>
                        <span className="text-[#3D3D3D]">·</span>
                        <span>{new Date(audit.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[#3D3D3D]">·</span>
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
                          <span className="text-[10px] text-[#6B6B6B]">{audit.findings} finding{audit.findings !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0 mt-1" strokeWidth={1.5} />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-[#6B6B6B] shrink-0 mt-1" strokeWidth={1.5} />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 pl-[60px] space-y-2 text-[12px] text-[#A0A0A0]">
                      <div className="flex justify-between py-1 border-t border-[#1A1A1A] pt-3">
                        <span className="text-[#6B6B6B]">Scope</span>
                        <span>{audit.scope}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#6B6B6B]">Region</span>
                        <span>{audit.region}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-[#6B6B6B]">Date</span>
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
