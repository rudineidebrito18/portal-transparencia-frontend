'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { cargoService } from '../cargo.service'
import { Cargo, FiltroCargo } from '../types'

export function useCargos() {
  return usePageableResource<Cargo, FiltroCargo>({
    fetchFunction: cargoService.listar,
    initialSort: 'cargo,asc',
    size: 10
  })
}
