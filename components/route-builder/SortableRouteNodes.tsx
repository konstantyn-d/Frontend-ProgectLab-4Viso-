'use client'

import { DndContext, closestCenter, type DragEndEvent, type SensorDescriptor } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

/**
 * DnD context + vertical sortable list for route nodes. Pass the ordered
 * stable keys as `items` and the cards (each a SortableRouteNodeCard) as
 * children.
 */
export function SortableRouteNodes({
  items, sensors, onDragEnd, children,
}: {
  items: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sensors: SensorDescriptor<any>[]
  onDragEnd: (event: DragEndEvent) => void
  children: React.ReactNode
}) {
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2.5">{children}</div>
      </SortableContext>
    </DndContext>
  )
}
