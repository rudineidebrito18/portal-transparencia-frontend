'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPlanejamento } from '../hooks/useDocumentosPlanejamento'

export default function LdoListView() {
  const resource = useDocumentosPlanejamento('ldo')
  const origem = { label: 'Lei de Diretrizes Orçamentárias (LDO)', href: '/ldo' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
