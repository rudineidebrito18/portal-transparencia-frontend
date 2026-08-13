'use client'

import { useCallback } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import { tabelaValoresService } from '../tabelaValores.service'
import { FiltroTabelaValores, TabelaValores, TipoViagem } from '../types'

// `tipoViagem` vem da aba ativa (Nacional/Internacional), não do formulário de filtro —
// é forçado aqui em cima do que a URL já traz, então a aba nunca pode ser sobrescrita
// por um filtro salvo/compartilhado antigo com o outro tipo.
export function useTabelaValores(tipoViagem: TipoViagem) {
  // usePageableResource refaz a busca sempre que `fetchFunction` muda de referência —
  // sem useCallback, essa arrow function seria recriada a cada render e entraria em
  // loop de fetch (a listagem "piscando" sem parar).
  const fetchFunction = useCallback(
    (params: FiltroTabelaValores & { page?: number; size?: number; sort?: string }) =>
      tabelaValoresService.listar({ ...params, tipoViagem }),
    [tipoViagem]
  )

  return usePageableResource<TabelaValores, FiltroTabelaValores>({
    fetchFunction,
    initialSort: 'data,desc',
    size: 10
  })
}
