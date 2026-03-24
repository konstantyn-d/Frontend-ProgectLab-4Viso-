import { LaneTable } from '@/components/dashboard/lane-table'

export default function LanesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[15px] font-medium text-[#F5F5F5]">Transport Lanes</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">
          Manage and monitor all pharmaceutical transport lanes
        </p>
      </div>

      <LaneTable />
    </div>
  )
}
