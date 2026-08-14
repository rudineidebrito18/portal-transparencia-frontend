'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPrestacaoContas } from '../hooks/useDocumentosPrestacaoContas'

export default function JulgamentoContasLegislativoListView() {
  const resource = useDocumentosPrestacaoContas('julgamento-contas-legislativo')
  const origem = { label: 'Julgamento de Contas (Legislativo)', href: '/julgamento-contas-legislativo' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
