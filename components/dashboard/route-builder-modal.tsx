'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Plus, Trash2, ChevronUp, ChevronDown, AlertTriangle, Building2, Thermometer } from 'lucide-react'
import { useQuery } from '@/lib/hooks/useQuery'
import { getCompanies, companyWarnings, type CompanyVM } from '@/lib/services/companiesService'
import { previewRouteRisk, saveRoute, type DraftNode, type RouteContext } from '@/lib/services/routeService'
import type { Lane } from '@/lib/mock-data'
import type { LaneNode } from '@/lib/services/lanesService'
import type { NodeType } from '@/lib/supabase/types'
import { useRole } from '@/lib/role-context'
import { can } from '@/lib/permissions'

const NODE_TYPES: NodeType[] = ['warehouse', 'airport', 'port', 'hub', 'customs', 'final_delivery']

function laneNodeToDraft(n: LaneNode): DraftNode {
  return {
    id: n.id, code: n.code, name: n.name, type: n.type, responsibleCompanyId: null,
    responsibleCompanyName: n.responsibleCompany, modeFromPrevious: (n.modeFromPrevious as DraftNode['modeFromPrevious']) ?? null,
    temperatureControl: n.temperatureControl, tempMin: n.tempMin, tempMax: n.tempMax,
    securityLevel: (n.securityLevel as DraftNode['securityLevel']) ?? null, validationStatus: n.validationStatus,
    handlingCapabilities: n.handlingCapabilities, specialConditions: n.specialConditions,
    latitude: n.latitude, longitude: n.longitude, certifications: n.certifications,
  }
}

function blankNode(lane: Lane): DraftNode {
  return {
    code: 'NEW', name: 'New node', type: 'hub', responsibleCompanyId: null, responsibleCompanyName: null,
    modeFromPrevious: lane.mode === 'sea' ? 'sea' : 'air', temperatureControl: false, tempMin: lane.tempMin, tempMax: lane.tempMax,
    securityLevel: 'medium', validationStatus: 'claimed', handlingCapabilities: ['pharma'], specialConditions: ['pharma'],
    latitude: null, longitude: null, certifications: [],
  }
}

function synthFromLane(lane: Lane): DraftNode[] {
  const mk = (code: string, name: string, type: NodeType): DraftNode => ({
    code, name, type, responsibleCompanyId: null, responsibleCompanyName: lane.carrier,
    modeFromPrevious: lane.mode === 'sea' ? 'sea' : 'air', temperatureControl: true, tempMin: lane.tempMin, tempMax: lane.tempMax,
    securityLevel: 'medium', validationStatus: lane.gdpCompliant ? 'validated' : 'claimed',
    handlingCapabilities: ['pharma'], specialConditions: ['pharma'], latitude: null, longitude: null,
    certifications: lane.gdpCompliant ? [{ type: 'GDP', status: 'valid', verified: true }] : [{ type: 'GDP', status: 'expired', verified: false }],
  })
  return [mk(lane.originCode, lane.origin, 'port'), mk(lane.destinationCode, lane.destination, 'final_delivery')]
}

