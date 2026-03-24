'use client'

import { cn } from '@/lib/utils'

interface CorridorData {
  corridor: string
  activeLanes: number
  avgRisk: number
  compliance: number
  throughput: string
  status: 'compliant' | 'warning' | 'deviation'
}

const corridors: CorridorData[] = [
  { corridor: 'EU - APAC', activeLanes: 12, avgRisk: 18, compliance: 97.2, throughput: '24.5k units', status: 'compliant' },
  { corridor: 'EU - NAM', activeLanes: 8, avgRisk: 24, compliance: 94.8, throughput: '18.2k units', status: 'compliant' },
  { corridor: 'APAC - NAM', activeLanes: 6, avgRisk: 45, compliance: 91.3, throughput: '12.8k units', status: 'warning' },
  { corridor: 'EU - LATAM', activeLanes: 5, avgRisk: 62, compliance: 88.5, throughput: '8.4k units', status: 'deviation' },
  { corridor: 'EU - MEA', activeLanes: 4, avgRisk: 32, compliance: 93.1, throughput: '6.2k units', status: 'warning' },
  { corridor: 'APAC - MEA', activeLanes: 3, avgRisk: 15, compliance: 98.4, throughput: '4.1k units', status: 'compliant' },
]

const statusBorderColors = {
  compliant: 'border-l-[#2D6A4F]',
  warning: 'border-l-[#C97B1A]',
  deviation: 'border-l-[#E53E3E]',
}

export function NetworkStatus() {
  return (
    <div className="bg-[#111111] border border-[#222222]">
      {/* Header */}
      <div className="grid grid-cols-6 px-4 py-3 border-b border-[#1A1A1A]">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Corridor</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Active Lanes</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Avg Risk</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Compliance</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Throughput</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Status</span>
      </div>

      {/* Rows */}
      {corridors.map((row, index) => (
        <div 
          key={row.corridor}
          className={cn(
            'grid grid-cols-6 px-4 py-4 border-l-4 items-center',
            statusBorderColors[row.status],
            index !== corridors.length - 1 && 'border-b border-[#1A1A1A]'
          )}
        >
          <span className="text-[13px] text-[#F5F5F5] font-mono">{row.corridor}</span>
          <span className="text-[13px] text-[#A0A0A0]">{row.activeLanes}</span>
          <span className={cn(
            'text-[13px]',
            row.avgRisk > 60 ? 'text-[#E53E3E]' : 'text-[#A0A0A0]'
          )}>
            {row.avgRisk}%
          </span>
          <span className="text-[13px] text-[#A0A0A0]">{row.compliance}%</span>
          <span className="text-[13px] text-[#A0A0A0]">{row.throughput}</span>
          <span className={cn(
            'text-[10px] uppercase tracking-[0.08em]',
            row.status === 'compliant' && 'text-[#2D6A4F]',
            row.status === 'warning' && 'text-[#C97B1A]',
            row.status === 'deviation' && 'text-[#E53E3E]'
          )}>
            {row.status}
          </span>
        </div>
      ))}
    </div>
  )
}
