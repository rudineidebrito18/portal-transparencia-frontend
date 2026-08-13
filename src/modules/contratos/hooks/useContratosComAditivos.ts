'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { contratoService } from '../contrato.service'
import { ContratoLicitacao, FiltroContrato } from '../types'

export function useContratosComAditivos() {
  return usePageableResource<ContratoLicitacao, FiltroContrato>({
    fetchFunction: contratoService.listarComAditivos,
    initialSort: 'dataAssinatura,desc',
    size: 10
  })
}
