'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { obraService } from '../obra.service'
import { FiltroObraPublica, ObraPublica } from '../types'

export function useObras() {
  return usePageableResource<ObraPublica, FiltroObraPublica>({
    fetchFunction: obraService.listar,
    initialSort: 'numero,desc',
    size: 10
  })
}
