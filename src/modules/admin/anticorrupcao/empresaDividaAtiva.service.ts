import { api } from '@/services/api'
import { EmpresaDividaAtiva, EmpresaDividaAtivaRequest } from './types'

const BASE = '/gestao-fiscal/empresas-divida-ativa'

function montarFormData(dados: EmpresaDividaAtivaRequest, pdf?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (pdf) formData.append('pdf', pdf)
  return formData
}

export const empresaDividaAtivaService = {
  listar(): Promise<EmpresaDividaAtiva[]> {
    return api.get<EmpresaDividaAtiva[]>(BASE).then(r => r.data)
  },

  criar(dados: EmpresaDividaAtivaRequest, pdf?: File | null): Promise<EmpresaDividaAtiva> {
    return api
      .post<EmpresaDividaAtiva>(BASE, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(id: number, dados: EmpresaDividaAtivaRequest, pdf?: File | null): Promise<EmpresaDividaAtiva> {
    return api
      .put<EmpresaDividaAtiva>(`${BASE}/${id}`, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
