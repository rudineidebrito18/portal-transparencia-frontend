'use client'

import { useCallback } from 'react'
import { usePageableResource } from '@/hooks/usePageableResource'
import { noticiaService } from '../institucional.service'
import { ConteudoInstitucional, FiltroConteudoInstitucional } from '../types'

export function useNoticias() {
  const fetchFunction = useCallback(
    (params: FiltroConteudoInstitucional & { page?: number; size?: number; sort?: string }) =>
      noticiaService.listar({ ...params, ativo: true }),
    []
  )

  return usePageableResource<ConteudoInstitucional, FiltroConteudoInstitucional>({
    fetchFunction,
    initialSort: 'data,desc',
    size: 10
  })
}
