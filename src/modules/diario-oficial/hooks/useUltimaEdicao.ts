'use client'

import { useAsyncData } from '@/hooks/useAsyncData'
import { diarioOficialService } from '../diario-oficial.service'
import { EdicaoDiario } from '../types'

// Sempre a edição mais recente publicada, independente de qualquer filtro
// aplicado na listagem — por isso busca separada, não reaproveita useEdicoesDiario.
export function useUltimaEdicao() {
  return useAsyncData<EdicaoDiario | null>(
    async () => {
      const pagina = await diarioOficialService.listar({ page: 0, size: 1, sort: 'dataPublicacao,desc' })
      return pagina.content[0] ?? null
    },
    [],
    null
  )
}
