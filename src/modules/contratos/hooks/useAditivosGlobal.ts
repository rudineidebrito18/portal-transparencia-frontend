'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { aditivoGlobalService } from '../aditivo.service'

export function useAditivosGlobal() {
  return usePageableResource({
    fetchFunction: aditivoGlobalService.listarTodos,
    initialSort: 'dataAssinatura,desc',
    size: 10
  })
}
