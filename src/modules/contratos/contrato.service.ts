import { Page } from '@/modules/shared/types/Page'
import { Documento } from '@/modules/shared/types/Documento'
import { api } from '@/services/api'
import { urlArquivoDocumento } from '@/utils/documento'
import { contratoMock } from './mocks/contrato.mock'
import { Aditivo, ContratoLicitacao, FiltroContrato } from './types'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

type ListarTodosParams = FiltroContrato & ListarParams

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

  listarTodos(params: ListarTodosParams): Promise<Page<ContratoLicitacao>> {
    if (USE_MOCK) return contratoMock.listarTodos(params)

    return api
      .get<Page<ContratoLicitacao>>('/licitacoes/contratos/filtro', { params })
      .then(response => response.data)
  },

  // Contratos que têm pelo menos um aditivo — usado pela listagem pública de Aditivos de
  // Contratos (lista contratos, não os aditivos soltos; cada card já leva direto pro
  // contrato, cuja página de detalhes já mostra os aditivos dele).
  listarComAditivos(params: ListarTodosParams): Promise<Page<ContratoLicitacao>> {
    if (USE_MOCK) return contratoMock.listarComAditivos(params)

    return api
      .get<Page<ContratoLicitacao>>('/licitacoes/contratos/com-aditivos', { params })
      .then(response => response.data)
  },

  listarDocumentos(contratoId: number): Promise<Documento[]> {
    if (USE_MOCK) return contratoMock.listarDocumentos(contratoId)

    return api
      .get<Documento[]>(`/licitacoes/contratos/${contratoId}/documento`)
      .then(response => response.data)
  },

  // Backend agora sempre pagina esse GET — pedimos uma página grande porque
  // aditivos de um contrato são naturalmente poucos, não vale a pena paginar a UI.
  listarAditivos(contratoId: number): Promise<Aditivo[]> {
    if (USE_MOCK) return contratoMock.listarAditivos(contratoId)

    return api
      .get<Page<Aditivo>>('/licitacoes/contratos/aditivos', { params: { contratoLicitacaoId: contratoId, size: 100 } })
      .then(response => response.data.content)
  },

  urlDocumento(contratoId: number, documentoId: number): string {
    return urlArquivoDocumento(`licitacoes/contratos/${contratoId}/documento`, documentoId)
  },

  urlArquivoAditivo(id: number): string {
    return urlArquivoDocumento('licitacoes/contratos/aditivos', id)
  }
}
