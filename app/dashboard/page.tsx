import { KPICards } from '@/components/dashboard/kpi-cards'
import { WorldMap } from '@/components/dashboard/world-map'
import { WeatherAlerts } from '@/components/dashboard/weather-alerts'
import { LaneTable } from '@/components/dashboard/lane-table'
import { LiveIndicator } from '@/components/dashboard/live-indicator'
import { NetworkStatus } from '@/components/dashboard/network-status'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <h1 className="text-[20px] font-medium text-foreground">Dashboard</h1>
          <p className="text-[14px] text-muted-foreground mt-1">
            Real-time overview of pharmaceutical transport lanes
          </p>
        </div>
        <LiveIndicator />
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Map + Weather Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Global Network Map</h2>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-px bg-[#10B981]" />
                Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-px bg-[#C97B1A]" />
                Warning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-px bg-[#E53E3E]" />
                High Risk
              </span>
            </div>
          </div>
          <div className="h-[440px]">
            <WorldMap />
          </div>
        </div>
        <WeatherAlerts />
      </div>

      {/* Network Status */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-4">Network Status by Corridor</h2>
        <NetworkStatus />
      </div>

      {/* Lane Table */}
      <div>
        <h2 className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-4">Active Transport Lanes</h2>
        <LaneTable />
      </div>
    </div>
  )
}
