'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, UserPlus, Check, ArrowUpRight } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getProfiles } from '@/lib/services/profilesService'
import { assignAlert, resolveAlert, type AlertVM } from '@/lib/services/alertsService'
import type { AlertSeverity } from '@/lib/supabase/types'

const sevColor: Record<AlertSeverity, string> = { critical: 'var(--danger)', warning: 'var(--warn)', info: 'var(--info-c)' }

export function AlertDetailDialog({
  alert, onOpenChange, onChanged,
}: {
  alert: AlertVM | null
  onOpenChange: (open: boolean) => void
  onChanged: (id: string, patch: Partial<AlertVM>) => void
}) {
  const router = useRouter()
  const { data: profiles } = useQuery(getProfiles, [])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  if (!alert) return null
  const resolved = alert.status === 'resolved' || alert.status === 'dismissed'

  const doAssign = async (id: string, name: string) => {
    setBusy(true)
    try {
      await assignAlert(alert.id, id, name)
      onChanged(alert.id, { status: 'assigned', assignedTo: id, assignedToName: name })
      toast.success(`Alert assigned to ${name}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not assign alert')
    } finally { setBusy(false) }
  }

  const doResolve = async () => {
    setBusy(true)
    try {
      await resolveAlert(alert.id, undefined, note.trim() || undefined)
      onChanged(alert.id, { status: 'resolved', resolvedAt: new Date().toISOString() })
      toast.success('Alert resolved · logged to audit trail')
      onOpenChange(false)
      setNote('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not resolve alert')
    } finally { setBusy(false) }
  }

  return (
    <Dialog open={alert !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]" style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--r-lg)' }}>
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.09em] px-2 py-0.5 rounded-full" style={{ color: sevColor[alert.severity], background: 'var(--secondary)' }}>
              {alert.severity} · {alert.type.replace('_', ' ')}
            </span>
            {alert.status !== 'open' && (
              <span className="font-mono text-[10px] uppercase tracking-[0.09em]" style={{ color: resolved ? 'var(--accent-deep)' : 'var(--warn)' }}>{alert.status}</span>
            )}
          </div>
          <DialogTitle style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
            {alert.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-[13px]" style={{ color: 'var(--text-body)' }}>{alert.message}</p>

        <div className="flex flex-wrap gap-2 text-[11px]">
          {alert.laneCode && <span className="font-mono px-2 py-1 rounded-full" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>Lane {alert.laneCode}</span>}
          {alert.shipmentNumber && <span className="font-mono px-2 py-1 rounded-full" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{alert.shipmentNumber}</span>}
          {alert.nodeName && <span className="font-mono px-2 py-1 rounded-full" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{alert.nodeName}</span>}
        </div>

        {alert.recommendedAction && (
          <div className="px-3.5 py-3 rounded-[var(--r-md)]" style={{ background: 'var(--accent-wash)' }}>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] mb-1" style={{ color: 'var(--accent-deep)' }}>Recommended action</p>
            <p className="text-[12.5px]" style={{ color: 'var(--text-body)' }}>{alert.recommendedAction}</p>
          </div>
        )}

        {alert.assignedToName && (
          <p className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>Assigned to <span style={{ color: 'var(--foreground)' }}>{alert.assignedToName}</span></p>
        )}

        {!resolved && (
          <>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Resolution note (optional)…"
              rows={2}
              className="w-full px-3 py-2.5 text-[13px] outline-none resize-none"
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--foreground)' }}
            />
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button disabled={busy} className="inline-flex items-center gap-2 h-[36px] px-[14px] rounded-full text-[12.5px] font-medium" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <UserPlus className="w-[14px] h-[14px]" strokeWidth={1.6} /> Assign <ChevronDown className="w-[13px] h-[13px]" strokeWidth={1.6} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card border-border" style={{ borderRadius: 'var(--r-md)' }}>
                  {(profiles ?? []).map(p => (
                    <DropdownMenuItem key={p.id} onClick={() => doAssign(p.id, p.name)} className="text-[13px] gap-2">
                      {p.name}<span className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>{p.role.replace('_', ' ')}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                {alert.laneCode && (
                  <button onClick={() => { onOpenChange(false); router.push(`/dashboard/lanes/${alert.laneCode}`) }} className="inline-flex items-center gap-1.5 h-[36px] px-[14px] rounded-full text-[12.5px] font-medium" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    Go to lane <ArrowUpRight className="w-[13px] h-[13px]" strokeWidth={1.6} />
                  </button>
                )}
                <button onClick={doResolve} disabled={busy} className="inline-flex items-center gap-2 h-[36px] px-[16px] rounded-full text-[12.5px] font-medium transition-all hover:-translate-y-px disabled:opacity-60" style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}>
                  <Check className="w-[14px] h-[14px]" strokeWidth={2} /> {busy ? 'Saving…' : 'Resolve'}
                </button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
