'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPlanejamento } from '../hooks/useDocumentosPlanejamento'

export default function PlanoEstrategicoListView() {
  const resource = useDocumentosPlanejamento('plano-estrategico')
  const origem = { label: 'Plano Estratégico Institucional (PEI)', href: '/plano-estrategico' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
