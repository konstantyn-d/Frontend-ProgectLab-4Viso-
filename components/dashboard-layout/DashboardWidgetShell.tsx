'use client'

import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Fills a grid cell and, in edit mode, shows a subtle editable outline plus
 * a drag handle (class `widget-drag-handle` is what react-grid-layout uses
 * as `draggableHandle`, so only the handle drags — not the whole card).
 */
export function DashboardWidgetShell({
  title, isEditMode, children,
}: {
  title: string
  isEditMode: boolean
  children: React.ReactNode
}) {
  return (
    <div className={cn('relative h-full w-full', isEditMode && 'rounded-[var(--r-lg)]')}
      style={isEditMode ? { outline: '1px dashed var(--accent-line)', outlineOffset: 2 } : undefined}
    >
      {isEditMode && (
        <button
          className="widget-drag-handle absolute top-2 right-2 z-30 inline-flex items-center gap-1.5 h-7 px-2 rounded-full text-[10px] font-mono uppercase tracking-[0.08em] cursor-grab active:cursor-grabbing"
          style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(6px)', border: '1px solid var(--accent-line)', color: 'var(--accent-deep)', touchAction: 'none' }}
          aria-label={`Drag ${title}`}
          title={`Drag ${title}`}
          onClick={e => e.preventDefault()}
        >
          <GripVertical className="w-[13px] h-[13px]" strokeWidth={1.8} /> Drag
        </button>
      )}
      <div className="h-full w-full overflow-hidden" style={{ borderRadius: 'var(--r-lg)' }}>
        {children}
      </div>
    </div>
  )
}
