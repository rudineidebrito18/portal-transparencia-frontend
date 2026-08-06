import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { EdicaoNaoEletronica, EdicaoNaoEletronicaRequest, FiltroEdicaoNaoEletronica } from './types'

const BASE = '/diario-oficial/edicoes-nao-eletronicas'

type ListarParams = FiltroEdicaoNaoEletronica & { page?: number; size?: number; sort?: string }

function montarFormData(dados: EdicaoNaoEletronicaRequest, arquivo?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (arquivo) formData.append('arquivo', arquivo)
  return formData
}

// Endpoint novo, ainda não existe no backend (ver prompt-backend-diario-oficial.md).
export const edicaoNaoEletronicaAdminService = {
  listar(params: ListarParams): Promise<Page<EdicaoNaoEletronica>> {
    return api.get<Page<EdicaoNaoEletronica>>(`${BASE}/filtro`, { params }).then(r => r.data)
  },

  criar(dados: EdicaoNaoEletronicaRequest, arquivo: File): Promise<EdicaoNaoEletronica> {
    return api
      .post<EdicaoNaoEletronica>(BASE, montarFormData(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  atualizar(id: number, dados: EdicaoNaoEletronicaRequest, arquivo?: File | null): Promise<EdicaoNaoEletronica> {
    return api
      .put<EdicaoNaoEletronica>(`${BASE}/${id}`, montarFormData(dados, arquivo), {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
