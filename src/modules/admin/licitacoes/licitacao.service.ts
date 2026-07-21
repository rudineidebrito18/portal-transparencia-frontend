import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { LicitacaoDetalhe, LicitacaoResumo } from '@/modules/licitacoes/types'
import { DocumentoUploadRequest, Documento, FiltroLicitacaoAdmin, LicitacaoRequest } from './types'

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
      .post(`${BASE}/${id}/documentos`, montarFormDataDocumento(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(() => undefined)
  },

  excluirDocumento(licitacaoId: number, documentoId: number): Promise<void> {
    return api.delete(`${BASE}/${licitacaoId}/documento/${documentoId}`).then(() => undefined)
  }
}
