import { Page } from '@/modules/shared/types/Page'
import { Documento } from '@/modules/shared/types/Documento'
import { api } from '@/services/api'
import { contratoMock } from './mocks/contrato.mock'
import { Aditivo, ContratoLicitacao } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

export const contratoService = {
  buscarPorId(id: number): Promise<ContratoLicitacao> {
    if (USE_MOCK) return contratoMock.buscarPorId(id)

    return api
      .get<ContratoLicitacao>(`/licitacoes/contratos/${id}`)
      .then(response => response.data)
  },

  listarPorLicitacao(licitacaoId: number, params: ListarParams): Promise<Page<ContratoLicitacao>> {
    if (USE_MOCK) return contratoMock.listarPorLicitacao(licitacaoId, params)

    return api
      .get<Page<ContratoLicitacao>>(`/licitacoes/${licitacaoId}/contratos`, { params })
      .then(response => response.data)
  },

  listarDocumentos(contratoId: number): Promise<Documento[]> {
    if (USE_MOCK) return contratoMock.listarDocumentos(contratoId)

    return api
      .get<Documento[]>(`/licitacoes/contratos/${contratoId}/documento`)
      .then(response => response.data)
  },

  listarAditivos(contratoId: number): Promise<Aditivo[]> {
    if (USE_MOCK) return contratoMock.listarAditivos(contratoId)

    return api
      .get<Aditivo[]>('/licitacoes/contratos/aditivos', { params: { contratoLicitacaoId: contratoId } })
      .then(response => response.data)
  }
}
