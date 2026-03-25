'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { Plane, Ship, Truck, Layers, Check, ArrowRight, ArrowLeft, Bell, Mail, MessageSquare, AlertTriangle } from 'lucide-react'
import { getPorts, getCarriers, createLane, type Port, type Carrier } from '@/lib/api'

interface AddLaneModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3
type TransportMode = 'air' | 'sea' | 'road' | 'multimodal'

const transportModes: { mode: TransportMode; icon: React.ReactNode; label: string; description: string }[] = [
  { mode: 'air', icon: <Plane className="w-5 h-5" />, label: 'Air Freight', description: 'Fastest option for time-sensitive shipments' },
  { mode: 'sea', icon: <Ship className="w-5 h-5" />, label: 'Sea Freight', description: 'Cost-effective for large volumes' },
  { mode: 'road', icon: <Truck className="w-5 h-5" />, label: 'Road Transport', description: 'Flexible regional delivery' },
  { mode: 'multimodal', icon: <Layers className="w-5 h-5" />, label: 'Multimodal', description: 'Combined transport solutions' },
]

export function AddLaneModal({ open, onOpenChange }: AddLaneModalProps) {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>(1)
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null)
  const [originPortId, setOriginPortId] = useState('')
  const [originSearch, setOriginSearch] = useState('')
  const [destPortId, setDestPortId] = useState('')
  const [destSearch, setDestSearch] = useState('')
  const [carrierId, setCarrierId] = useState('')
  const [carrierSearch, setCarrierSearch] = useState('')
  const [tempMin, setTempMin] = useState('2')
  const [tempMax, setTempMax] = useState('8')
  const [productType, setProductType] = useState('vaccines')
  const [notifications, setNotifications] = useState({
    emailOnDeviation: true,
    pushOnStatusChange: true,
    dailyDigest: false,
    highRiskAlerts: true,
  })

  const { data: ports = [] } = useQuery({ queryKey: ['ports'], queryFn: getPorts, enabled: open })
  const { data: carriers = [] } = useQuery({ queryKey: ['carriers'], queryFn: getCarriers, enabled: open })

  const mutation = useMutation({
    mutationFn: createLane,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lanes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] })
      handleClose(false)
    },
  })

  const resetForm = () => {
    setStep(1)
    setSelectedMode(null)
    setOriginPortId('')
    setOriginSearch('')
    setDestPortId('')
    setDestSearch('')
    setCarrierId('')
    setCarrierSearch('')
    setTempMin('2')
    setTempMax('8')
    setProductType('vaccines')
    setNotifications({ emailOnDeviation: true, pushOnStatusChange: true, dailyDigest: false, highRiskAlerts: true })
    mutation.reset()
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) resetForm()
    onOpenChange(isOpen)
  }

  const canProceed = () => {
    if (step === 1) return selectedMode !== null
    if (step === 2) return originPortId && destPortId && carrierId && tempMin && tempMax
    return true
  }

  const handleSubmit = () => {
    if (!selectedMode || !originPortId || !destPortId || !carrierId) return
    mutation.mutate({
      originPortId,
      destPortId,
      carrierId,
      mode: selectedMode,
      productType,
      tempMin: parseFloat(tempMin),
      tempMax: parseFloat(tempMax),
      notifications,
    })
  }

  const filteredOriginPorts = ports.filter(
    (p: Port) =>
      !originPortId &&
      originSearch &&
      (p.name.toLowerCase().includes(originSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(originSearch.toLowerCase())),
  )

  const filteredDestPorts = ports.filter(
    (p: Port) =>
      !destPortId &&
      destSearch &&
      (p.name.toLowerCase().includes(destSearch.toLowerCase()) ||
        p.code.toLowerCase().includes(destSearch.toLowerCase())),
  )

  const filteredCarriers = carriers.filter(
    (c: Carrier) =>
      !carrierId &&
      carrierSearch &&
      c.name.toLowerCase().includes(carrierSearch.toLowerCase()),
  )

  const selectedOrigin = ports.find((p: Port) => p.id === originPortId)
  const selectedDest = ports.find((p: Port) => p.id === destPortId)
  const selectedCarrier = carriers.find((c: Carrier) => c.id === carrierId)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] bg-[#111111] border-[#222222] p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-[15px] font-medium text-[#F5F5F5]">
            Add New Transport Lane
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new pharmaceutical transport lane
          </DialogDescription>
        </DialogHeader>

        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  'w-6 h-6 flex items-center justify-center text-[11px] transition-colors',
                  step >= s ? 'bg-[#F5F5F5] text-[#0A0A0A]' : 'bg-[#1A1A1A] text-[#6B6B6B]',
                )}>
                  {step > s ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 3 && <div className={cn('flex-1 h-px', step > s ? 'bg-[#F5F5F5]' : 'bg-[#222222]')} />}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
            <span>Mode</span>
            <span>Route</span>
            <span>Alerts</span>
          </div>
        </div>

        <div className="p-5 min-h-[280px]">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#6B6B6B] mb-4">Select the primary transport mode</p>
              <div className="grid grid-cols-2 gap-2">
                {transportModes.map(({ mode, icon, label, description }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={cn(
                      'p-4 text-left transition-all border hover:border-[#2E2E2E]',
                      selectedMode === mode ? 'border-[#F5F5F5] bg-[#1A1A1A]' : 'border-[#222222] bg-[#0A0A0A]',
                    )}
                  >
                    <div className={cn('mb-2', selectedMode === mode ? 'text-[#F5F5F5]' : 'text-[#6B6B6B]')}>{icon}</div>
                    <div className="text-[13px] text-[#F5F5F5]">{label}</div>
                    <div className="text-[11px] text-[#3D3D3D] mt-1">{description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#6B6B6B] mb-4">Configure route and temperature requirements</p>
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Origin Port</FieldLabel>
                    <div className="relative">
                      <Input
                        placeholder="Search ports..."
                        value={originPortId ? `${selectedOrigin?.code} - ${selectedOrigin?.name}` : originSearch}
                        onChange={(e) => { setOriginSearch(e.target.value); setOriginPortId('') }}
                        className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                      />
                      {filteredOriginPorts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#222222] max-h-32 overflow-auto z-10">
                          {filteredOriginPorts.slice(0, 5).map((port: Port) => (
                            <button key={port.id} onClick={() => { setOriginPortId(port.id); setOriginSearch('') }} className="w-full px-3 py-2 text-left text-[12px] hover:bg-[#1A1A1A]">
                              <span className="font-mono text-[#F5F5F5]">{port.code}</span>
                              <span className="text-[#6B6B6B] ml-2">{port.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Destination Port</FieldLabel>
                    <div className="relative">
                      <Input
                        placeholder="Search ports..."
                        value={destPortId ? `${selectedDest?.code} - ${selectedDest?.name}` : destSearch}
                        onChange={(e) => { setDestSearch(e.target.value); setDestPortId('') }}
                        className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                      />
                      {filteredDestPorts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#222222] max-h-32 overflow-auto z-10">
                          {filteredDestPorts.slice(0, 5).map((port: Port) => (
                            <button key={port.id} onClick={() => { setDestPortId(port.id); setDestSearch('') }} className="w-full px-3 py-2 text-left text-[12px] hover:bg-[#1A1A1A]">
                              <span className="font-mono text-[#F5F5F5]">{port.code}</span>
                              <span className="text-[#6B6B6B] ml-2">{port.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                </FieldGroup>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Carrier</FieldLabel>
                  <div className="relative">
                    <Input
                      placeholder="Select carrier..."
                      value={carrierId ? selectedCarrier?.name || '' : carrierSearch}
                      onChange={(e) => { setCarrierSearch(e.target.value); setCarrierId('') }}
                      className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                    />
                    {filteredCarriers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#222222] max-h-32 overflow-auto z-10">
                        {filteredCarriers.slice(0, 5).map((c: Carrier) => (
                          <button key={c.id} onClick={() => { setCarrierId(c.id); setCarrierSearch('') }} className="w-full px-3 py-2 text-left text-[12px] text-[#A0A0A0] hover:bg-[#1A1A1A]">
                            {c.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Product Type</FieldLabel>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full h-9 text-[13px] bg-[#0A0A0A] border border-[#222222] text-[#F5F5F5] px-3"
                  >
                    <option value="vaccines">Vaccines</option>
                    <option value="biologics">Biologics</option>
                    <option value="api">Active Pharma Ingredients</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
              </FieldGroup>
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Min Temp (°C)</FieldLabel>
                    <Input type="number" value={tempMin} onChange={(e) => setTempMin(e.target.value)} className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]" />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Max Temp (°C)</FieldLabel>
                    <Input type="number" value={tempMax} onChange={(e) => setTempMax(e.target.value)} className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]" />
                  </Field>
                </FieldGroup>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#6B6B6B] mb-4">Configure notification preferences</p>
              <div className="space-y-2">
                <NotificationToggle icon={<Mail className="w-4 h-4" />} label="Email on deviation" description="Get notified on temperature issues" checked={notifications.emailOnDeviation} onChange={(v) => setNotifications({ ...notifications, emailOnDeviation: v })} />
                <NotificationToggle icon={<Bell className="w-4 h-4" />} label="Push on status change" description="Real-time status updates" checked={notifications.pushOnStatusChange} onChange={(v) => setNotifications({ ...notifications, pushOnStatusChange: v })} />
                <NotificationToggle icon={<MessageSquare className="w-4 h-4" />} label="Daily digest" description="Daily compliance summary" checked={notifications.dailyDigest} onChange={(v) => setNotifications({ ...notifications, dailyDigest: v })} />
                <NotificationToggle icon={<AlertTriangle className="w-4 h-4" />} label="High risk alerts" description="When risk exceeds 60%" checked={notifications.highRiskAlerts} onChange={(v) => setNotifications({ ...notifications, highRiskAlerts: v })} />
              </div>
              <div className="mt-5 p-4 bg-[#0A0A0A] border border-[#222222]">
                <h4 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <span className="text-[#6B6B6B]">Mode:</span>
                  <span className="text-[#A0A0A0] capitalize">{selectedMode}</span>
                  <span className="text-[#6B6B6B]">Route:</span>
                  <span className="text-[#A0A0A0]">{selectedOrigin?.code} → {selectedDest?.code}</span>
                  <span className="text-[#6B6B6B]">Carrier:</span>
                  <span className="text-[#A0A0A0]">{selectedCarrier?.name}</span>
                  <span className="text-[#6B6B6B]">Temperature:</span>
                  <span className="text-[#A0A0A0]">{tempMin}°C – {tempMax}°C</span>
                </div>
              </div>
              {mutation.isError && (
                <div className="text-[12px] text-[#E53E3E] bg-[rgba(229,62,62,0.1)] border-l-2 border-[#E53E3E] px-3 py-2">
                  Failed to create lane. Please try again.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-[#222222]">
          <Button variant="ghost" onClick={() => (step > 1 ? setStep((step - 1) as Step) : handleClose(false))} className="h-8 text-[12px] text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]">
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((step + 1) as Step)} disabled={!canProceed()} variant="outline" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
              Next <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={mutation.isPending} className="h-8 text-[12px] bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]">
              <Check className="w-3.5 h-3.5 mr-2" />
              {mutation.isPending ? 'Creating...' : 'Create Lane'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NotificationToggle({ icon, label, description, checked, onChange }: { icon: React.ReactNode; label: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={cn('w-full flex items-center gap-3 p-3 transition-all text-left border', checked ? 'border-[#F5F5F5] bg-[#1A1A1A]' : 'border-[#222222] bg-[#0A0A0A] hover:border-[#2E2E2E]')}>
      <div className={cn('w-8 h-8 flex items-center justify-center', checked ? 'text-[#F5F5F5]' : 'text-[#6B6B6B]')}>{icon}</div>
      <div className="flex-1">
        <div className="text-[13px] text-[#F5F5F5]">{label}</div>
        <div className="text-[11px] text-[#3D3D3D]">{description}</div>
      </div>
      <div className={cn('w-8 h-5 transition-colors relative', checked ? 'bg-[#F5F5F5]' : 'bg-[#222222]')}>
        <div className={cn('absolute top-0.5 w-4 h-4 transition-transform', checked ? 'translate-x-3.5 bg-[#0A0A0A]' : 'translate-x-0.5 bg-[#6B6B6B]')} />
      </div>
    </button>
  )
}
