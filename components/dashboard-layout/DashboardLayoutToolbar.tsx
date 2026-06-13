'use client'

import { useState } from 'react'
import { LayoutGrid, Check, X, RotateCcw } from 'lucide-react'

const pill = 'inline-flex items-center gap-2 h-[34px] px-[14px] rounded-full text-[12.5px] font-medium transition-all duration-200 hover:-translate-y-px disabled:opacity-60'

export function DashboardLayoutToolbar({
  isEditMode, saving, onEdit, onSave, onCancel, onReset,
}: {
  isEditMode: boolean
  saving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onReset: () => void
}) {
  const [confirmReset, setConfirmReset] = useState(false)

  if (!isEditMode) {
    return (
      <button onClick={onEdit} className={pill} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', boxShadow: 'var(--shadow-1)' }}>
        <LayoutGrid className="w-[14px] h-[14px]" strokeWidth={1.6} /> Edit Layout
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {confirmReset ? (
        <>
          <span className="text-[12px]" style={{ color: 'var(--muted-foreground)' }}>Reset to default?</span>
          <button onClick={() => { setConfirmReset(false); onReset() }} className={pill} style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)', color: 'var(--danger)' }}>Yes, reset</button>
          <button onClick={() => setConfirmReset(false)} className={pill} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>No</button>
        </>
      ) : (
        <>
          <button onClick={() => setConfirmReset(true)} className={pill} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
            <RotateCcw className="w-[13px] h-[13px]" strokeWidth={1.6} /> Reset
          </button>
          <button onClick={onCancel} className={pill} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
            <X className="w-[14px] h-[14px]" strokeWidth={1.6} /> Cancel
          </button>
          <button onClick={onSave} disabled={saving} className={pill} style={{ background: 'var(--primary)', color: 'var(--on-accent)', boxShadow: '0 10px 24px -8px rgba(16,185,129,0.55)' }}>
            <Check className="w-[14px] h-[14px]" strokeWidth={2} /> {saving ? 'Saving…' : 'Save Layout'}
          </button>
        </>
      )}
    </div>
  )
}
