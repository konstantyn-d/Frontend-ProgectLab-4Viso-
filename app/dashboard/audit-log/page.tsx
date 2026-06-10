'use client'

import { useState } from 'react'
import { mockAuditLog, type AuditLogEntry } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
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
  const [actionFilter, setActionFilter] = useState<AuditLogEntry['action'] | 'all'>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const uniqueUsers = Array.from(new Set(mockAuditLog.map(entry => entry.userName)))

  const filteredLogs = mockAuditLog.filter(entry => {
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
        <div>
          <h1 className="text-[15px] font-medium text-[#F5F5F5]">Audit Log</h1>
          <p className="text-[13px] text-[#6B6B6B] mt-1">
            Track all activities and changes across transport lanes
          </p>
        </div>
        <Button 
          onClick={handleExportCSV} 
          variant="outline" 
          className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
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
            className="h-8 text-[13px] bg-[#111111] border-[#222222] placeholder:text-[#3D3D3D] focus:border-[#2E2E2E]"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <Calendar className="w-3.5 h-3.5" />
              Date Range
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111111] border-[#222222]">
            <DropdownMenuItem className="text-[13px]">Today</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px]">Last 7 days</DropdownMenuItem>
            <DropdownMenuItem className="text-[13px]">Last 30 days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <User className="w-3.5 h-3.5" />
              {userFilter === 'all' ? 'All Users' : userFilter}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111111] border-[#222222]">
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
              className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              <Filter className="w-3.5 h-3.5" />
              {actionFilter === 'all' ? 'All Actions' : actionLabels[actionFilter]}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#111111] border-[#222222]">
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
      <div className="bg-[#111111] border border-[#222222]">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[13px] text-[#6B6B6B]">No audit log entries found</p>
          </div>
        ) : (
          filteredLogs.map((entry, index) => (
            <div
              key={entry.id}
              className={cn(
                'flex items-start gap-4 px-4 py-4 border-l-4 hover:bg-[#1A1A1A] transition-colors',
                entry.severity === 'critical' && 'border-l-[#E53E3E]',
                entry.severity === 'warning' && 'border-l-[#C97B1A]',
                entry.severity === 'success' && 'border-l-[#2D6A4F]',
                entry.severity === 'info' && 'border-l-[#2C5282]',
                index !== filteredLogs.length - 1 && 'border-b border-[#1A1A1A]'
              )}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
                    {actionLabels[entry.action]}
                  </span>
                  <span className="text-[11px] text-[#3D3D3D] font-mono">
                    {entry.laneId}
                  </span>
                </div>
                <p className="text-[13px] text-[#A0A0A0] mb-2">
                  {entry.description}
                </p>
                <div className="flex items-center gap-4 text-[11px] text-[#3D3D3D]">
                  <span>{entry.userName}</span>
                </div>
              </div>

              {/* Timestamp */}
              <span 
                className="text-[11px] text-[#3D3D3D] shrink-0"
                title={formatFullTimestamp(entry.timestamp)}
              >
                {formatTimestamp(entry.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-[12px] text-[#6B6B6B]">
        <span>Showing {filteredLogs.length} of {mockAuditLog.length} entries</span>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled 
            className="h-7 text-[11px] border-[#2E2E2E] bg-transparent"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            disabled 
            className="h-7 text-[11px] border-[#2E2E2E] bg-transparent"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
