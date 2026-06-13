'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import { toast } from 'sonner'
import {
  cloneDefaultLayout,
  defaultDashboardLayout,
  DASHBOARD_WIDGETS,
} from '@/lib/config/defaultDashboardLayout'
import {
  getDashboardLayout,
  saveDashboardLayout,
  resetDashboardLayout,
} from '@/lib/services/dashboardLayoutService'

/** Ensure every known widget exists in the layout (forward-compatible). */
function normalize(layouts: ResponsiveLayouts | null): ResponsiveLayouts {
  const base = cloneDefaultLayout()
  if (!layouts?.lg) return base
  const lg: LayoutItem[] = [...layouts.lg]
  const present = new Set(lg.map(l => l.i))
  for (const w of DASHBOARD_WIDGETS) {
    if (!present.has(w.id)) {
      const def = base.lg?.find(l => l.i === w.id)
      if (def) lg.push(def)
    }
  }
  return { ...layouts, lg }
}

export function useDashboardLayout() {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => cloneDefaultLayout())
  const [draftLayouts, setDraftLayouts] = useState<ResponsiveLayouts>(() => cloneDefaultLayout())
  const [isEditMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getDashboardLayout()
      .then(saved => { if (active) setLayouts(normalize(saved)) })
      .catch(() => { if (active) setLayouts(cloneDefaultLayout()) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const enterEdit = useCallback(() => {
    setDraftLayouts(JSON.parse(JSON.stringify(layouts)))
    setEditMode(true)
  }, [layouts])

  const cancelEdit = useCallback(() => {
    setDraftLayouts(JSON.parse(JSON.stringify(layouts)))
    setEditMode(false)
  }, [layouts])

  // RGL fires this continuously while dragging — only mutate the local draft.
  const onLayoutChange = useCallback((_current: Layout, all: ResponsiveLayouts) => {
    setDraftLayouts(all)
  }, [])

  const save = useCallback(async () => {
    setSaving(true)
    try {
      await saveDashboardLayout(draftLayouts)
      setLayouts(draftLayouts)
      setEditMode(false)
      toast.success('Dashboard layout saved')
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      // localStorage still persisted even if the cloud write failed.
      setLayouts(draftLayouts)
      setEditMode(false)
      if (msg.startsWith('cloud-unavailable')) toast.success('Layout saved locally (run migration 004 for cloud sync)')
      else toast.error('Could not save layout')
    } finally { setSaving(false) }
  }, [draftLayouts])

  const resetToDefault = useCallback(async () => {
    const def = cloneDefaultLayout()
    setDraftLayouts(def)
    setLayouts(def)
    setEditMode(false)
    try { await resetDashboardLayout() } catch { /* ignore */ }
    toast.success('Dashboard layout reset to default')
  }, [])

  return {
    layouts: isEditMode ? draftLayouts : layouts,
    isEditMode,
    loading,
    saving,
    enterEdit,
    cancelEdit,
    onLayoutChange,
    save,
    resetToDefault,
    defaultLayout: defaultDashboardLayout,
  }
}
