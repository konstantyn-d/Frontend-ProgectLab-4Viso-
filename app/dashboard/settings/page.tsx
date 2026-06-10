'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Upload, Camera } from 'lucide-react'

const panelStyle: React.CSSProperties = {
  background: 'var(--card)',
  borderRadius: 'var(--r-lg)',
  boxShadow: 'var(--shadow-1)',
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono text-[10px] uppercase tracking-[0.1em] mb-4" style={{ color: 'var(--muted-foreground)' }}>
      {children}
    </h2>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-[0.1em] mb-2" style={{ color: 'var(--muted-foreground)' }}>
      {children}
    </label>
  )
}

function TextInput({ defaultValue }: { defaultValue: string }) {
  return (
    <input
      defaultValue={defaultValue}
      className="w-full h-[42px] px-4 text-[13.5px] outline-none transition-all duration-200"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--foreground)' }}
      onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px var(--accent-wash)' }}
      onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
    />
  )
}

function AccentButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="inline-flex items-center gap-2 h-[38px] px-[16px] rounded-full text-[12.5px] font-medium transition-all duration-200 hover:-translate-y-px"
      style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}
    >
      {children}
    </button>
  )
}

function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      className="inline-flex items-center gap-2 h-[38px] px-[16px] rounded-full text-[12.5px] font-medium transition-all duration-200 hover:-translate-y-px"
      style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'var(--shadow-1)' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-line)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-deep)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--foreground)' }}
    >
      {children}
    </button>
  )
}

export default function SettingsPage() {
  const [notif, setNotif] = useState({
    temperature: true,
    compliance: true,
    shipment: false,
    weekly: true,
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-[30px]">
        <h1
          className="leading-none tracking-[-0.04em]"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(28px, 3vw, 40px)', color: 'var(--foreground)', margin: 0 }}
        >
          Settings
        </h1>
        <p className="text-[15px] mt-3" style={{ color: 'var(--muted-foreground)' }}>
          Manage your account and application preferences.
        </p>
      </div>

      <div className="space-y-[18px]">
        {/* Profile */}
        <div className="border border-border p-[24px]" style={panelStyle}>
          <PanelTitle>Profile</PanelTitle>
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-[18px] font-semibold"
                  style={{ background: 'var(--accent-wash)', color: 'var(--accent-deep)', fontFamily: 'var(--font-display)' }}
                >
                  SC
                </div>
                <button className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity" style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Camera className="w-4 h-4 text-white" strokeWidth={1.5} />
                </button>
              </div>
              <div>
                <GhostButton><Upload className="w-3.5 h-3.5" strokeWidth={1.5} /> Upload avatar</GhostButton>
                <p className="text-[11px] mt-2" style={{ color: 'var(--muted-foreground)' }}>JPG or PNG, max 2MB</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><TextInput defaultValue="Sarah" /></div>
              <div><Label>Last Name</Label><TextInput defaultValue="Chen" /></div>
            </div>
            <div><Label>Email</Label><TextInput defaultValue="sarah.chen@4viso.com" /></div>
            <AccentButton>Save Changes</AccentButton>
          </div>
        </div>

        {/* Notifications */}
        <div className="border border-border p-[24px]" style={panelStyle}>
          <PanelTitle>Notifications</PanelTitle>
          <div>
            <ToggleRow title="Temperature Alerts" description="Get notified of temperature deviations" checked={notif.temperature} onChange={v => setNotif({ ...notif, temperature: v })} first />
            <ToggleRow title="Compliance Updates" description="Daily compliance status summary" checked={notif.compliance} onChange={v => setNotif({ ...notif, compliance: v })} />
            <ToggleRow title="Shipment Arrivals" description="Notifications when shipments arrive" checked={notif.shipment} onChange={v => setNotif({ ...notif, shipment: v })} />
            <ToggleRow title="Weekly Digest" description="Weekly summary of all activities" checked={notif.weekly} onChange={v => setNotif({ ...notif, weekly: v })} />
          </div>
        </div>

        {/* Security */}
        <div className="border border-border p-[24px]" style={panelStyle}>
          <PanelTitle>Security</PanelTitle>
          <div className="flex gap-3 flex-wrap">
            <GhostButton>Change Password</GhostButton>
            <GhostButton>Enable 2FA</GhostButton>
          </div>
        </div>

        {/* Organization */}
        <div className="border border-border p-[24px]" style={panelStyle}>
          <PanelTitle>Organization</PanelTitle>
          <p className="text-[14px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>4Viso Supply Chain Intelligence</p>
          <p className="text-[12px] mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Contact your administrator to manage organization settings.
          </p>
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ title, description, checked, onChange, first }: {
  title: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  first?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-4" style={{ borderTop: first ? undefined : '1px solid var(--line-soft)' }}>
      <div>
        <p className="text-[14px]" style={{ color: 'var(--foreground)', fontWeight: 500 }}>{title}</p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-[var(--border)]"
      />
    </div>
  )
}
