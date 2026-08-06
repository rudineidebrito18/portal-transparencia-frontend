'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useCompetencias } from '../hooks/useCompetencias'

export default function CompetenciasListView() {
  const resource = useCompetencias()
  const origem = { label: 'Competências', href: '/competencias' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
