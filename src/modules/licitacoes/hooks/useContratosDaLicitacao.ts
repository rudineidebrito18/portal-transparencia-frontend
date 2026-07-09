'use client'

import { useCallback } from 'react'
import { usePageableResource } from '@/hooks/usePageableResource'
import { contratoLicitacaoService } from '../contrato.service'
import { ContratoLicitacao } from '../contrato.types'

export function useContratosDaLicitacao(licitacaoId: number) {
  const fetchFunction = useCallback(
    (params: { page?: number; size?: number; sort?: string }) =>
      contratoLicitacaoService.listarPorLicitacao(licitacaoId, params),
    [licitacaoId]
  )

  return usePageableResource<ContratoLicitacao, Record<string, never>>({
    fetchFunction,
    size: 10
  })
}
