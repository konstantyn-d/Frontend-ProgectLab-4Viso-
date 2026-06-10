'use client'

import { weatherAlerts, type WeatherAlert } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { CloudRain, CloudFog, AlertTriangle, Users } from 'lucide-react'

const iconMap: Record<WeatherAlert['type'], React.ReactNode> = {
  storm: <CloudRain className="w-3.5 h-3.5" strokeWidth={1.5} />,
  fog: <CloudFog className="w-3.5 h-3.5" strokeWidth={1.5} />,
  congestion: <AlertTriangle className="w-3.5 h-3.5" strokeWidth={1.5} />,
  strike: <Users className="w-3.5 h-3.5" strokeWidth={1.5} />,
}

const severityStyles = {
  critical: { border: 'border-l-[#E53E3E]', text: 'text-[#E53E3E]' },
  warning: { border: 'border-l-[#C97B1A]', text: 'text-[#C97B1A]' },
  info: { border: 'border-l-[#3B82F6]', text: 'text-[#3B82F6]' },
}

export function WeatherAlerts() {
  return (
    <div className="bg-card border border-border">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Weather & Route Alerts</h2>
        <span className="text-[10px] text-[var(--text-muted)]">{weatherAlerts.length} active</span>
      </div>
      <div className="divide-y divide-border">
        {weatherAlerts.map(alert => {
          const style = severityStyles[alert.severity]
          return (
            <div
              key={alert.id}
              className={cn('flex gap-3 px-4 py-3 border-l-2 hover:bg-[rgba(16,185,129,0.03)]', style.border)}
            >
              <div className={cn('mt-0.5', style.text)}>{iconMap[alert.type]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <span className={cn('text-[10px] uppercase tracking-[0.08em]', style.text)}>
                    {alert.region}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {alert.affectedLanes.join(', ')}
                  </span>
                </div>
                <p className="text-[12px] text-[var(--text-body)] leading-snug">{alert.message}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
