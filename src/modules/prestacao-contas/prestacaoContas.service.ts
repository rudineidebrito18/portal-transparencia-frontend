import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { prestacaoContasMock } from './mocks/prestacaoContas.mock'
import { DocumentoPrestacaoContas, FiltroDocumentoPrestacaoContas, RecursoPrestacaoContas } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroDocumentoPrestacaoContas & {
  page?: number
  size?: number
  sort?: string
}

export const prestacaoContasService = {
  listar(recurso: RecursoPrestacaoContas, params: ListarParams): Promise<Page<DocumentoPrestacaoContas>> {
    if (USE_MOCK) return prestacaoContasMock.listar(recurso, params)

    return api
      .get<Page<DocumentoPrestacaoContas>>(`/prestacao-contas/${recurso}/filtro`, { params })
      .then(response => response.data)
  }
}
