'use client'

import { useState } from 'react'
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
import { Plane, Ship, Truck, Layers, Check, ArrowRight, ArrowLeft, Bell, Mail, MessageSquare } from 'lucide-react'
import { mockPorts, carriers, type TransportMode } from '@/lib/mock-data'

interface AddLaneModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3

const transportModes: { mode: TransportMode; icon: React.ReactNode; label: string; description: string }[] = [
  { mode: 'air', icon: <Plane className="w-5 h-5" />, label: 'Air Freight', description: 'Fastest option for time-sensitive shipments' },
  { mode: 'sea', icon: <Ship className="w-5 h-5" />, label: 'Sea Freight', description: 'Cost-effective for large volumes' },
  { mode: 'road', icon: <Truck className="w-5 h-5" />, label: 'Road Transport', description: 'Flexible regional delivery' },
  { mode: 'multimodal', icon: <Layers className="w-5 h-5" />, label: 'Multimodal', description: 'Combined transport solutions' },
]

export function AddLaneModal({ open, onOpenChange }: AddLaneModalProps) {
  const [step, setStep] = useState<Step>(1)
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null)
  const [originPort, setOriginPort] = useState('')
  const [destPort, setDestPort] = useState('')
  const [carrier, setCarrier] = useState('')
  const [tempMin, setTempMin] = useState('2')
  const [tempMax, setTempMax] = useState('8')
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  })

  const resetForm = () => {
    setStep(1)
    setSelectedMode(null)
    setOriginPort('')
    setDestPort('')
    setCarrier('')
    setTempMin('2')
    setTempMax('8')
    setNotifications({ email: true, sms: false, push: true })
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm()
    }
    onOpenChange(isOpen)
  }

  const canProceed = () => {
    if (step === 1) return selectedMode !== null
    if (step === 2) return originPort && destPort && carrier && tempMin && tempMax
    return true
  }

  const handleSubmit = () => {
    handleClose(false)
  }

  const filteredOriginPorts = mockPorts.filter(p => 
    p.name.toLowerCase().includes(originPort.toLowerCase()) ||
    p.code.toLowerCase().includes(originPort.toLowerCase())
  )

  const filteredDestPorts = mockPorts.filter(p => 
    p.name.toLowerCase().includes(destPort.toLowerCase()) ||
    p.code.toLowerCase().includes(destPort.toLowerCase())
  )

  const filteredCarriers = carriers.filter(c =>
    c.toLowerCase().includes(carrier.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px] bg-[#111111] border-[#222222] p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-[15px] font-medium text-[#F5F5F5]">
            Add New Transport Lane
          </DialogTitle>
          <DialogDescription className="sr-only">
            Create a new pharmaceutical transport lane by selecting transport mode, configuring route details, and setting notification preferences.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  'w-6 h-6 flex items-center justify-center text-[11px] transition-colors',
                  step >= s 
                    ? 'bg-[#F5F5F5] text-[#0A0A0A]' 
                    : 'bg-[#1A1A1A] text-[#6B6B6B]'
                )}>
                  {step > s ? <Check className="w-3 h-3" /> : s}
                </div>
                {s < 3 && (
                  <div className={cn(
                    'flex-1 h-px',
                    step > s ? 'bg-[#F5F5F5]' : 'bg-[#222222]'
                  )} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">
            <span>Mode</span>
            <span>Route</span>
            <span>Alerts</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-5 min-h-[280px]">
          {/* Step 1: Select Transport Mode */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#6B6B6B] mb-4">
                Select the primary transport mode
              </p>
              <div className="grid grid-cols-2 gap-2">
                {transportModes.map(({ mode, icon, label, description }) => (
                  <button
                    key={mode}
                    onClick={() => setSelectedMode(mode)}
                    className={cn(
                      'p-4 text-left transition-all border',
                      'hover:border-[#2E2E2E]',
                      selectedMode === mode 
                        ? 'border-[#F5F5F5] bg-[#1A1A1A]' 
                        : 'border-[#222222] bg-[#0A0A0A]'
                    )}
                  >
                    <div className={cn(
                      'mb-2',
                      selectedMode === mode ? 'text-[#F5F5F5]' : 'text-[#6B6B6B]'
                    )}>
                      {icon}
                    </div>
                    <div className="text-[13px] text-[#F5F5F5]">{label}</div>
                    <div className="text-[11px] text-[#3D3D3D] mt-1">{description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Route Details */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#6B6B6B] mb-4">
                Configure route and temperature requirements
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Origin Port</FieldLabel>
                    <div className="relative">
                      <Input
                        placeholder="Search ports..."
                        value={originPort}
                        onChange={(e) => setOriginPort(e.target.value)}
                        className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                      />
                      {originPort && filteredOriginPorts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#222222] max-h-32 overflow-auto z-10">
                          {filteredOriginPorts.slice(0, 5).map((port) => (
                            <button
                              key={port.code}
                              onClick={() => setOriginPort(`${port.code} - ${port.name}`)}
                              className="w-full px-3 py-2 text-left text-[12px] hover:bg-[#1A1A1A] transition-colors"
                            >
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
                        value={destPort}
                        onChange={(e) => setDestPort(e.target.value)}
                        className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                      />
                      {destPort && filteredDestPorts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#222222] max-h-32 overflow-auto z-10">
                          {filteredDestPorts.slice(0, 5).map((port) => (
                            <button
                              key={port.code}
                              onClick={() => setDestPort(`${port.code} - ${port.name}`)}
                              className="w-full px-3 py-2 text-left text-[12px] hover:bg-[#1A1A1A] transition-colors"
                            >
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
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                    />
                    {carrier && filteredCarriers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#111111] border border-[#222222] max-h-32 overflow-auto z-10">
                        {filteredCarriers.slice(0, 5).map((c) => (
                          <button
                            key={c}
                            onClick={() => setCarrier(c)}
                            className="w-full px-3 py-2 text-left text-[12px] text-[#A0A0A0] hover:bg-[#1A1A1A] transition-colors"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </FieldGroup>

              <div className="grid grid-cols-2 gap-3">
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Min Temp (°C)</FieldLabel>
                    <Input
                      type="number"
                      value={tempMin}
                      onChange={(e) => setTempMin(e.target.value)}
                      className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                    />
                  </Field>
                </FieldGroup>
                <FieldGroup>
                  <Field>
                    <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Max Temp (°C)</FieldLabel>
                    <Input
                      type="number"
                      value={tempMax}
                      onChange={(e) => setTempMax(e.target.value)}
                      className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]"
                    />
                  </Field>
                </FieldGroup>
              </div>
            </div>
          )}

          {/* Step 3: Notifications */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#6B6B6B] mb-4">
                Configure notification preferences
              </p>

              <div className="space-y-2">
                <NotificationToggle
                  icon={<Mail className="w-4 h-4" />}
                  label="Email Notifications"
                  description="Receive updates via email"
                  checked={notifications.email}
                  onChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
                <NotificationToggle
                  icon={<MessageSquare className="w-4 h-4" />}
                  label="SMS Alerts"
                  description="Critical alerts via SMS"
                  checked={notifications.sms}
                  onChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                />
                <NotificationToggle
                  icon={<Bell className="w-4 h-4" />}
                  label="Push Notifications"
                  description="Real-time browser notifications"
                  checked={notifications.push}
                  onChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              {/* Summary */}
              <div className="mt-5 p-4 bg-[#0A0A0A] border border-[#222222]">
                <h4 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <span className="text-[#6B6B6B]">Mode:</span>
                  <span className="text-[#A0A0A0] capitalize">{selectedMode}</span>
                  <span className="text-[#6B6B6B]">Route:</span>
                  <span className="text-[#A0A0A0]">{originPort.split(' - ')[0]} to {destPort.split(' - ')[0]}</span>
                  <span className="text-[#6B6B6B]">Carrier:</span>
                  <span className="text-[#A0A0A0]">{carrier}</span>
                  <span className="text-[#6B6B6B]">Temperature:</span>
                  <span className="text-[#A0A0A0]">{tempMin}°C - {tempMax}°C</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-5 border-t border-[#222222]">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep((step - 1) as Step) : handleClose(false)}
            className="h-8 text-[12px] text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
              variant="outline"
              className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="h-8 text-[12px] bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]"
            >
              <Check className="w-3.5 h-3.5 mr-2" />
              Create Lane
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NotificationToggle({ 
  icon, 
  label, 
  description, 
  checked, 
  onChange 
}: { 
  icon: React.ReactNode
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-full flex items-center gap-3 p-3 transition-all text-left border',
        checked 
          ? 'border-[#F5F5F5] bg-[#1A1A1A]' 
          : 'border-[#222222] bg-[#0A0A0A] hover:border-[#2E2E2E]'
      )}
    >
      <div className={cn(
        'w-8 h-8 flex items-center justify-center',
        checked ? 'text-[#F5F5F5]' : 'text-[#6B6B6B]'
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[13px] text-[#F5F5F5]">{label}</div>
        <div className="text-[11px] text-[#3D3D3D]">{description}</div>
      </div>
      <div className={cn(
        'w-8 h-5 transition-colors relative',
        checked ? 'bg-[#F5F5F5]' : 'bg-[#222222]'
      )}>
        <div className={cn(
          'absolute top-0.5 w-4 h-4 transition-transform',
          checked ? 'translate-x-3.5 bg-[#0A0A0A]' : 'translate-x-0.5 bg-[#6B6B6B]'
        )} />
      </div>
    </button>
  )
}
