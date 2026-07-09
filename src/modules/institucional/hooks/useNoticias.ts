'use client'

import { useCallback } from 'react'
import { usePageableResource } from '@/hooks/usePageableResource'
import { noticiaService } from '../institucional.service'
import { ConteudoInstitucional } from '../types'

export function useNoticias() {
  const fetchFunction = useCallback(
    (params: { page?: number; size?: number; sort?: string }) =>
      noticiaService.listar({ ...params, ativo: true }),
    []
  )

  return usePageableResource<ConteudoInstitucional, Record<string, never>>({
    fetchFunction,
    initialSort: 'data,desc',
    size: 10
  })
}
