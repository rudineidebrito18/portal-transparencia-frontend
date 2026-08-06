'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPrestacaoContas } from '../hooks/useDocumentosPrestacaoContas'
import { RecursoPrestacaoContas } from '../types'

interface Props {
  recurso: RecursoPrestacaoContas
}

export default function DocumentoListView({ recurso }: Props) {
  const resource = useDocumentosPrestacaoContas(recurso)
  const origem = { label: 'Prestação de Contas', href: `/prestacao-contas?categoria=${recurso}` }

  return <DocumentoGenericoListPanel {...resource} origem={origem} />
}
