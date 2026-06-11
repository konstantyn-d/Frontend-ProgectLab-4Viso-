/**
 * Frontend role-based permissions (UI gating). Mirrors the role model in
 * the schema. The MVP gates write actions in the UI; RLS guards the DB.
 */
import type { Role } from '@/lib/supabase/types'

export type Permission =
  | 'edit_lane'
  | 'edit_route'
  | 'update_shipment'
  | 'resolve_alert'
  | 'verify_cert'
  | 'generate_report'
  | 'view_audit'

const MATRIX: Record<Role, Permission[]> = {
  admin: ['edit_lane', 'edit_route', 'update_shipment', 'resolve_alert', 'verify_cert', 'generate_report', 'view_audit'],
  operations_manager: ['edit_lane', 'edit_route', 'update_shipment', 'resolve_alert', 'generate_report'],
  compliance_officer: ['resolve_alert', 'verify_cert', 'generate_report', 'view_audit'],
  validator: ['verify_cert', 'view_audit'],
  viewer: [],
}

export function can(role: Role, action: Permission): boolean {
  return MATRIX[role]?.includes(action) ?? false
}

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  operations_manager: 'Operations Manager',
  compliance_officer: 'Compliance Officer',
  validator: 'Validator',
  viewer: 'Viewer (read-only)',
}
