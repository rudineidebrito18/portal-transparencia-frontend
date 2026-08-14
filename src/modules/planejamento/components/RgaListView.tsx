'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPlanejamento } from '../hooks/useDocumentosPlanejamento'

export default function RgaListView() {
  const resource = useDocumentosPlanejamento('rga')
  const origem = { label: 'Relatório de Gestão ou Atividade (RGA)', href: '/rga' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
