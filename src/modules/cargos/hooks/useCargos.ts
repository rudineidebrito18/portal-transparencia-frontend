'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { cargoService } from '../cargo.service'

export function useCargos() {
  return useAsyncData(() => cargoService.listar(), [], [])
}
