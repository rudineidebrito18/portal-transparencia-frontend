'use client'

import { useCallback } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import { diarioOficialService } from '../diario-oficial.service'
import { EdicaoDiario, FiltroEdicaoDiario, ResultadoBuscaEdicaoDiario } from '../types'

type ParamsFetch = FiltroEdicaoDiario & {
  page?: number
  size?: number
  sort?: string
}

export function useEdicoesDiario() {
  // useCallback com dependências vazias: o fetchFunction precisa ser uma referência
  // estável, senão o useEffect de usePageableResource (que o inclui nas dependências)
  // dispara um refetch a cada render — loop que faz a listagem piscar entre skeleton
  // e dados (bug visual observado na aba Edições).
  const fetchFunction = useCallback((params: ParamsFetch) => {
    const termo = params.termo?.trim()

    // Com termo preenchido, a listagem vira busca por palavra-chave no conteúdo
    // (Meilisearch) — endpoint dedicado, que não combina com os filtros estruturados.
    if (termo) {
      return diarioOficialService.buscarPorTexto(termo, params.page ?? 0, params.size ?? 10)
    }

    return diarioOficialService.listar(params)
  }, [])

  return usePageableResource<EdicaoDiario | ResultadoBuscaEdicaoDiario, FiltroEdicaoDiario>({
    fetchFunction,
    initialSort: 'dataPublicacao,desc',
    size: 10
  })
}
