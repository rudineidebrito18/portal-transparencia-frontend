'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPrestacaoContas } from '../hooks/useDocumentosPrestacaoContas'

export default function JulgamentoContasTceListView() {
  const resource = useDocumentosPrestacaoContas('julgamento-contas-tce')
  const origem = { label: 'Julgamento de Contas pelo TCE', href: '/julgamento-contas-tce' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem}
      comExercicio
    />
  )
}
