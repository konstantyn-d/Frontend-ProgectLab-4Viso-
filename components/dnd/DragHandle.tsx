'use client'

import { forwardRef } from 'react'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Subtle, accessible drag handle. The ONLY draggable area of an item —
 * spread dnd-kit `listeners`/`attributes` onto it. Disabled handles render
 * muted and non-interactive (e.g. locked origin/destination nodes).
 */
export const DragHandle = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { disabled?: boolean }>(
  function DragHandle({ disabled, className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={disabled ? 'Locked — cannot reorder' : 'Drag to reorder'}
        title={disabled ? 'Locked' : 'Drag to reorder'}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center w-6 h-7 rounded-[6px] shrink-0 transition-colors',
          disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:bg-[var(--secondary)]',
          className,
        )}
        style={{ color: 'var(--muted-foreground)', touchAction: 'none' }}
        {...props}
      >
        <GripVertical className="w-[15px] h-[15px]" strokeWidth={1.6} />
      </button>
    )
  },
)
