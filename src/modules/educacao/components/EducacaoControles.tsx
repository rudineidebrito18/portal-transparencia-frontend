'use client'

import { DocumentoGenericoControlesBase } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { educacaoService } from '../educacao.service'
import { RecursoEducacao } from '../types'

interface Props {
  recurso: RecursoEducacao
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
  nomeBaseArquivo: string
}

// Diferente dos módulos de recurso fixo (que usam a factory criarDocumentoGenericoControles):
// aqui o recurso vem da aba ativa, escolhida em tempo de render pelo Server Component pai — por
// isso usa DocumentoGenericoControlesBase direto, montando aoExportar com o recurso recebido
// via prop em vez de bindado num closure (que não daria pra variar por aba).
export default function EducacaoControles({ recurso, ...props }: Props) {
  return (
    <DocumentoGenericoControlesBase
      {...props}
      aoExportar={params => educacaoService.listar(recurso, params)}
    />
  )
}
