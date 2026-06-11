'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Role } from '@/lib/supabase/types'

interface RoleContextValue {
  role: Role
  setRole: (r: Role) => void
}

const RoleContext = createContext<RoleContextValue>({ role: 'admin', setRole: () => {} })

const STORAGE_KEY = 'pharmatrack-role'

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Role | null
    if (stored) setRoleState(stored)
  }, [])

  const setRole = (r: Role) => {
    setRoleState(r)
    localStorage.setItem(STORAGE_KEY, r)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
