import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { ContratoLicitacao } from '@/modules/contratos/types'
import { ContratoLicitacaoRequest, Documento, DocumentoUploadRequest } from './types'

const BASE = '/licitacoes'

type ListarParams = {
  page?: number
  size?: number
  sort?: string
}

function montarFormDataDocumento(dados: DocumentoUploadRequest, arquivo: File): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  formData.append('arquivo', arquivo)
  return formData
}

export const contratoService = {
  criar(licitacaoId: number, dados: ContratoLicitacaoRequest): Promise<ContratoLicitacao> {
    return api.post<ContratoLicitacao>(`${BASE}/${licitacaoId}/contratos`, dados).then(r => r.data)
  },

  buscarPorId(contratoId: number): Promise<ContratoLicitacao> {
    return api.get<ContratoLicitacao>(`${BASE}/contratos/${contratoId}`).then(r => r.data)
  },

  listarPorLicitacao(licitacaoId: number, params: ListarParams): Promise<Page<ContratoLicitacao>> {
    return api.get<Page<ContratoLicitacao>>(`${BASE}/${licitacaoId}/contratos`, { params }).then(r => r.data)
  },

  listarDocumentos(contratoId: number): Promise<Documento[]> {
    return api.get<Documento[]>(`${BASE}/contratos/${contratoId}/documento`).then(r => r.data)
  },

  criarDocumento(contratoId: number, dados: DocumentoUploadRequest, arquivo: File): Promise<void> {
    return api
      .post(`${BASE}/contratos/${contratoId}/documento`, montarFormDataDocumento(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(() => undefined)
  },

  excluirDocumento(contratoId: number, documentoId: number): Promise<void> {
    return api.delete(`${BASE}/contratos/${contratoId}/documento/${documentoId}`).then(() => undefined)
  }
}
