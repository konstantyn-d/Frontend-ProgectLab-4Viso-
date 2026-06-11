'use client'

import { useState } from 'react'
import { Database, X } from 'lucide-react'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * Subtle banner shown only when Supabase env vars are missing — the app
 * is running on bundled demo data. Dismissible per session.
 */
export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (isSupabaseConfigured() || dismissed) return null

  return (
    <div
      className="flex items-center gap-2.5 px-[18px] py-2 text-[12px]"
      style={{ background: 'var(--accent-wash)', borderBottom: '1px solid var(--accent-line)', color: 'var(--accent-deep)' }}
    >
      <Database className="w-[14px] h-[14px] shrink-0" strokeWidth={1.6} />
      <span className="flex-1">
        Running on <b>demo data</b> — add <span className="font-mono">NEXT_PUBLIC_SUPABASE_URL</span> and{' '}
        <span className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</span> to connect your Supabase project.
      </span>
      <button onClick={() => setDismissed(true)} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
        <X className="w-[14px] h-[14px]" strokeWidth={1.6} />
      </button>
    </div>
  )
}
