'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ResponsiveGridLayout,
  verticalCompactor,
  type Layout,
  type ResponsiveLayouts,
  type ResizeHandleAxis,
} from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import { Route, ShieldCheck, Thermometer, AlertTriangle } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getLanes } from '@/lib/services/lanesService'
import { sparklines } from '@/lib/mock-data'
import { KPICard } from '@/components/dashboard/kpi-cards'
import { WorldMap } from '@/components/dashboard/world-map'
import { WeatherAlerts } from '@/components/dashboard/weather-alerts'
import { NetworkStatus } from '@/components/dashboard/network-status'
import { LaneTable } from '@/components/dashboard/lane-table'
import { DashboardWidgetShell } from './DashboardWidgetShell'
import {
  DASHBOARD_WIDGETS, GRID_COLS, GRID_BREAKPOINTS, GRID_ROW_HEIGHT, GRID_MARGIN,
  type DashboardWidgetId,
} from '@/lib/config/defaultDashboardLayout'

const panel: React.CSSProperties = { background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }
const fillKpi = 'h-full [&>*]:h-full'
const RESIZE_HANDLES: ResizeHandleAxis[] = ['se']

/** Measure container width (react-grid-layout v2 needs an explicit width). */
function useMeasuredWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

function MapWidget() {
  return (
    <div className="h-full flex flex-col border border-border overflow-hidden" style={panel}>
      <div className="flex items-center justify-between gap-4 px-[22px] py-[16px] border-b shrink-0" style={{ borderColor: 'var(--line-soft)' }}>
        <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>Global Network Map</h2>
        <div className="hidden sm:flex items-center gap-3 text-[11px]" style={{ color: 'var(--muted-foreground)' }}>
          <span className="flex items-center gap-[6px]"><span className="w-[12px] h-[2.5px] rounded-sm" style={{ background: 'var(--primary)' }} />On track</span>
          <span className="flex items-center gap-[6px]"><span className="w-[12px] h-[2.5px] rounded-sm" style={{ background: 'var(--warn)' }} />Delayed</span>
          <span className="flex items-center gap-[6px]"><span className="w-[12px] h-[2.5px] rounded-sm" style={{ background: 'var(--danger)' }} />Critical</span>
        </div>
      </div>
      <div className="flex-1 min-h-0"><WorldMap /></div>
    </div>
  )
}

export function DashboardGrid({
  layouts, isEditMode, onLayoutChange,
}: {
  layouts: ResponsiveLayouts
  isEditMode: boolean
  onLayoutChange: (current: Layout, all: ResponsiveLayouts) => void
}) {
  const { ref, width } = useMeasuredWidth()
  const { data: lanes } = useQuery(getLanes, [])

  const content = useMemo<Record<DashboardWidgetId, React.ReactNode>>(() => {
    const all = lanes ?? []
    const total = all.length
    const activeLanes = all.filter(l => l.status !== 'arrived').length
    const compliant = all.filter(l => l.gdpCompliant).length
    const gdpRate = total ? Math.round((compliant / total) * 1000) / 10 : 0
    const tempDeviations = all.filter(l => l.tempDeviation).length
    const highRisk = all.filter(l => l.riskScore > 60).length

    return {
      active_lanes: <div className={fillKpi}><KPICard icon={<Route className="w-[17px] h-[17px]" strokeWidth={1.6} />} title="Active Lanes" value={activeLanes} trendLabel={`of ${total} total`} sparkData={sparklines.activeLanes} /></div>,
      gdp_compliance: <div className={fillKpi}><KPICard icon={<ShieldCheck className="w-[17px] h-[17px]" strokeWidth={1.6} />} title="GDP Compliant" value={gdpRate} suffix="%" trendLabel={`${compliant} of ${total} lanes`} sparkData={sparklines.gdpCompliant} /></div>,
      temp_deviations: <div className={fillKpi}><KPICard icon={<Thermometer className="w-[17px] h-[17px]" strokeWidth={1.6} />} iconVariant="danger" title="Temp Deviations" value={tempDeviations} trendLabel={tempDeviations ? 'Active deviations' : 'All within range'} sparkData={sparklines.tempDeviations} /></div>,
      high_risk_lanes: <div className={fillKpi}><KPICard icon={<AlertTriangle className="w-[17px] h-[17px]" strokeWidth={1.6} />} iconVariant="warn" title="High Risk Lanes" value={highRisk} trendLabel="Requires attention" sparkData={sparklines.highRiskLanes} /></div>,
      global_network_map: <MapWidget />,
      weather_route_alerts: <div className="h-full overflow-auto"><WeatherAlerts /></div>,
      corridor_status_table: <div className="h-full overflow-auto"><NetworkStatus /></div>,
      lanes_table: <div className="h-full overflow-auto"><LaneTable /></div>,
    }
  }, [lanes])

  return (
    <div ref={ref} className="w-full">
      {width > 0 && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          rowHeight={GRID_ROW_HEIGHT}
          margin={GRID_MARGIN}
          compactor={verticalCompactor}
          dragConfig={{ enabled: isEditMode, handle: '.widget-drag-handle', threshold: 4 }}
          resizeConfig={{ enabled: isEditMode, handles: RESIZE_HANDLES }}
          onLayoutChange={onLayoutChange}
        >
          {DASHBOARD_WIDGETS.map(w => (
            <div key={w.id}>
              <DashboardWidgetShell title={w.title} isEditMode={isEditMode}>
                {content[w.id]}
              </DashboardWidgetShell>
            </div>
          ))}
        </ResponsiveGridLayout>
      )}
    </div>
  )
}
