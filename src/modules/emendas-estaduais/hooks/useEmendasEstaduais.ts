'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { emendaEstadualService } from '../emendaEstadual.service'
import { EmendaEstadual, FiltroEmendaEstadual } from '../types'

export function useEmendasEstaduais() {
  return usePageableResource<EmendaEstadual, FiltroEmendaEstadual>({
    fetchFunction: emendaEstadualService.listar,
    initialSort: 'atualizadoEm,desc',
    size: 10
  })
}
