/**
 * Demo fallback source of truth.
 *
 * When Supabase is not configured, every service returns data from here so
 * the app behaves exactly as the original demo. These adapters reshape the
 * bundled `lib/mock-data.ts` into the service view-models. Extended as each
 * service is added.
 */
import {
  mockLanes,
  mockShipments,
  mockAuditLog,
  mockPorts,
  type Lane,
  type Shipment,
  type AuditLogEntry,
  type Port,
} from '@/lib/mock-data'

export function demoLanes(): Lane[] {
  return mockLanes
}

export function demoShipments(): Shipment[] {
  return mockShipments
}

export function demoAuditLog(): AuditLogEntry[] {
  return mockAuditLog
}

export function demoPorts(): Port[] {
  return mockPorts
}
