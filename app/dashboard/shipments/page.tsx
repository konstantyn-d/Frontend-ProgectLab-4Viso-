export default function ShipmentsPage() {
  const stats = [
    { label: 'Active Shipments', value: '156' },
    { label: 'In Transit', value: '89' },
    { label: 'Delivered Today', value: '23' },
    { label: 'Delayed', value: '4' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[15px] font-medium text-[#F5F5F5]">Shipments</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">
          Track individual shipments across all transport lanes
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111111] border border-[#222222] p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">
              {stat.label}
            </p>
            <div className="text-[28px] font-light text-[#F5F5F5]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#222222]">
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Shipment Tracking</h2>
        </div>
        <div className="h-[400px] flex items-center justify-center text-[13px] text-[#3D3D3D]">
          Shipment tracking details coming soon
        </div>
      </div>
    </div>
  )
}
