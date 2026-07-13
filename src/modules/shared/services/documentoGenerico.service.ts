import { api } from '@/services/api'
import { Page } from '../types/Page'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../types/DocumentoGenerico'

type ListarParams = FiltroDocumentoGenerico & {
  page?: number
  size?: number
  sort?: string
}

interface MockDocumentoGenerico<TRecurso extends string> {
  listar(recurso: TRecurso, params: ListarParams): Promise<Page<DocumentoGenerico>>
}

// Reaproveitado por qualquer domínio cujos sub-recursos batam no padrão
// GET /{basePath}/{recurso}/filtro do backend (ex: prestacao-contas, planejamento).
export function criarServicoDocumentoGenerico<TRecurso extends string>(
  basePath: string,
  mock: MockDocumentoGenerico<TRecurso>
) {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

  return {
    listar(recurso: TRecurso, params: ListarParams): Promise<Page<DocumentoGenerico>> {
      if (USE_MOCK) return mock.listar(recurso, params)

      return api
        .get<Page<DocumentoGenerico>>(`/${basePath}/${recurso}/filtro`, { params })
        .then(response => response.data)
    }
  }
}
