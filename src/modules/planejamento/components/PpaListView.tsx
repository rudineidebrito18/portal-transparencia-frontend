'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPlanejamento } from '../hooks/useDocumentosPlanejamento'

export default function PpaListView() {
  const resource = useDocumentosPlanejamento('ppa')
  const origem = { label: 'Plano Plurianual (PPA)', href: '/ppa' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
