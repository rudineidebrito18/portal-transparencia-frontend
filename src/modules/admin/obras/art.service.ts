import { api } from '@/services/api'
import { Art, ArtRequest } from './types'

const base = (obraId: number) => `/obras/${obraId}/arts`

function montarFormData(dados: ArtRequest, pdf?: File | null): FormData {
  const formData = new FormData()
  formData.append('dto', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (pdf) formData.append('pdf', pdf)
  return formData
}

// ART não é admin-only (foge do padrão dos outros sub-recursos de obras) — ver seção 6.5
// do prompt do admin: "ART NÃO é restrito a admin — MANAGER pode tudo".
export const artService = {
  listarPorObra(obraId: number): Promise<Art[]> {
    return api.get<Art[]>(base(obraId)).then(r => r.data)
  },

  criar(obraId: number, dados: ArtRequest, pdf: File): Promise<Art> {
    return api
      .post<Art>(base(obraId), montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(obraId: number, id: number, dados: ArtRequest, pdf?: File | null): Promise<Art> {
    return api
      .put<Art>(`${base(obraId)}/${id}`, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(obraId: number, id: number): Promise<void> {
    return api.delete(`${base(obraId)}/${id}`).then(() => undefined)
  }
}
