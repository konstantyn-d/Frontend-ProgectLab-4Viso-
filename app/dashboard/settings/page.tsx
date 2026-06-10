'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { Upload, Camera } from 'lucide-react'

export default function SettingsPage() {
  const [notif, setNotif] = useState({
    temperature: true,
    compliance: true,
    shipment: false,
    weekly: true,
  })

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-[20px] font-medium text-[#F5F5F5]">Settings</h1>
        <p className="text-[14px] text-[#6B6B6B] mt-1">
          Manage account and application preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Profile</h2>
          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center text-[18px] text-[#10B981] font-medium">
                  SC
                </div>
                <button className="absolute inset-0 rounded-full bg-[rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-white" strokeWidth={1.5} />
                </button>
              </div>
              <div>
                <Button variant="outline" size="sm" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A] focus-visible:ring-[#10B981]">
                  <Upload className="w-3.5 h-3.5 mr-2" strokeWidth={1.5} /> Upload avatar
                </Button>
                <p className="text-[11px] text-[#6B6B6B] mt-2">JPG or PNG, max 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">First Name</FieldLabel>
                  <Input defaultValue="Sarah" className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222] focus:border-[#10B981] focus-visible:ring-[#10B981]" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Last Name</FieldLabel>
                  <Input defaultValue="Chen" className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222] focus:border-[#10B981] focus-visible:ring-[#10B981]" />
                </Field>
              </FieldGroup>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Email</FieldLabel>
                <Input defaultValue="sarah.chen@4viso.com" className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222] focus:border-[#10B981] focus-visible:ring-[#10B981]" />
              </Field>
            </FieldGroup>
            <Button className="h-8 text-[12px] bg-[#10B981] text-white hover:bg-[#059669]">
              Save Changes
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-2">Notifications</h2>
          <div className="divide-y divide-[#1A1A1A]">
            <ToggleRow
              title="Temperature Alerts"
              description="Get notified of temperature deviations"
              checked={notif.temperature}
              onChange={(v) => setNotif({ ...notif, temperature: v })}
            />
            <ToggleRow
              title="Compliance Updates"
              description="Daily compliance status summary"
              checked={notif.compliance}
              onChange={(v) => setNotif({ ...notif, compliance: v })}
            />
            <ToggleRow
              title="Shipment Arrivals"
              description="Notifications when shipments arrive"
              checked={notif.shipment}
              onChange={(v) => setNotif({ ...notif, shipment: v })}
            />
            <ToggleRow
              title="Weekly Digest"
              description="Weekly summary of all activities"
              checked={notif.weekly}
              onChange={(v) => setNotif({ ...notif, weekly: v })}
            />
          </div>
        </div>

        {/* Security */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Security</h2>
          <div className="flex gap-3">
            <Button variant="outline" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
              Change Password
            </Button>
            <Button variant="outline" className="h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
              Enable 2FA
            </Button>
          </div>
        </div>

        {/* Organization */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Organization</h2>
          <p className="text-[14px] text-[#F5F5F5]">
            4Viso Supply Chain Intelligence
          </p>
          <p className="text-[12px] text-[#6B6B6B] mt-2">
            Contact your administrator to manage organization settings.
          </p>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ title, description, checked, onChange }: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div>
        <p className="text-[14px] text-[#F5F5F5]">{title}</p>
        <p className="text-[12px] text-[#6B6B6B] mt-0.5">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#10B981] data-[state=unchecked]:bg-[#222222]"
      />
    </div>
  )
}
