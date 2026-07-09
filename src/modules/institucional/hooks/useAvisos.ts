'use client'

import { useCallback } from 'react'
import { usePageableResource } from '@/hooks/usePageableResource'
import { avisoService } from '../institucional.service'
import { ConteudoInstitucional } from '../types'

export function useAvisos() {
  const fetchFunction = useCallback(
    (params: { page?: number; size?: number; sort?: string }) =>
      avisoService.listar({ ...params, ativo: true }),
    []
  )

  return usePageableResource<ConteudoInstitucional, Record<string, never>>({
    fetchFunction,
    initialSort: 'data,desc',
    size: 10
  })
}
