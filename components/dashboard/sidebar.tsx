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
  LogOut
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
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0A0A0A] flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-[#222222]">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">PharmaTrack</span>
        <span className="text-[10px] text-[#3D3D3D]">by 4Viso</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors',
                    'hover:text-[#F5F5F5]',
                    isActive 
                      ? 'text-[#F5F5F5] border-l-2 border-[#F5F5F5] -ml-0.5 pl-[10px]' 
                      : 'text-[#6B6B6B]'
                  )}
                >
                  <item.icon className="w-4 h-4" />
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
          className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-[#6B6B6B] hover:text-[#F5F5F5] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
