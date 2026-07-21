import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { FiltroSolicitacaoPublicacao, LogEtapaProcessamento, SolicitacaoPublicacao, SolicitacaoPublicacaoRequest } from './types'

const BASE = '/edicoes/publicacoes'

type ListarParams = FiltroSolicitacaoPublicacao & {
  page?: number
  size?: number
  sort?: string
}

function montarFormData(dados: SolicitacaoPublicacaoRequest, arquivo: File): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  formData.append('arquivo', arquivo)
  return formData
}

export const publicacaoService = {
  listar(params: ListarParams): Promise<Page<SolicitacaoPublicacao>> {
    return api.get<Page<SolicitacaoPublicacao>>(BASE, { params }).then(r => r.data)
  },

  criar(dados: SolicitacaoPublicacaoRequest, arquivo: File): Promise<SolicitacaoPublicacao> {
    return api
      .post<SolicitacaoPublicacao>(BASE, montarFormData(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  buscarPorId(id: number): Promise<SolicitacaoPublicacao> {
    return api.get<SolicitacaoPublicacao>(`${BASE}/${id}`).then(r => r.data)
  },

  listarLogs(id: number): Promise<LogEtapaProcessamento[]> {
    return api.get<LogEtapaProcessamento[]>(`${BASE}/${id}/logs`).then(r => r.data)
  },

  aprovar(id: number): Promise<SolicitacaoPublicacao> {
    return api.post<SolicitacaoPublicacao>(`${BASE}/${id}/aprovar`).then(r => r.data)
  },

  rejeitar(id: number, motivo?: string): Promise<SolicitacaoPublicacao> {
    return api.post<SolicitacaoPublicacao>(`${BASE}/${id}/rejeitar`, undefined, { params: { motivo } }).then(r => r.data)
  },

  retomar(id: number): Promise<SolicitacaoPublicacao> {
    return api.post<SolicitacaoPublicacao>(`${BASE}/${id}/retomar`).then(r => r.data)
  }
}
