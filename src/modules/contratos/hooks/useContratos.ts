'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { contratoService } from '../contrato.service'
import { ContratoLicitacao } from '../types'

export function useContratos() {
  return usePageableResource<ContratoLicitacao>({
    fetchFunction: contratoService.listarTodos,
    initialSort: 'dataPublicacao,desc',
    size: 10
  })
}
