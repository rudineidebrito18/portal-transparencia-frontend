import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { LicitacaoDetalhe, LicitacaoResumo } from '@/modules/licitacoes/types'
import { DocumentoUploadRequest, Documento, FiltroLicitacaoAdmin, LicitacaoOrgao, LicitacaoOrgaoRequest, LicitacaoRequest } from './types'

const BASE = '/licitacoes'

type ListarParams = FiltroLicitacaoAdmin & {
  page?: number
  size?: number
  sort?: string
}

function montarFormDataDocumento(dados: DocumentoUploadRequest, arquivo: File): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify([dados])], { type: 'application/json' }))
  formData.append('arquivo', arquivo)
  return formData
}

export const licitacaoService = {
  listar(params: ListarParams): Promise<Page<LicitacaoResumo>> {
    return api.get<Page<LicitacaoResumo>>(`${BASE}/buscar`, { params }).then(r => r.data)
  },

  buscarPorId(id: number): Promise<LicitacaoDetalhe> {
    return api.get<LicitacaoDetalhe>(`${BASE}/${id}`).then(r => r.data)
  },

  criar(dados: LicitacaoRequest): Promise<LicitacaoResumo> {
    return api.post<LicitacaoResumo>(BASE, dados).then(r => r.data)
  },

  atualizar(id: number, dados: LicitacaoRequest): Promise<LicitacaoDetalhe> {
    return api.put<LicitacaoDetalhe>(`${BASE}/${id}`, dados).then(r => r.data)
  },

  // Não existe mais DELETE de licitação — exigência do TCE (preserva sequência e histórico).
  // Ocultar da consulta pública substitui excluir.
  alterarVisibilidade(id: number, visivel: boolean): Promise<void> {
    return api.patch(`${BASE}/${id}/visibilidade`, { visivel }).then(() => undefined)
  },

  listarDocumentos(id: number): Promise<Documento[]> {
    return api.get<Documento[]>(`${BASE}/${id}/documentos`).then(r => r.data)
  },

  criarDocumento(id: number, dados: DocumentoUploadRequest, arquivo: File): Promise<void> {
    return api
      .post(`${BASE}/${id}/documentos`, montarFormDataDocumento(dados, arquivo))
      .then(() => undefined)
  },

  excluirDocumento(licitacaoId: number, documentoId: number): Promise<void> {
    return api.delete(`${BASE}/${licitacaoId}/documento/${documentoId}`).then(() => undefined)
  },

  // Sem paginação (volume baixo por licitação) — padrão PNCP de gerenciador + participantes
  // de uma compra compartilhada/SRP. Regras de negócio (409 se violadas): só um GERENCIADOR
  // por licitação, mesma unidade não pode ser vinculada duas vezes.
  listarOrgaos(licitacaoId: number): Promise<LicitacaoOrgao[]> {
    return api.get<LicitacaoOrgao[]>(`${BASE}/${licitacaoId}/orgaos`).then(r => r.data)
  },

  criarOrgao(licitacaoId: number, dados: LicitacaoOrgaoRequest): Promise<LicitacaoOrgao> {
    return api.post<LicitacaoOrgao>(`${BASE}/${licitacaoId}/orgaos`, dados).then(r => r.data)
  },

  atualizarOrgao(licitacaoId: number, id: number, dados: LicitacaoOrgaoRequest): Promise<LicitacaoOrgao> {
    return api.put<LicitacaoOrgao>(`${BASE}/${licitacaoId}/orgaos/${id}`, dados).then(r => r.data)
  },

  excluirOrgao(licitacaoId: number, id: number): Promise<void> {
    return api.delete(`${BASE}/${licitacaoId}/orgaos/${id}`).then(() => undefined)
  }
}
