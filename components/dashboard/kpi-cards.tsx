'use client'

import { dashboardStats, sparklines } from '@/lib/mock-data'
import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  suffix?: string
  trend?: number
  trendLabel?: string
  sparkData: number[]
  sparkColor: string
  invertTrend?: boolean
}

function KPICard({ title, value, suffix, trend, trendLabel, sparkData, sparkColor, invertTrend }: KPICardProps) {
  const isPositive = trend !== undefined ? (invertTrend ? trend < 0 : trend > 0) : false
  const isNegative = trend !== undefined ? (invertTrend ? trend > 0 : trend < 0) : false
  const trendColor = isPositive ? 'text-[#10B981]' : isNegative ? 'text-[#E53E3E]' : 'text-muted-foreground'
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  const chartData = sparkData.map((v, i) => ({ i, v }))

  return (
    <div className="bg-card border border-border p-5 hover:border-[var(--border-hover)] transition-colors">
      <p className="text-[12px] uppercase tracking-[0.08em] text-muted-foreground mb-3">{title}</p>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[32px] font-light text-foreground leading-none">{value}</span>
            {suffix && <span className="text-[14px] text-muted-foreground">{suffix}</span>}
          </div>
          {trend !== undefined && TrendIcon && (
            <div className={cn('flex items-center gap-1 mt-2 text-[12px]', trendColor)}>
              <TrendIcon className="w-3 h-3" strokeWidth={1.5} />
              <span>{Math.abs(trend).toFixed(1)}%</span>
              <span className="text-[var(--text-muted)]">{trendLabel}</span>
            </div>
          )}
          {trend === undefined && trendLabel && (
            <p className="text-[12px] text-[var(--text-muted)] mt-2">{trendLabel}</p>
          )}
        </div>

        <div className="w-[88px] h-[36px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={sparkColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function KPICards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Active Lanes"
        value={dashboardStats.activeLanes}
        trend={dashboardStats.activeLanesTrend}
        trendLabel="vs last week"
        sparkData={sparklines.activeLanes}
        sparkColor="#10B981"
      />
      <KPICard
        title="GDP Compliant"
        value={dashboardStats.gdpCompliant}
        suffix="%"
        trend={dashboardStats.gdpCompliantTrend}
        trendLabel="vs last week"
        sparkData={sparklines.gdpCompliant}
        sparkColor="#10B981"
      />
      <KPICard
        title="Temperature Deviations"
        value={dashboardStats.temperatureDeviations}
        trend={dashboardStats.temperatureDeviationsTrend}
        trendLabel="vs last week"
        sparkData={sparklines.tempDeviations}
        sparkColor="#E53E3E"
        invertTrend
      />
      <KPICard
        title="High Risk Lanes"
        value={dashboardStats.highRiskLanes}
        trendLabel="Requires attention"
        sparkData={sparklines.highRiskLanes}
        sparkColor="#C97B1A"
      />
    </div>
  )
}
