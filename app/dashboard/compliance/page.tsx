export default function CompliancePage() {
  const metrics = [
    { label: 'GDP Compliance Rate', value: '94.2', suffix: '%', delta: '+1.8% from last week' },
    { label: 'Audits Completed', value: '48', delta: 'This month' },
    { label: 'Open Issues', value: '3', delta: '-2 from last week' },
    { label: 'Trend', value: 'Improving', delta: '12 week average' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[15px] font-medium text-[#F5F5F5]">Compliance</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">
          Monitor GDP compliance and regulatory requirements
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-[#111111] border border-[#222222] p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">
              {metric.label}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-[28px] font-light text-[#F5F5F5]">{metric.value}</span>
              {metric.suffix && <span className="text-[13px] text-[#6B6B6B]">{metric.suffix}</span>}
            </div>
            <p className="text-[11px] text-[#3D3D3D] mt-2">{metric.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Compliance by Region</h2>
          </div>
          <div className="h-[300px] flex items-center justify-center text-[13px] text-[#3D3D3D]">
            Regional compliance chart coming soon
          </div>
        </div>

        <div className="bg-[#111111] border border-[#222222]">
          <div className="px-4 py-3 border-b border-[#1A1A1A]">
            <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Recent Audits</h2>
          </div>
          <div className="h-[300px] flex items-center justify-center text-[13px] text-[#3D3D3D]">
            Audit timeline coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
