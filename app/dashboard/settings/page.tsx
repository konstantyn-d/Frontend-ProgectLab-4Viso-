import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-[15px] font-medium text-[#F5F5F5]">Settings</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">
          Manage account and application preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Profile</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">First Name</FieldLabel>
                  <Input defaultValue="Sarah" className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]" />
                </Field>
              </FieldGroup>
              <FieldGroup>
                <Field>
                  <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Last Name</FieldLabel>
                  <Input defaultValue="Chen" className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]" />
                </Field>
              </FieldGroup>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Email</FieldLabel>
                <Input defaultValue="sarah.chen@4viso.com" className="h-9 text-[13px] bg-[#0A0A0A] border-[#222222]" />
              </Field>
            </FieldGroup>
            <Button className="h-8 text-[12px] bg-[#F5F5F5] text-[#0A0A0A] hover:bg-[#E5E5E5]">
              Save Changes
            </Button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Notifications</h2>
          <div className="space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
              <div>
                <p className="text-[13px] text-[#F5F5F5]">Temperature Alerts</p>
                <p className="text-[11px] text-[#3D3D3D] mt-0.5">Get notified of temperature deviations</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[#1A1A1A]">
              <div>
                <p className="text-[13px] text-[#F5F5F5]">Compliance Updates</p>
                <p className="text-[11px] text-[#3D3D3D] mt-0.5">Daily compliance status summary</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-[13px] text-[#F5F5F5]">Shipment Arrivals</p>
                <p className="text-[11px] text-[#3D3D3D] mt-0.5">Notifications when shipments arrive</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#6B6B6B] hover:bg-[#1A1A1A]">
                Disabled
              </Button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
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

        {/* Organization Settings */}
        <div className="bg-[#111111] border border-[#222222] p-5">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-4">Organization</h2>
          <p className="text-[13px] text-[#6B6B6B]">
            4Viso Supply Chain Intelligence
          </p>
          <p className="text-[12px] text-[#3D3D3D] mt-2">
            Contact your administrator to manage organization settings.
          </p>
        </div>
      </div>
    </div>
  )
}
