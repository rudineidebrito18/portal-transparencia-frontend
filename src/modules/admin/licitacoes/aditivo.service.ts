import { api } from '@/services/api'
import { Aditivo } from '@/modules/contratos/types'
import { AditivoRequest } from './types'

const BASE = '/licitacoes/contratos/aditivos'

function montarFormData(dados: AditivoRequest, arquivo?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (arquivo) formData.append('arquivo', arquivo)
  return formData
}

export const aditivoService = {
  criar(dados: AditivoRequest, arquivo?: File | null): Promise<Aditivo> {
    return api
      .post<Aditivo>(BASE, montarFormData(dados, arquivo), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(id: number, dados: AditivoRequest, arquivo?: File | null): Promise<Aditivo> {
    return api
      .put<Aditivo>(`${BASE}/${id}`, montarFormData(dados, arquivo), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  listarPorContrato(contratoLicitacaoId: number): Promise<Aditivo[]> {
    return api.get<Aditivo[]>(BASE, { params: { contratoLicitacaoId } }).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
