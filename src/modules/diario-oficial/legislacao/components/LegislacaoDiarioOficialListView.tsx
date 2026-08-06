'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useLegislacaoDiarioOficial } from '../hooks/useLegislacaoDiarioOficial'

export default function LegislacaoDiarioOficialListView() {
  const resource = useLegislacaoDiarioOficial()
  const origem = { label: 'Diário Oficial', href: '/diario-oficial?categoria=legislacao' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
