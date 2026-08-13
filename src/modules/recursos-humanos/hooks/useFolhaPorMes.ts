'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { folhaService } from '../folha.service'
import { FiltroFolhaPagamento, FolhaPagamentoServidor } from '../types'

export function useFolhaPorMes() {
  return usePageableResource<FolhaPagamentoServidor, FiltroFolhaPagamento>({
    fetchFunction: folhaService.listarPorMes,
    // 'servidor.name' (não 'nomeServidor'): o sort do Pageable ordena contra a entidade
    // FolhaPagamento no backend, não o DTO — nomeServidor só existe depois do mapper.
    initialSort: 'servidor.name,asc',
    size: 15
  })
}
