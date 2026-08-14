'use client'

import DocumentoGenericoListPanel from '@/modules/shared/components/documento-generico/DocumentoGenericoListPanel'
import { useDocumentosSaude } from '../hooks/useDocumentosSaude'
import { RecursoSaude } from '../types'

interface Props {
  recurso: RecursoSaude
}

// Módulos "quase genéricos" com campo de exercício próprio (padrão V28/item 23 do backlog).
const RECURSOS_COM_EXERCICIO: RecursoSaude[] = ['planos', 'relatorios']

export default function DocumentoListView({ recurso }: Props) {
  const resource = useDocumentosSaude(recurso)
  const origem = { label: 'Saúde', href: `/saude?categoria=${recurso}` }

  return (
    <DocumentoGenericoListPanel
      {...resource}
      origem={origem}
      comExercicio={RECURSOS_COM_EXERCICIO.includes(recurso)}
    />
  )
}
