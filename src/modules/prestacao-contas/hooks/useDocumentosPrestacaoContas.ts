'use client'

import { useCallback } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import { prestacaoContasService } from '../prestacaoContas.service'
import { DocumentoPrestacaoContas, FiltroDocumentoPrestacaoContas, RecursoPrestacaoContas } from '../types'

export function useDocumentosPrestacaoContas(recurso: RecursoPrestacaoContas) {
  const fetchFunction = useCallback(
    (params: FiltroDocumentoPrestacaoContas & { page?: number; size?: number; sort?: string }) =>
      prestacaoContasService.listar(recurso, params),
    [recurso]
  )

  return usePageableResource<DocumentoPrestacaoContas, FiltroDocumentoPrestacaoContas>({
    fetchFunction,
    initialSort: 'data,desc',
    size: 10
  })
}
