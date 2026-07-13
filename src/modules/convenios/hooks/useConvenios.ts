'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import {
  acordosFirmadosService,
  transferenciasRealizadasService,
  transferenciasRecebidasService
} from '../convenio.service'
import { ConvenioDocumento, FiltroConvenio } from '../types'

export function useTransferenciasRecebidas() {
  return usePageableResource<ConvenioDocumento, FiltroConvenio>({
    fetchFunction: transferenciasRecebidasService.listar,
    initialSort: 'data,desc',
    size: 10
  })
}

export function useTransferenciasRealizadas() {
  return usePageableResource<ConvenioDocumento, FiltroConvenio>({
    fetchFunction: transferenciasRealizadasService.listar,
    initialSort: 'data,desc',
    size: 10
  })
}

export function useAcordosFirmados() {
  return usePageableResource<ConvenioDocumento, FiltroConvenio>({
    fetchFunction: acordosFirmadosService.listar,
    initialSort: 'data,desc',
    size: 10
  })
}
