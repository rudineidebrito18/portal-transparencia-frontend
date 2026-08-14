'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosPrestacaoContas } from '../hooks/useDocumentosPrestacaoContas'
import { RecursoPrestacaoContas } from '../types'

interface Props {
  recurso: RecursoPrestacaoContas
}

// Módulos "quase genéricos" com campo de exercício próprio (padrão V28/item 22 do backlog).
const RECURSOS_COM_EXERCICIO: RecursoPrestacaoContas[] = ['parecer-previo', 'julgamento-contas-tce']

export default function DocumentoListView({ recurso }: Props) {
  const resource = useDocumentosPrestacaoContas(recurso)
  const origem = { label: 'Prestação de Contas', href: `/prestacao-contas?categoria=${recurso}` }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem}
      comExercicio={RECURSOS_COM_EXERCICIO.includes(recurso)}
    />
  )
}
