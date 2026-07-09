import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { licitacaoMock } from './mocks/licitacao.mock'
import { FiltroLicitacao, LicitacaoDetalhe, LicitacaoResumo } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = FiltroLicitacao & {
  page?: number
  size?: number
  sort?: string
}

export const licitacaoService = {
  listar(params: ListarParams): Promise<Page<LicitacaoResumo>> {
    if (USE_MOCK) return licitacaoMock.listar(params)

    return api
      .get<Page<LicitacaoResumo>>('/licitacoes/buscar', { params })
      .then(response => response.data)
  },

  buscarPorId(id: number): Promise<LicitacaoDetalhe> {
    if (USE_MOCK) return licitacaoMock.buscarPorId(id)

    return api
      .get<LicitacaoDetalhe>(`/licitacoes/${id}`)
      .then(response => response.data)
  }
}
