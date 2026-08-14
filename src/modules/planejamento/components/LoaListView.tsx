'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPlanejamento } from '../hooks/useDocumentosPlanejamento'

export default function LoaListView() {
  const resource = useDocumentosPlanejamento('loa')
  const origem = { label: 'Lei Orçamentária Anual (LOA)', href: '/loa' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
