import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { Page } from '../types/Page'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../types/DocumentoGenerico'

type ListarParams = FiltroDocumentoGenerico & {
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

    urlArquivo(recurso: TRecurso, id: number): string {
      return urlArquivoDocumento(`${basePath}/${recurso}`, id)
    }
  }
}
