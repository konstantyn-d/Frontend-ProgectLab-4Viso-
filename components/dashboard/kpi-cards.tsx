'use client'

import { dashboardStats } from '@/lib/mock-data'

interface KPICardProps {
  title: string
  value: string | number
  delta?: string
  suffix?: string
}

function KPICard({ title, value, delta, suffix }: KPICardProps) {
  return (
    <div className="bg-[#111111] border border-[#222222] p-5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">
        {title}
      </p>
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-light text-[#F5F5F5]">{value}</span>
        {suffix && <span className="text-[13px] text-[#6B6B6B]">{suffix}</span>}
      </div>
      {delta && (
        <p className="text-[11px] text-[#3D3D3D] mt-2">{delta}</p>
      )}
    </div>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard
        title="Active Lanes"
        value={dashboardStats.activeLanes}
        delta={`+${dashboardStats.activeLanesTrend}% from last week`}
      />
      <KPICard
        title="GDP Compliant"
        value={dashboardStats.gdpCompliant}
        suffix="%"
        delta={`+${dashboardStats.gdpCompliantTrend}% from last week`}
      />
      <KPICard
        title="Temperature Deviations"
        value={dashboardStats.temperatureDeviations}
        delta="Active alerts"
      />
      <KPICard
        title="High Risk Lanes"
        value={dashboardStats.highRiskLanes}
        delta="Requires attention"
      />
    </div>
  )
}
