'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { licitacaoService } from '../licitacao.service'
import { FiltroLicitacao, LicitacaoResumo } from '../types'

export function useLicitacoes() {
  return usePageableResource<LicitacaoResumo, FiltroLicitacao>({
    fetchFunction: licitacaoService.listar,
    size: 10
  })
}
