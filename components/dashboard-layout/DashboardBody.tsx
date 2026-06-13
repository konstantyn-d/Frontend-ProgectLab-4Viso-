'use client'

import { KPICards } from '@/components/dashboard/kpi-cards'
import { WorldMap } from '@/components/dashboard/world-map'
import { WeatherAlerts } from '@/components/dashboard/weather-alerts'
import { LaneTable } from '@/components/dashboard/lane-table'
import { LiveIndicator } from '@/components/dashboard/live-indicator'
import { NetworkStatus } from '@/components/dashboard/network-status'
import { DashboardGrid } from './DashboardGrid'
import { DashboardLayoutToolbar } from './DashboardLayoutToolbar'
import { useDashboardLayout } from '@/lib/hooks/useDashboardLayout'
import { ENABLE_DASHBOARD_LAYOUT_EDITOR } from '@/lib/feature-flags'

function PanelHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-[22px] py-[18px] border-b" style={{ borderColor: 'var(--line-soft)' }}>
      <div>
        <h2 className="text-[16px] leading-none tracking-[-0.02em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--foreground)', margin: 0 }}>{title}</h2>
        {sub && <p className="text-[12.5px] mt-[3px]" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      </div>
      {right}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: 'var(--muted-foreground)' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
    </div>
  )
}

function PageHeader({ right }: { right?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 flex-wrap mb-[30px]">
      <div>
        <h1 className="leading-none tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}>Dashboard</h1>
        <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)', maxWidth: 540 }}>Real-time overview of pharmaceutical transport lanes and cold-chain integrity.</p>
      </div>
      <div className="flex items-center gap-3 flex-wrap">{right}</div>
    </div>
  )
}

/** Original premium static layout — used when the editor is disabled. */
function StaticDashboard() {
  return (
    <div className="space-y-[18px]">
      <PageHeader right={<LiveIndicator />} />
      <KPICards />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[18px]">
        <div className="lg:col-span-2 border border-border overflow-hidden" style={{ background: 'var(--card)', borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-1)' }}>
          <PanelHead title="Global Network Map" sub="Live cold-chain routes" />
          <div className="h-[440px]"><WorldMap /></div>
        </div>
        <WeatherAlerts />
      </div>
      <div><SectionLabel>Network Status by Corridor</SectionLabel><NetworkStatus /></div>
      <div><SectionLabel>Active Transport Lanes</SectionLabel><LaneTable /></div>
    </div>
  )
}

export function DashboardBody() {
  const { layouts, isEditMode, saving, enterEdit, cancelEdit, onLayoutChange, save, resetToDefault } = useDashboardLayout()

  if (!ENABLE_DASHBOARD_LAYOUT_EDITOR) return <StaticDashboard />

  return (
    <div className="space-y-[14px]">
      <PageHeader
        right={
          <>
            {!isEditMode && <LiveIndicator />}
            <DashboardLayoutToolbar
              isEditMode={isEditMode}
              saving={saving}
              onEdit={enterEdit}
              onSave={save}
              onCancel={cancelEdit}
              onReset={resetToDefault}
            />
          </>
        }
      />
      {isEditMode && (
        <p className="text-[12px] -mt-2 mb-1" style={{ color: 'var(--muted-foreground)' }}>
          Drag the handle on each widget to move it, or drag a corner to resize. Changes are saved only when you click <b style={{ color: 'var(--foreground)' }}>Save Layout</b>.
        </p>
      )}
      <DashboardGrid layouts={layouts} isEditMode={isEditMode} onLayoutChange={onLayoutChange} />
    </div>
  )
}
