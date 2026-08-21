'use client'

import { DocumentoGenericoControlesBase } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { saudeService } from '../saude.service'
import { RecursoSaude } from '../types'

interface Props {
  recurso: RecursoSaude
  comExercicio?: boolean
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
  nomeBaseArquivo: string
}

export default function SaudeControles({ recurso, ...props }: Props) {
  return (
    <DocumentoGenericoControlesBase
      {...props}
      aoExportar={params => saudeService.listar(recurso, params)}
    />
  )
}
