'use client'

import { useCallback } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import { Page } from '../types/Page'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../types/DocumentoGenerico'

type ListarParams = FiltroDocumentoGenerico & {
  page?: number
  size?: number
  sort?: string
}

interface ServicoDocumentoGenerico<TRecurso extends string> {
  listar(recurso: TRecurso, params: ListarParams): Promise<Page<DocumentoGenerico>>
  urlArquivo(recurso: TRecurso, id: number): string
}

export function criarUseDocumentosGenerico<TRecurso extends string>(
  service: ServicoDocumentoGenerico<TRecurso>
) {
  return function useDocumentosGenerico(recurso: TRecurso) {
    const fetchFunction = useCallback(
      (params: ListarParams) => service.listar(recurso, params),
      [recurso]
    )

    const resource = usePageableResource<DocumentoGenerico, FiltroDocumentoGenerico>({
      fetchFunction,
      initialSort: 'data,desc',
      size: 10
    })

    const urlArquivo = useCallback(
      (id: number) => service.urlArquivo(recurso, id),
      [recurso]
    )

    return { ...resource, urlArquivo }
  }
}
