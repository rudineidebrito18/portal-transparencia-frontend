import { Page } from '@/modules/shared/types/Page'
import { Documento } from '@/modules/shared/types/Documento'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { urlArquivoDocumento } from '@/utils/documento'
import { Aditivo, ContratoLicitacao, FiltroContrato } from './types'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

type ListarTodosParams = FiltroContrato & ListarParams

export const contratoService = {
  buscarPorId(id: number): Promise<ContratoLicitacao> {
    return api
      .get<ContratoLicitacao>(`/licitacoes/contratos/${id}`)
      .then(response => response.data)
  },

  listarPorLicitacao(licitacaoId: number, params: ListarParams): Promise<Page<ContratoLicitacao>> {
    return api
      .get<Page<ContratoLicitacao>>(`/licitacoes/${licitacaoId}/contratos`, { params })
      .then(response => response.data)
  },

  listarTodos(params: ListarTodosParams): Promise<Page<ContratoLicitacao>> {
    return api
      .get<Page<ContratoLicitacao>>('/licitacoes/contratos/filtro', { params })
      .then(response => response.data)
  },

  // Mesmo endpoint do listarTodos() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. Usado tanto por Contratos quanto
  // por Fiscais de Contratos (reprojeção do mesmo endpoint). NUNCA chamar de um 'use client'.
  listarTodosServidor(params: ListarTodosParams): Promise<Page<ContratoLicitacao>> {
    return backendFetch<Page<ContratoLicitacao>>('/licitacoes/contratos/filtro', { params })
  },

  // Contratos que têm pelo menos um aditivo — usado pela listagem pública de Aditivos de
  // Contratos (lista contratos, não os aditivos soltos; cada card já leva direto pro
  // contrato, cuja página de detalhes já mostra os aditivos dele).
  listarComAditivos(params: ListarTodosParams): Promise<Page<ContratoLicitacao>> {
    return api
      .get<Page<ContratoLicitacao>>('/licitacoes/contratos/com-aditivos', { params })
      .then(response => response.data)
  },

  // Mesmo endpoint do listarComAditivos() acima, via backendFetch — usado pelo Server Component.
  listarComAditivosServidor(params: ListarTodosParams): Promise<Page<ContratoLicitacao>> {
    return backendFetch<Page<ContratoLicitacao>>('/licitacoes/contratos/com-aditivos', { params })
  },

  listarDocumentos(contratoId: number): Promise<Documento[]> {
    return api
      .get<Documento[]>(`/licitacoes/contratos/${contratoId}/documento`)
      .then(response => response.data)
  },

  // Backend agora sempre pagina esse GET — pedimos uma página grande porque
  // aditivos de um contrato são naturalmente poucos, não vale a pena paginar a UI.
  listarAditivos(contratoId: number): Promise<Aditivo[]> {
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
