'use client'

import { sparklines } from '@/lib/mock-data'
import { TrendingUp, TrendingDown, Minus, Route, ShieldCheck, Thermometer, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLanes } from '@/lib/services/lanesService'

/* Minimal SVG sparkline — no chart library overhead */
function Sparkline({ data, color = 'var(--primary)' }: { data: number[]; color?: string }) {
  const W = 92, H = 40, pad = 3
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = pad + (1 - (v - min) / span) * (H - pad * 2)
    return [x, y]
  })
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`
  const gid = `sg${Math.round((min + max + data.length) * 97) % 99999}`
  const last = pts[pts.length - 1]

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.2" fill={color} />
    </svg>
  )
}

interface KPICardProps {
  icon: React.ReactNode
  iconVariant?: 'accent' | 'warn' | 'danger'
  title: string
  value: string | number
  suffix?: string
  trend?: number
  trendLabel?: string
  sparkData: number[]
  sparkColor?: string
  invertTrend?: boolean
}

export function KPICard({ icon, iconVariant = 'accent', title, value, suffix, trend, trendLabel, sparkData, sparkColor, invertTrend }: KPICardProps) {
  const isPositive = trend !== undefined ? (invertTrend ? trend < 0 : trend > 0) : false
  const isNegative = trend !== undefined ? (invertTrend ? trend > 0 : trend < 0) : false
  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus

  const iconBg = {
    accent: 'var(--accent-wash)',
    warn: 'var(--warn-bg)',
    danger: 'var(--danger-bg)',
  }[iconVariant]

  const iconColor = {
    accent: 'var(--accent-deep)',
    warn: 'var(--warn)',
    danger: 'var(--danger)',
  }[iconVariant]

  const spark = sparkColor ?? (iconVariant === 'accent' ? 'var(--primary)' : iconVariant === 'warn' ? 'var(--warn)' : 'var(--danger)')

  return (
    <div
      className="relative overflow-hidden border border-border transition-all duration-300 hover:-translate-y-1 group"
      style={{
        background: 'var(--card)',
        borderRadius: 'var(--r-lg)',
        padding: 24,
        boxShadow: 'var(--shadow-1)',
      }}
    >
      {/* Hover blob */}
      <div
        className="absolute right-[-40px] bottom-[-50px] w-[150px] h-[150px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: spark, filter: 'blur(46px)' }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between mb-[18px] relative">
        <p
          className="font-mono text-[10.5px] uppercase tracking-[0.12em]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          {title}
        </p>
        <div
          className="w-[34px] h-[34px] flex items-center justify-center rounded-[10px]"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>

      {/* Value row */}
      <div className="flex items-end justify-between gap-3 relative">
        <div>
          <div
            className="flex items-baseline gap-1 leading-none"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.04em' }}
          >
            <span className="text-[52px] text-foreground">{value}</span>
            {suffix && <span className="text-[22px]" style={{ color: 'var(--muted-foreground)' }}>{suffix}</span>}
          </div>

          {trend !== undefined && TrendIcon ? (
            <div className={cn('flex items-center gap-1.5 mt-[14px] text-[12.5px] font-medium', isPositive ? 'text-[var(--accent-deep)]' : isNegative ? 'text-[var(--danger)]' : 'text-muted-foreground')}>
              <TrendIcon className="w-[14px] h-[14px]" strokeWidth={1.5} />
              <span className="font-[var(--font-mono)]">{Math.abs(trend).toFixed(1)}%</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{trendLabel}</span>
            </div>
          ) : trendLabel ? (
            <p className="text-[12.5px] mt-[14px]" style={{ color: 'var(--muted-foreground)' }}>{trendLabel}</p>
          ) : null}
        </div>

        <div className="w-[92px] h-[40px] shrink-0">
          <Sparkline data={sparkData} color={spark} />
        </div>
      </div>
    </div>
  )
}

function KPISkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px]">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="border border-border shimmer" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', height: 146, boxShadow: 'var(--shadow-1)' }} />
      ))}
    </div>
  )
}

export function KPICards() {
  const { data: lanes, loading, error } = useQuery(getLanes, [])

  if (loading) return <KPISkeleton />
  if (error || !lanes) {
    return (
      <div className="border border-border p-5 text-[13px]" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', color: 'var(--danger)' }}>
        Could not load lane metrics{error ? `: ${error}` : ''}.
      </div>
    )
  }

  const total = lanes.length
  const activeLanes = lanes.filter(l => l.status !== 'arrived').length
  const compliant = lanes.filter(l => l.gdpCompliant).length
  const gdpRate = total ? Math.round((compliant / total) * 1000) / 10 : 0
  const tempDeviations = lanes.filter(l => l.tempDeviation).length
  const highRisk = lanes.filter(l => l.riskScore > 60).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[18px] reveal-stagger">
      <KPICard
        icon={<Route className="w-[17px] h-[17px]" strokeWidth={1.6} />}
        title="Active Lanes"
        value={activeLanes}
        trendLabel={`of ${total} total`}
        sparkData={sparklines.activeLanes}
      />
      <KPICard
        icon={<ShieldCheck className="w-[17px] h-[17px]" strokeWidth={1.6} />}
        title="GDP Compliant"
        value={gdpRate}
        suffix="%"
        trendLabel={`${compliant} of ${total} lanes`}
        sparkData={sparklines.gdpCompliant}
      />
      <KPICard
        icon={<Thermometer className="w-[17px] h-[17px]" strokeWidth={1.6} />}
        iconVariant="danger"
        title="Temp Deviations"
        value={tempDeviations}
        trendLabel={tempDeviations ? 'Active deviations' : 'All within range'}
        sparkData={sparklines.tempDeviations}
      />
      <KPICard
        icon={<AlertTriangle className="w-[17px] h-[17px]" strokeWidth={1.6} />}
        iconVariant="warn"
        title="High Risk Lanes"
        value={highRisk}
        trendLabel="Requires attention"
        sparkData={sparklines.highRiskLanes}
      />
    </div>
  )
}
