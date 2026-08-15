'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useRegulamentacaoEsic } from '../hooks/useRegulamentacaoEsic'

export default function RegulamentacaoEsicListView() {
  const resource = useRegulamentacaoEsic()
  const origem = { label: 'E-SIC', href: '/esic' }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
