'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { DragHandle } from '@/components/dnd/DragHandle'

/**
 * Sortable wrapper around a single route-node card. Only the DragHandle is
 * draggable, so the inner inputs/dropdowns stay clickable. Locked nodes
 * (origin/destination) render a disabled handle and cannot move.
 */
export function SortableRouteNodeCard({
  id, locked, children,
}: {
  id: string
  locked: boolean
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled: locked })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isDragging ? 0.96 : 1,
    zIndex: isDragging ? 20 : undefined,
    boxShadow: isDragging ? 'var(--shadow-2)' : undefined,
    position: 'relative',
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-1.5">
      <div className="pt-3">
        <DragHandle disabled={locked} {...attributes} {...(locked ? {} : listeners)} />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
