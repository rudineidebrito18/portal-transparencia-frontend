'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { diarioOficialService } from '../diario-oficial.service'
import { EdicaoDiario, FiltroEdicaoDiario } from '../types'

export function useEdicoesDiario() {
  return usePageableResource<EdicaoDiario, FiltroEdicaoDiario>({
    fetchFunction: diarioOficialService.listar,
    initialSort: 'dataPublicacao,desc',
    size: 10
  })
}
