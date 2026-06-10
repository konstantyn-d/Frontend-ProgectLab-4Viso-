import { KPICards } from '@/components/dashboard/kpi-cards'
import { WorldMap } from '@/components/dashboard/world-map'
import { WeatherAlerts } from '@/components/dashboard/weather-alerts'
import { LaneTable } from '@/components/dashboard/lane-table'
import { LiveIndicator } from '@/components/dashboard/live-indicator'
import { NetworkStatus } from '@/components/dashboard/network-status'

function PanelHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
      <div>
        <h2
          className="text-[16px] leading-none tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}
        >
          {title}
        </h2>
        {sub && <p className="text-[12.5px] mt-[3px]" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: 'var(--muted-foreground)' }}>
        {children}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-[18px]">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-[30px]">
        <div>
          <h1
            className="leading-none tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}
          >
            Dashboard
          </h1>
          <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)', maxWidth: 540 }}>
            Real-time overview of pharmaceutical transport lanes and cold-chain integrity.
          </p>
        </div>
        <LiveIndicator />
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Map + Weather Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px]">
        {/* World Map */}
        <div
          className="lg:col-span-2 border border-border overflow-hidden"
          style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}
        >
          <PanelHead
            title="Global Network Map"
            sub={`Live cold-chain routes`}
            right={
              <div className="hidden sm:flex items-center gap-4 text-[11.5px]" style={{ color: 'var(--muted-foreground)' }}>
                <span className="flex items-center gap-[7px]">
                  <span className="w-[14px] h-[2.5px] rounded-sm" style={{ background: 'var(--primary)' }} />
                  On track
                </span>
                <span className="flex items-center gap-[7px]">
                  <span className="w-[14px] h-[2.5px] rounded-sm" style={{ background: 'var(--warn)' }} />
                  Delayed
                </span>
                <span className="flex items-center gap-[7px]">
                  <span className="w-[14px] h-[2.5px] rounded-sm" style={{ background: 'var(--danger)' }} />
                  Critical
                </span>
              </div>
            }
          />
          <div className="h-[440px]">
            <WorldMap />
          </div>
        </div>

        <WeatherAlerts />
      </div>

      {/* Network Status */}
      <div>
        <SectionLabel>Network Status by Corridor</SectionLabel>
        <NetworkStatus />
      </div>

      {/* Lane Table */}
      <div>
        <SectionLabel>Active Transport Lanes</SectionLabel>
        <LaneTable />
      </div>
    </div>
  )
}
