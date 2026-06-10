'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Route,
  Truck,
  ClipboardCheck,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Lanes', href: '/dashboard/lanes', icon: Route },
  { name: 'Shipments', href: '/dashboard/shipments', icon: Truck },
  { name: 'Compliance', href: '/dashboard/compliance', icon: ClipboardCheck },
  { name: 'Audit Log', href: '/dashboard/audit-log', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0A0A0A] flex flex-col border-r border-[#222222]">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 px-5 border-b border-[#222222]">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-4 bg-[#10B981]" />
          <span className="text-[12px] uppercase tracking-[0.12em] text-[#F5F5F5] font-medium">
            Pharma<span className="text-[#10B981]">Track</span>
          </span>
        </div>
        <span className="text-[10px] text-[#3D3D3D] ml-auto">4Viso</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-[14px] rounded-sm',
                    isActive
                      ? 'text-[#F5F5F5] border-l-2 border-[#10B981] -ml-0.5 pl-[10px] bg-[rgba(16,185,129,0.05)]'
                      : 'text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#111111]'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-4 h-4',
                      isActive ? 'text-[#10B981]' : ''
                    )}
                    strokeWidth={1.5}
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-[#222222]">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 text-[14px] text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#111111] rounded-sm"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
