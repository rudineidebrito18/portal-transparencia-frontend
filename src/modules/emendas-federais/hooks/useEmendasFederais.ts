'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { emendaFederalService } from '../emendaFederal.service'
import { EmendaFederal, FiltroEmendaFederal } from '../types'

export function useEmendasFederais() {
  return usePageableResource<EmendaFederal, FiltroEmendaFederal>({
    fetchFunction: emendaFederalService.listar,
    initialSort: 'atualizadoEm,desc',
    size: 10
  })
}
