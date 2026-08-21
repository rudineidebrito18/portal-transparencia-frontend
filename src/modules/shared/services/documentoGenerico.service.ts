import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { urlArquivoDocumento } from '@/utils/documento'
import { Page } from '../types/Page'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../types/DocumentoGenerico'

export type ListarParams = FiltroDocumentoGenerico & {
  page?: number
  size?: number
  sort?: string
}

// Reaproveitado por qualquer domínio cujos sub-recursos batam no padrão
// GET /{basePath}/{recurso}/filtro do backend (ex: prestacao-contas, planejamento).
export function criarServicoDocumentoGenerico<TRecurso extends string>(basePath: string) {
  return {
    listar(recurso: TRecurso, params: ListarParams): Promise<Page<DocumentoGenerico>> {
      return api
        .get<Page<DocumentoGenerico>>(`/${basePath}/${recurso}/filtro`, { params })
        .then(response => response.data)
    },

    // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
    // Fase 4) — usa backendFetch em vez da instância axios `api` (pensada pro browser). NUNCA
    // chamar a partir de um 'use client'.
    listarServidor(recurso: TRecurso, params: ListarParams): Promise<Page<DocumentoGenerico>> {
      return backendFetch<Page<DocumentoGenerico>>(`/${basePath}/${recurso}/filtro`, { params })
    },

    urlArquivo(recurso: TRecurso, id: number): string {
      return urlArquivoDocumento(`${basePath}/${recurso}`, id)
    }
  }
}
