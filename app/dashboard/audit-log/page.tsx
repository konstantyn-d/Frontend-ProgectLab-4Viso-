'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditEvents, type AuditEventRow } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Search } from 'lucide-react'
import apiClient from '@/lib/api/client'

const severityStyles: Record<string, string> = {
  critical: 'border-l-[#E53E3E] text-[#E53E3E]',
  warning: 'border-l-[#C97B1A] text-[#C97B1A]',
  success: 'border-l-[#2D6A4F] text-[#2D6A4F]',
  info: 'border-l-[#2C5282] text-[#2C5282]',
}

const severityBadge: Record<string, string> = {
  critical: 'bg-[rgba(229,62,62,0.1)] text-[#E53E3E]',
  warning: 'bg-[rgba(201,123,26,0.1)] text-[#C97B1A]',
  success: 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
  info: 'bg-[rgba(44,82,130,0.1)] text-[#2C5282]',
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['audit', page, search],
    queryFn: () => getAuditEvents({ page, limit, search: search || undefined }),
  })

  const events = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const handleExport = async () => {
    const response = await apiClient.get('/api/audit/export', { responseType: 'blob', params: { search: search || undefined } })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-log.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-medium text-[#F5F5F5]">Audit Log</h1>
          <p className="text-[13px] text-[#6B6B6B] mt-1">System-wide event log for compliance and tracking</p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B6B6B]" />
        <Input
          placeholder="Search events..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="h-9 pl-10 text-[13px] bg-[#111111] border-[#222222] placeholder:text-[#3D3D3D]"
        />
      </div>

      <div className="bg-[#111111] border border-[#222222]">
        <div className="px-4 py-3 border-b border-[#1A1A1A] flex items-center justify-between">
          <span className="text-[13px] font-medium text-[#F5F5F5]">Events</span>
          <span className="text-[12px] text-[#6B6B6B]">{total} total</span>
        </div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-4 border-b border-[#1A1A1A]">
              <div className="h-4 w-64 bg-[#1A1A1A] animate-pulse rounded mb-2" />
              <div className="h-3 w-32 bg-[#1A1A1A] animate-pulse rounded" />
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="px-4 py-8 text-center text-[13px] text-[#6B6B6B]">No audit events found</div>
        ) : (
          events.map((event: AuditEventRow, i: number) => (
            <div
              key={event.id}
              className={cn(
                'px-4 py-4 border-l-4',
                severityStyles[event.severity] ?? 'border-l-[#222222]',
                i !== events.length - 1 && 'border-b border-[#1A1A1A]',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('inline-flex px-2 py-0.5 text-[9px] uppercase tracking-[0.06em] rounded-sm', severityBadge[event.severity] || '')}>
                      {event.severity}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.06em] text-[#6B6B6B]">{event.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[13px] text-[#F5F5F5]">{event.title}</p>
                  {event.description && <p className="text-[11px] text-[#6B6B6B] mt-1">{event.description}</p>}
                </div>
                <span className="text-[11px] text-[#3D3D3D] shrink-0 ml-4">{new Date(event.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1A1A1A]">
            <span className="text-[12px] text-[#6B6B6B]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
