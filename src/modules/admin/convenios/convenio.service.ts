import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { Convenio, ConvenioRequest, FiltroConvenio } from './types'

const BASE = '/convenios'

type ListarParams = FiltroConvenio & { page?: number; size?: number; sort?: string }

// Nomes de parte diferentes do padrão genérico ("dto"+"pdf", não "dados"+"arquivo") —
// confirmado no controller real (ConvenioController).
function montarFormData(dados: ConvenioRequest, pdf?: File | null): FormData {
  const formData = new FormData()
  formData.append('dto', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (pdf) formData.append('pdf', pdf)
  return formData
}

export const convenioService = {
  listar(params: ListarParams): Promise<Page<Convenio>> {
    return api.get<Page<Convenio>>(`${BASE}/filtro`, { params }).then(r => r.data)
  },

  criar(dados: ConvenioRequest, pdf?: File | null): Promise<Convenio> {
    return api
      .post<Convenio>(BASE, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(id: number, dados: ConvenioRequest, pdf?: File | null): Promise<Convenio> {
    return api
      .put<Convenio>(`${BASE}/${id}`, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
