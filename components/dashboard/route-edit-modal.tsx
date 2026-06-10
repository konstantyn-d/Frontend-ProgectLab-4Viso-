'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { mockPorts, type Lane, type Waypoint, getLaneWaypoints } from '@/lib/mock-data'
import { MapPin, Plus, X, AlertTriangle, CloudRain, Save, GripVertical } from 'lucide-react'

interface RouteEditModalProps {
  lane: Lane
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (waypoints: Waypoint[]) => void
}

interface EditableWaypoint extends Waypoint {
  _localId: string
}

export function RouteEditModal({ lane, open, onOpenChange, onSave }: RouteEditModalProps) {
  const [waypoints, setWaypoints] = useState<EditableWaypoint[]>([])
  const [newWaypoint, setNewWaypoint] = useState('')

  useEffect(() => {
    if (open) {
      const initial = getLaneWaypoints(lane).map((w, i) => ({
        ...w,
        _localId: `wp-${i}`,
      }))
      setWaypoints(initial)
      setNewWaypoint('')
    }
  }, [open, lane])

  const filteredPorts = mockPorts.filter(p =>
    newWaypoint.trim() &&
    (p.name.toLowerCase().includes(newWaypoint.toLowerCase()) ||
      p.code.toLowerCase().includes(newWaypoint.toLowerCase()))
  )

  const addWaypoint = (code: string, name: string) => {
    const newWp: EditableWaypoint = {
      _localId: `wp-${Date.now()}`,
      code,
      name,
      type: 'transit',
      completed: false,
    }
    // Insert before destination
    const destIdx = waypoints.findIndex(w => w.type === 'destination')
    const insertAt = destIdx === -1 ? waypoints.length : destIdx
    const next = [...waypoints.slice(0, insertAt), newWp, ...waypoints.slice(insertAt)]
    setWaypoints(next)
    setNewWaypoint('')
  }

  const removeWaypoint = (localId: string) => {
    setWaypoints(waypoints.filter(w => w._localId !== localId))
  }

  const weatherWarnings = [
    { location: 'North Atlantic', condition: 'Storm system', severity: 'critical' as const },
    { location: 'Indian Ocean', condition: 'Typhoon forming', severity: 'warning' as const },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-[#0A0A0A] border-[#222222] p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-[16px] font-medium text-[#F5F5F5]">
            Edit Route
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6B6B6B]">
            <span className="font-mono text-[#A0A0A0]">{lane.originCode} → {lane.destinationCode}</span>
            <span className="mx-2 text-[#3D3D3D]">·</span>
            {lane.carrier}
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-6">
          {/* Current route */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">Current Route</p>
            <div className="space-y-1">
              {waypoints.map((wp, idx) => {
                const canRemove = wp.type === 'transit' && !wp.completed
                return (
                  <div
                    key={wp._localId}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 border',
                      wp.current
                        ? 'border-[#10B981] bg-[rgba(16,185,129,0.05)]'
                        : 'border-[#222222] bg-[#111111]'
                    )}
                  >
                    <GripVertical className="w-3.5 h-3.5 text-[#3D3D3D] shrink-0" strokeWidth={1.5} />
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0',
                        wp.completed
                          ? 'bg-[#10B981] text-[#0A0A0A]'
                          : wp.current
                          ? 'border border-[#10B981] text-[#10B981] bg-transparent'
                          : 'border border-[#2E2E2E] text-[#6B6B6B] bg-transparent'
                      )}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[12px] text-[#F5F5F5]">{wp.code}</span>
                        <span className="text-[10px] uppercase tracking-[0.06em] text-[#6B6B6B]">
                          {wp.type}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A0A0A0]">{wp.name}</p>
                    </div>
                    {canRemove && (
                      <button
                        onClick={() => removeWaypoint(wp._localId)}
                        className="text-[#6B6B6B] hover:text-[#E53E3E] shrink-0"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add waypoint */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-2">Add Waypoint</p>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#3D3D3D]" strokeWidth={1.5} />
              <Input
                value={newWaypoint}
                onChange={(e) => setNewWaypoint(e.target.value)}
                placeholder="Search port or airport..."
                className="pl-9 h-9 text-[13px] bg-[#111111] border-[#222222] focus:border-[#10B981]"
              />
              {filteredPorts.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0A0A0A] border border-[#222222] max-h-40 overflow-auto z-10">
                  {filteredPorts.slice(0, 5).map(p => (
                    <button
                      key={p.code}
                      onClick={() => addWaypoint(p.code, p.name)}
                      className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#111111]"
                    >
                      <span className="text-[12px]">
                        <span className="font-mono text-[#F5F5F5]">{p.code}</span>
                        <span className="text-[#6B6B6B] ml-2">{p.name}</span>
                      </span>
                      <Plus className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={1.5} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Weather warnings */}
          {weatherWarnings.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-2">Weather Along Route</p>
              <div className="space-y-1.5">
                {weatherWarnings.map(w => (
                  <div
                    key={w.location}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 border-l-2',
                      w.severity === 'critical' ? 'border-[#E53E3E] bg-[rgba(229,62,62,0.05)]' : 'border-[#C97B1A] bg-[rgba(201,123,26,0.05)]'
                    )}
                  >
                    {w.severity === 'critical' ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#E53E3E] shrink-0" strokeWidth={1.5} />
                    ) : (
                      <CloudRain className="w-3.5 h-3.5 text-[#C97B1A] shrink-0" strokeWidth={1.5} />
                    )}
                    <div className="flex-1 text-[12px]">
                      <span className="text-[#F5F5F5]">{w.location}</span>
                      <span className="text-[#6B6B6B] ml-2">{w.condition}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-[#222222]">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-8 text-[12px] text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(waypoints)
              onOpenChange(false)
            }}
            className="h-8 text-[12px] bg-[#10B981] text-white hover:bg-[#059669]"
          >
            <Save className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} />
            Save Route
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
