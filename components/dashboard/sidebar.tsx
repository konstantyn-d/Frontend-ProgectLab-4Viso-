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

const navOperations = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Lanes', href: '/dashboard/lanes', icon: Route },
  { name: 'Shipments', href: '/dashboard/shipments', icon: Truck },
  { name: 'Compliance', href: '/dashboard/compliance', icon: ClipboardCheck },
  { name: 'Audit Log', href: '/dashboard/audit-log', icon: FileText },
]

const navAccount = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

function BrandMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="6.5" cy="17.5" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="6.5" r="2.4" fill="none" />
      <path d="M8.6 15.4 15.4 8.6" />
      <path d="M6.5 9.5V6.5h3" opacity="0.55" />
    </svg>
  )
}

function NavSection({ label, items }: { label: string; items: typeof navOperations }) {
  const pathname = usePathname()

  return (
    <div className="mt-4">
      <p className="px-3 mb-2 text-[10px] uppercase tracking-[0.14em] font-mono text-[var(--text-muted)]">{label}</p>
      <ul className="flex flex-col gap-0.5">
        {items.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-[var(--r-sm)] transition-all duration-200',
                  isActive
                    ? 'bg-[var(--accent-wash)] text-[var(--accent-deep)] font-[550]'
                    : 'text-[var(--fg-dim,var(--muted-foreground))] hover:bg-secondary hover:text-foreground'
                )}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-[3px]"
                    style={{ background: 'var(--primary)', left: '-16px' }}
                  />
                )}
                <item.icon
                  className={cn('w-[17px] h-[17px] shrink-0', isActive ? 'text-[var(--accent-deep)]' : '')}
                  strokeWidth={1.6}
                />
                {item.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[248px] flex flex-col bg-card border-r border-border z-50" style={{ padding: '22px 16px' }}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-2.5 pb-5">
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
          style={{
            background: 'var(--primary)',
            color: 'var(--on-accent)',
            boxShadow: '0 6px 16px -6px rgba(16,185,129,0.55)',
          }}
        >
          <BrandMark />
        </div>
        <div>
          <div
            className="text-[17px] leading-none tracking-[-0.03em] text-foreground"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}
          >
            PharmaTrack
          </div>
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
            by 4Viso
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto" style={{ paddingLeft: '16px' }}>
        <NavSection label="Operations" items={navOperations} />
        <NavSection label="Account" items={navAccount} />
      </nav>

      {/* Footer */}
      <div className="pt-3 mt-2" style={{ borderTop: '1px solid var(--line-soft)' }}>
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] rounded-[var(--r-sm)] text-[var(--muted-foreground)] hover:text-foreground hover:bg-secondary transition-all duration-200"
        >
          <LogOut className="w-[17px] h-[17px] shrink-0" strokeWidth={1.6} />
          Sign Out
        </Link>
      </div>
    </aside>
  )
}
