/**
 * Documents service. Supabase when configured, else demo fallback.
 * Supabase-Storage-ready: file_url is surfaced when present.
 */
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client'
import type { DocumentRow } from '@/lib/supabase/types'
import { mockDocuments } from '@/lib/mock-data'

export interface DocumentVM {
  id: string
  name: string
  meta: string
  fileUrl: string | null
}

const TYPE_LABEL: Record<string, string> = {
  GDP_certificate: 'GDP certificate',
  IATA_certificate: 'IATA certificate',
  ISO_certificate: 'ISO certificate',
  temperature_report: 'Temperature report',
  deviation_report: 'Deviation report',
  customs_document: 'Customs document',
  POD: 'Proof of delivery',
  compliance_report: 'Compliance report',
}

export async function getDocumentsForLane(laneCode: string): Promise<DocumentVM[]> {
  if (!isSupabaseConfigured()) {
    return mockDocuments.map(d => ({ id: d.id, name: d.name, meta: d.size, fileUrl: null }))
  }
  const sb = getSupabase()!
  const { data: laneRow } = await sb.from('lanes').select('id').eq('code', laneCode).maybeSingle()
  if (!laneRow) return []
  const laneId = (laneRow as { id: string }).id
  const { data, error } = await sb.from('documents').select('*').eq('lane_id', laneId).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data as DocumentRow[] ?? []).map(d => ({
    id: d.id,
    name: d.name,
    meta: TYPE_LABEL[d.type] ?? d.type,
    fileUrl: d.file_url,
  }))
}
