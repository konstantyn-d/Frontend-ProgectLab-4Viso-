/**
 * Companies service — carriers/handlers with their GDP verification and
 * capabilities, used by the route builder for assignment + warnings.
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { CompanyRow, CertificationRow, CompanyType } from '@/lib/supabase/types'

export interface CompanyVM {
  id: string
  name: string
  type: CompanyType
  supportedModes: string[]
  temperatureCapabilities: string[]
  securityLevel: string | null
  gdpStatus: 'valid' | 'expired' | 'claimed' | 'missing'
  gdpVerified: boolean
}

const DEMO: CompanyVM[] = [
  { id: 'd-dhl', name: 'DHL Express', type: 'carrier', supportedModes: ['air', 'road'], temperatureCapabilities: ['2-8', '15-25'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-lh', name: 'Lufthansa Cargo', type: 'carrier', supportedModes: ['air'], temperatureCapabilities: ['2-8', '15-25', 'frozen'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-maersk', name: 'Maersk Line', type: 'carrier', supportedModes: ['sea'], temperatureCapabilities: ['15-25', 'ambient'], securityLevel: 'medium', gdpStatus: 'expired', gdpVerified: false },
  { id: 'd-emirates', name: 'Emirates SkyCargo', type: 'carrier', supportedModes: ['air'], temperatureCapabilities: ['2-8', '15-25'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-swiss', name: 'Swiss WorldCargo', type: 'carrier', supportedModes: ['air'], temperatureCapabilities: ['2-8', 'frozen'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-klm', name: 'KLM Cargo', type: 'carrier', supportedModes: ['air'], temperatureCapabilities: ['2-8'], securityLevel: 'medium', gdpStatus: 'claimed', gdpVerified: false },
  { id: 'd-af', name: 'Air France Cargo', type: 'carrier', supportedModes: ['air'], temperatureCapabilities: ['2-8', '15-25'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-fedex', name: 'FedEx Express', type: 'carrier', supportedModes: ['air', 'road'], temperatureCapabilities: ['2-8', '15-25'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-rtm', name: 'Rotterdam Port Operator', type: 'port_operator', supportedModes: ['sea'], temperatureCapabilities: ['2-8', 'ambient'], securityLevel: 'high', gdpStatus: 'valid', gdpVerified: true },
  { id: 'd-shacb', name: 'Shanghai Customs Broker', type: 'customs_broker', supportedModes: ['sea'], temperatureCapabilities: ['ambient'], securityLevel: 'low', gdpStatus: 'missing', gdpVerified: false },
]

export async function getCompanies(): Promise<CompanyVM[]> {
  if (!isSupabaseConfigured()) return DEMO
  const sb = getSupabase()!
  const [{ data: companies, error }, { data: certs }] = await Promise.all([
    sb.from('companies').select('*').order('name'),
    sb.from('certifications').select('company_id, type, status, verified_by_validator_id'),
  ])
  if (error) throw new Error(error.message)
  const gdpByCompany = new Map<string, { status: string; verified: boolean }>()
  for (const c of (certs as Pick<CertificationRow, 'company_id' | 'type' | 'status' | 'verified_by_validator_id'>[] ?? [])) {
    if (c.type !== 'GDP' || !c.company_id) continue
    gdpByCompany.set(c.company_id, { status: c.status, verified: Boolean(c.verified_by_validator_id) })
  }
  return (companies as CompanyRow[] ?? []).map(c => {
    const gdp = gdpByCompany.get(c.id)
    return {
      id: c.id,
      name: c.name,
      type: c.type,
      supportedModes: c.supported_modes ?? [],
      temperatureCapabilities: c.temperature_capabilities ?? [],
      securityLevel: c.security_level,
      gdpStatus: (gdp?.status as CompanyVM['gdpStatus']) ?? 'missing',
      gdpVerified: gdp?.verified ?? false,
    }
  })
}

/** Warnings for assigning a company to a pharma cold-chain node. */
export function companyWarnings(c: CompanyVM, requiresColdChain: boolean): string[] {
  const w: string[] = []
  if (c.gdpStatus === 'missing') w.push('No GDP certificate on record')
  else if (c.gdpStatus === 'expired') w.push('GDP certificate has expired')
  else if (!c.gdpVerified) w.push('GDP certificate is claimed but not validator-verified')
  if (requiresColdChain && !c.temperatureCapabilities.includes('2-8')) w.push('No 2–8°C temperature capability')
  if (c.securityLevel === 'low') w.push('Low security level for high-value pharma')
  return w
}
