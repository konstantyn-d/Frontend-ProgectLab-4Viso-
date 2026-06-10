'use client'

import { useState } from 'react'
import { type AuditLogEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useQuery } from '@/lib/hooks/useQuery'
import { getAuditLog } from '@/lib/services/auditService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Download, 
  Filter, 
  ChevronDown,
  Calendar,
  User
} from 'lucide-react'

const actionLabels: Record<AuditLogEntry['action'], string> = {
  lane_created: 'Lane Created',
  lane_updated: 'Lane Updated',
  temperature_alert: 'Temperature Alert',
  compliance_check: 'Compliance Check',
  shipment_departed: 'Shipment Departed',
  shipment_arrived: 'Shipment Arrived',
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}

function formatFullTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function AuditLogPage() {
  const { data: logs, loading, error } = useQuery(getAuditLog, [])
  const [actionFilter, setActionFilter] = useState<AuditLogEntry['action'] | 'all'>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const allLogs = logs ?? []
  const uniqueUsers = Array.from(new Set(allLogs.map(entry => entry.userName)))

  const filteredLogs = allLogs.filter(entry => {
    if (actionFilter !== 'all' && entry.action !== actionFilter) return false
    if (userFilter !== 'all' && entry.userName !== userFilter) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        entry.description.toLowerCase().includes(query) ||
        entry.laneId.toLowerCase().includes(query) ||
        entry.userName.toLowerCase().includes(query)
      )
    }
    return true
  })

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Description', 'Lane ID', 'Severity']
    const rows = filteredLogs.map(entry => [
      formatFullTimestamp(entry.timestamp),
      entry.userName,
      actionLabels[entry.action],
      entry.description,
      entry.laneId,
      entry.severity,
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="mb-[30px]">
          <h1 className="leading-none tracking-[-0.04em]" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}>Audit Log</h1>
          <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)' }}>
            Track all activities and changes across transport lanes.
          </p>
        </div>
        <Button 
          onClick={handleExportCSV} 
          variant="outline" 
          className="gap-2 h-8 text-[12px] border-[var(--border-hover)] bg-transparent text-foreground hover:bg-secondary"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-[13px] bg-card border-border placeholder:text-[var(--text-muted)] focus:border-[var(--border-hover)]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 h-8 text-[12px] border-[var(--border-hover)] bg-transparent text-foreground hover:bg-secondary"
            >
              <Calendar className="w-3.5 h-3.5" />
              Date Range
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuItem className="text-[13px]">Today</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px]">Last 7 days</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px]">Last 30 days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 h-8 text-[12px] border-[var(--border-hover)] bg-transparent text-foreground hover:bg-secondary"
            >
              <User className="w-3.5 h-3.5" />
              {userFilter === 'all' ? 'All Users' : userFilter}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuItem onClick={() => setUserFilter('all')} className="text-[13px]">
              All Users
            </DropdownMenuItem>
            {uniqueUsers.map(user => (
              <DropdownMenuItem key={user} onClick={() => setUserFilter(user)} className="text-[13px]">
                {user}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 h-8 text-[12px] border-[var(--border-hover)] bg-transparent text-foreground hover:bg-secondary"
            >
              <Filter className="w-3.5 h-3.5" />
              {actionFilter === 'all' ? 'All Actions' : actionLabels[actionFilter]}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border">
            <DropdownMenuItem onClick={() => setActionFilter('all')} className="text-[13px]">
              All Actions
            </DropdownMenuItem>
            {Object.entries(actionLabels).map(([key, label]) => (
              <DropdownMenuItem 
                key={key} 
                onClick={() => setActionFilter(key as AuditLogEntry['action'])}
                className="text-[13px]"
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Timeline */}
      <div className="border border-border overflow-hidden" style={{ background: "var(--card)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-1)" }}>
        {loading ? (
          <div className="p-12 text-center"><p className="text-[13px] text-muted-foreground">Loading audit log…</p></div>
        ) : error ? (
          <div className="p-12 text-center"><p className="text-[13px]" style={{ color: 'var(--danger)' }}>Could not load audit log: {error}</p></div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[13px] text-muted-foreground">No audit log entries found</p>
          </div>
        ) : (
          filteredLogs.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                'flex items-start gap-4 px-4 py-4 border-l-4 hover:bg-secondary transition-colors',
                entry.severity === 'critical' && 'border-l-[var(--danger)]',
                entry.severity === 'warning' && 'border-l-[var(--warn)]',
                entry.severity === 'success' && 'border-l-[#2D6A4F]',
                entry.severity === 'info' && 'border-l-[#2C5282]',
                index !== filteredLogs.length - 1 && 'border-b border-border'
              )}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                    {actionLabels[entry.action]}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    {entry.laneId}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--text-body)] mb-2">
                  {entry.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                  <span>{entry.userName}</span>
                </div>
              </div>

              {/* Timestamp */}
              <span 
                className="text-[11px] text-[var(--text-muted)] shrink-0"
                title={formatFullTimestamp(entry.timestamp)}
              >
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
        <span>Showing {filteredLogs.length} of {allLogs.length} entries</span>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled 
            className="h-7 text-[11px] border-[var(--border-hover)] bg-transparent"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled 
            className="h-7 text-[11px] border-[var(--border-hover)] bg-transparent"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

