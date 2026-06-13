'use client'

import { useMemo } from 'react'
import {
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

/**
 * Encapsulates the route-node sortable behaviour:
 * - pointer + keyboard sensors (pointer requires a small drag to start so
 *   clicks on inner inputs/dropdowns aren't hijacked)
 * - origin/destination locking (first/last by default)
 * - reorder with sequence-safe clamping
 *
 * Items must expose a stable string key (`__key`).
 */
export function useRouteNodesDnd<T extends { __key: string }>(
  nodes: T[],
  onReorder: (next: T[]) => void,
  opts: { lockFirst?: boolean; lockLast?: boolean } = { lockFirst: true, lockLast: true },
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const lockedKeys = useMemo(() => {
    const s = new Set<string>()
    if (opts.lockFirst && nodes.length > 0) s.add(nodes[0].__key)
    if (opts.lockLast && nodes.length > 1) s.add(nodes[nodes.length - 1].__key)
    return s
  }, [nodes, opts.lockFirst, opts.lockLast])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    // A locked node can never move, and nothing may take a locked slot.
    if (lockedKeys.has(String(active.id)) || lockedKeys.has(String(over.id))) return

    const oldIndex = nodes.findIndex(n => n.__key === active.id)
    let newIndex = nodes.findIndex(n => n.__key === over.id)
    if (oldIndex < 0 || newIndex < 0) return

    // Keep movable nodes strictly between locked endpoints.
    const min = opts.lockFirst ? 1 : 0
    const max = opts.lockLast ? nodes.length - 2 : nodes.length - 1
    newIndex = Math.min(Math.max(newIndex, min), max)
    if (newIndex === oldIndex) return

    onReorder(arrayMove(nodes, oldIndex, newIndex))
  }

  return { sensors, handleDragEnd, lockedKeys }
}
