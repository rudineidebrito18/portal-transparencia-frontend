import { api } from '@/services/api'
import { AnexoObra, AnexoObraRequest } from './types'

const base = (obraId: number) => `/obras/${obraId}/anexos`

function montarFormData(dados: AnexoObraRequest, arquivo?: File | null): FormData {
  const formData = new FormData()
  formData.append('anexo', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (arquivo) formData.append('arquivo', arquivo)
  return formData
}

export const anexoObraService = {
  listarPorObra(obraId: number): Promise<AnexoObra[]> {
    return api.get<AnexoObra[]>(base(obraId)).then(r => r.data)
  },

  criar(obraId: number, dados: AnexoObraRequest, arquivo: File): Promise<AnexoObra> {
    return api
      .post<AnexoObra>(base(obraId), montarFormData(dados, arquivo), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(obraId: number, id: number, dados: AnexoObraRequest, arquivo?: File | null): Promise<AnexoObra> {
    return api
      .put<AnexoObra>(`${base(obraId)}/${id}`, montarFormData(dados, arquivo), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(obraId: number, id: number): Promise<void> {
    return api.delete(`${base(obraId)}/${id}`).then(() => undefined)
  }
}
