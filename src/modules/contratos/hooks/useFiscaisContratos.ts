'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { contratoService } from '../contrato.service'
import { ContratoLicitacao, FiltroContrato } from '../types'

// Reaproveita o mesmo /licitacoes/contratos/filtro de sempre — "Fiscais de Contratos" é
// só uma reprojeção dos contratos já existentes, com o campo gestorContrato (que já é
// filtrável no backend, confirmado via curl) em destaque como "Nome do Fiscal", igual ao
// site de referência. Sem endpoint novo.
export function useFiscaisContratos() {
  return usePageableResource<ContratoLicitacao, FiltroContrato>({
    fetchFunction: contratoService.listarTodos,
    initialSort: 'gestorContrato,asc',
    size: 10
  })
}