export function RouteBuilderModal({
  open, onOpenChange, lane, initialNodes, onSaved,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  lane: Lane
  initialNodes: LaneNode[]
  onSaved: () => void
}) {
  const { role } = useRole()
  const { data: companies } = useQuery(getCompanies, [])
  const [nodes, setNodes] = useState<DraftNode[]>([])
  const [busy, setBusy] = useState(false)

  // (re)initialize draft whenever the modal opens
  useEffect(() => {
    if (open) setNodes(initialNodes.length ? initialNodes.map(laneNodeToDraft) : synthFromLane(lane))
  }, [open, initialNodes, lane])

  const ctx: RouteContext = {
    laneCode: lane.id, tempMin: lane.tempMin, tempMax: lane.tempMax, carrierName: lane.carrier,
    carrierGdp: lane.gdpCompliant ? { type: 'GDP', status: 'valid', verified: true } : { type: 'GDP', status: 'expired', verified: false },
  }
  const risk = previewRouteRisk(ctx, nodes)

  const update = (i: number, patch: Partial<DraftNode>) => setNodes(ns => ns.map((n, j) => (j === i ? { ...n, ...patch } : n)))
  const remove = (i: number) => setNodes(ns => ns.filter((_, j) => j !== i))
  const move = (i: number, dir: -1 | 1) => setNodes(ns => {
    const j = i + dir
    if (j < 0 || j >= ns.length) return ns
    const copy = [...ns];[copy[i], copy[j]] = [copy[j], copy[i]]; return copy
  })
  const add = () => setNodes(ns => [...ns, blankNode(lane)])

  const assignCompany = (i: number, c: CompanyVM) => update(i, {
    responsibleCompanyId: c.id, responsibleCompanyName: c.name,
    securityLevel: (c.securityLevel as DraftNode['securityLevel']) ?? 'medium',
    certifications: [{ type: 'GDP', status: c.gdpStatus, verified: c.gdpVerified }],
  })

  const handleSave = async () => {
    setBusy(true)
    try {
      await saveRoute(ctx, nodes)
      toast.success(`Route saved · risk ${risk.score}% (${risk.level}) · logged to audit`)
      onSaved()
      onOpenChange(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not save route')
    } finally { setBusy(false) }
  }

  const levelColor = risk.level === 'low' ? 'var(--accent-deep)' : risk.level === 'medium' ? 'var(--warn)' : 'var(--danger)'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[88vh] overflow-y-auto" style={{ background: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'var(--r-lg)' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '-0.02em', color: 'var(--foreground)' }}>
            Route Builder · {lane.id}
          </DialogTitle>
        </DialogHeader>

        {/* live risk preview */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--r-md)]" style={{ background: risk.level === 'low' ? 'var(--accent-wash)' : risk.level === 'medium' ? 'var(--warn-bg)' : 'var(--danger-bg)' }}>
          <span className="text-[12.5px] font-medium" style={{ color: levelColor }}>Live risk preview</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: levelColor }}>{risk.score}% · {risk.level}</span>
        </div>

        {/* nodes */}
        <div className="space-y-2.5">
          {nodes.map((n, i) => {
            const company = companies?.find(c => c.id === n.responsibleCompanyId)
            const warnings = company ? companyWarnings(company, true) : []
            return (
              <div key={i} className="border border-border rounded-[var(--r-md)] p-3" style={{ background: 'var(--secondary)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] shrink-0" style={{ background: 'var(--accent-wash)', color: 'var(--accent-deep)' }}>{i + 1}</span>
                  <input
                    value={n.name}
                    onChange={e => update(i, { name: e.target.value })}
                    className="flex-1 bg-transparent outline-none text-[13.5px] font-medium"
                    style={{ color: 'var(--foreground)' }}
                  />
                  <div className="flex items-center gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="w-6 h-6 flex items-center justify-center rounded disabled:opacity-30" style={{ color: 'var(--muted-foreground)' }}><ChevronUp className="w-4 h-4" strokeWidth={1.6} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === nodes.length - 1} className="w-6 h-6 flex items-center justify-center rounded disabled:opacity-30" style={{ color: 'var(--muted-foreground)' }}><ChevronDown className="w-4 h-4" strokeWidth={1.6} /></button>
                    <button onClick={() => remove(i)} className="w-6 h-6 flex items-center justify-center rounded" style={{ color: 'var(--danger)' }}><Trash2 className="w-[14px] h-[14px]" strokeWidth={1.6} /></button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* type */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="h-[28px] px-2.5 rounded-full text-[11px] font-mono" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>{n.type}</button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-card border-border">
                      {NODE_TYPES.map(t => <DropdownMenuItem key={t} onClick={() => update(i, { type: t })} className="text-[12px]">{t}</DropdownMenuItem>)}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* company */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-full text-[11.5px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: n.responsibleCompanyName ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        <Building2 className="w-[12px] h-[12px]" strokeWidth={1.6} />{n.responsibleCompanyName ?? 'Assign company'}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-card border-border max-h-[260px] overflow-y-auto">
                      {(companies ?? []).map(c => (
                        <DropdownMenuItem key={c.id} onClick={() => assignCompany(i, c)} className="text-[12px] gap-2">
                          {c.name}
                          <span className="text-[10px] font-mono" style={{ color: c.gdpStatus === 'valid' && c.gdpVerified ? 'var(--accent-deep)' : 'var(--danger)' }}>GDP:{c.gdpStatus}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* temp control toggle */}
                  <button
                    onClick={() => update(i, { temperatureControl: !n.temperatureControl })}
                    className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-full text-[11.5px]"
                    style={{ background: n.temperatureControl ? 'var(--accent-wash)' : 'var(--card)', border: `1px solid ${n.temperatureControl ? 'var(--accent-line)' : 'var(--border)'}`, color: n.temperatureControl ? 'var(--accent-deep)' : 'var(--muted-foreground)' }}
                  >
                    <Thermometer className="w-[12px] h-[12px]" strokeWidth={1.6} />{n.temperatureControl ? 'Temp controlled' : 'No temp control'}
                  </button>
                </div>

                {warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {warnings.map((w, k) => (
                      <div key={k} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--warn)' }}>
                        <AlertTriangle className="w-[12px] h-[12px] shrink-0" strokeWidth={1.6} />{w}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={add} className="inline-flex items-center gap-2 h-[34px] px-[14px] rounded-full text-[12.5px] font-medium self-start" style={{ background: 'var(--secondary)', border: '1px dashed var(--border-hover)', color: 'var(--foreground)' }}>
          <Plus className="w-[14px] h-[14px]" strokeWidth={1.8} /> Add waypoint
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>{nodes.length} nodes</span>
          {can(role, 'edit_route') ? (
            <button onClick={handleSave} disabled={busy || nodes.length < 2} className="inline-flex items-center gap-2 h-[38px] px-[18px] rounded-full text-[13px] font-medium transition-all hover:-translate-y-px disabled:opacity-60" style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}>
              {busy ? 'Saving…' : 'Save route & recalculate risk'}
            </button>
          ) : (
            <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>Read-only role</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
