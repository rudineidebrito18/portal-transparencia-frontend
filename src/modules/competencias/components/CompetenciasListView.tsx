'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useCompetencias } from '../hooks/useCompetencias'

export default function CompetenciasListView() {
  const resource = useCompetencias()

  return <DocumentoGenericoListPanel {...resource} />
}
