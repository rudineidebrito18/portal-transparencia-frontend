'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPrestacaoContas } from '../hooks/useDocumentosPrestacaoContas'

export default function PrestacaoContasAnosAnterioresListView() {
  const resource = useDocumentosPrestacaoContas('prestacao-contas-anos-anteriores')
  const origem = { label: 'Prestação de Contas — Anos Anteriores', href: '/prestacao-contas-anos-anteriores' }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem} />
  )
}
