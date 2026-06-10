'use client'

import { weatherAlerts, type WeatherAlert } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { CloudRain, CloudFog, AlertTriangle, Users } from 'lucide-react'

const iconMap: Record<WeatherAlert['type'], React.ReactNode> = {
  storm: <CloudRain className="w-[15px] h-[15px]" strokeWidth={1.5} />,
  fog: <CloudFog className="w-[15px] h-[15px]" strokeWidth={1.5} />,
  congestion: <AlertTriangle className="w-[15px] h-[15px]" strokeWidth={1.5} />,
  strike: <Users className="w-[15px] h-[15px]" strokeWidth={1.5} />,
}

const severityConfig = {
  critical: {
    border: 'border-l-[var(--danger)]',
    iconBg: 'bg-[var(--danger-bg)]',
    iconText: 'text-[var(--danger)]',
    regionText: 'text-[var(--danger)]',
  },
  warning: {
    border: 'border-l-[var(--warn)]',
    iconBg: 'bg-[var(--warn-bg)]',
    iconText: 'text-[var(--warn)]',
    regionText: 'text-[var(--warn)]',
  },
  info: {
    border: 'border-l-[var(--info-c)]',
    iconBg: 'bg-[var(--info-bg)]',
    iconText: 'text-[var(--info-c)]',
    regionText: 'text-[var(--info-c)]',
  },
}

export function WeatherAlerts() {
  return (
    <div
      className="border border-border overflow-hidden"
      style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}
    >
      {/* Panel head */}
      <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
        <div>
          <h2
            className="text-[16px] leading-none tracking-[-0.02em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)' }}
          >
            Weather &amp; Route Alerts
          </h2>
        </div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.07em] px-2.5 py-1 rounded-full border"
          style={{ color: 'var(--muted-foreground)', background: 'var(--secondary)', borderColor: 'var(--border)' }}
        >
          {weatherAlerts.length} active
        </span>
      </div>

      {/* Alert list */}
      <div className="flex flex-col">
        {weatherAlerts.map((alert, idx) => {
          const cfg = severityConfig[alert.severity]
          return (
            <div
              key={alert.id}
              className={cn(
                'flex gap-[13px] px-[22px] py-[15px] border-l-[3px] transition-colors hover:bg-secondary',
                cfg.border,
                idx !== weatherAlerts.length - 1 && 'border-b'
              )}
              style={{ borderBottomColor: 'var(--line-soft)' }}
            >
              {/* Icon */}
              <div className={cn('w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shrink-0', cfg.iconBg, cfg.iconText)}>
                {iconMap[alert.type]}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className={cn('font-mono text-[10.5px] uppercase tracking-[0.08em]', cfg.regionText)}>
                    {alert.region}
                  </span>
                  <span className="font-mono text-[10px] shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {alert.affectedLanes.join(', ')}
                  </span>
                </div>
                <p className="text-[13px] leading-[1.45]" style={{ color: 'var(--text-body)' }}>{alert.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
