'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { tabelaValoresService } from '../tabelaValores.service'
import { FiltroTabelaValores, TabelaValores } from '../types'

export function useTabelaValores() {
  return usePageableResource<TabelaValores, FiltroTabelaValores>({
    fetchFunction: tabelaValoresService.listar,
    initialSort: 'data,desc',
    size: 10
  })
}
