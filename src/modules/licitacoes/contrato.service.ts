import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { ContratoLicitacao } from './contrato.types'
import { licitacaoMock } from './mocks/licitacao.mock'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

export const contratoLicitacaoService = {
  listarPorLicitacao(licitacaoId: number, params: ListarParams): Promise<Page<ContratoLicitacao>> {
    if (USE_MOCK) return licitacaoMock.listarContratos(licitacaoId, params)

    return api
      .get<Page<ContratoLicitacao>>(`/licitacoes/${licitacaoId}/contratos`, { params })
      .then(response => response.data)
  }
}
