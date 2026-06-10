import { LaneTable } from '@/components/dashboard/lane-table'
import { LaneStats } from '@/components/dashboard/lane-stats'

export default function LanesPage() {
  return (
    <div className="space-y-[18px]">
      <div className="flex items-start justify-between gap-6 flex-wrap mb-[30px]">
        <div>
          <h1
            className="leading-none tracking-[-0.04em]"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}
          >
            Transport <span style={{ color: 'var(--accent-deep)', fontStyle: 'italic' }}>Lanes</span>
          </h1>
          <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)', maxWidth: 540 }}>
            Every active and recent cold-chain lane across the network. Select a lane to inspect its route, temperature history and event timeline.
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 h-[38px] px-[16px] rounded-full text-[13.5px] font-medium transition-all duration-200 hover:-translate-y-px"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'var(--shadow-1)' }}
        >
          Export
        </button>
      </div>

      <LaneStats />
      <LaneTable />
    </div>
  )
}
