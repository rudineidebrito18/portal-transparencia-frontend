'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useLegislacao } from '../hooks/useLegislacao'

export default function LegislacaoListView() {
  const resource = useLegislacao()

  return <DocumentoGenericoListPanel {...resource} />
}
