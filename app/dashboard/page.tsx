import { KPICards } from '@/components/dashboard/kpi-cards'
import { NetworkStatus } from '@/components/dashboard/network-status'
import { LaneTable } from '@/components/dashboard/lane-table'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-[15px] font-medium text-[#F5F5F5]">Dashboard</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">
          Real-time overview of pharmaceutical transport lanes
        </p>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Network Status */}
      <div className="mt-8">
        <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Network Status</h2>
        <NetworkStatus />
      </div>

      {/* Lane Table */}
      <div className="mt-8">
        <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Active Transport Lanes</h2>
        <LaneTable />
      </div>
    </div>
  )
}
