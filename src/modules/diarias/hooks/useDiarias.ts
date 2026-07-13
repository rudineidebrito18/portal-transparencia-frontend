'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { diariaService } from '../diaria.service'
import { Diaria, FiltroDiaria } from '../types'

export function useDiarias() {
  return usePageableResource<Diaria, FiltroDiaria>({
    fetchFunction: diariaService.listar,
    initialSort: 'dataInicio,desc',
    size: 10
  })
}
