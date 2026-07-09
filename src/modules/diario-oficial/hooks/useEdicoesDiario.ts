'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { diarioOficialService } from '../diario-oficial.service'
import { EdicaoDiario } from '../types'

export function useEdicoesDiario() {
  return usePageableResource<EdicaoDiario, Record<string, never>>({
    fetchFunction: diarioOficialService.listar,
    size: 10
  })
}
