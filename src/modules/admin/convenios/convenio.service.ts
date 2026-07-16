import { api } from '@/services/api'
import { Convenio, ConvenioRequest } from './types'

const BASE = '/convenios'

// Nomes de parte diferentes do padrão genérico ("dto"+"pdf", não "dados"+"arquivo") —
// confirmado no controller real (ConvenioController).
function montarFormData(dados: ConvenioRequest, pdf?: File | null): FormData {
  const formData = new FormData()
  formData.append('dto', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (pdf) formData.append('pdf', pdf)
  return formData
}

export const convenioService = {
  listar(): Promise<Convenio[]> {
    return api.get<Convenio[]>(BASE).then(r => r.data)
  },

  criar(dados: ConvenioRequest, pdf?: File | null): Promise<Convenio> {
    return api
      .post<Convenio>(BASE, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  // ⚠️ Bug conhecido no backend (2026-07-16): PUT/DELETE aqui retornam 403 mesmo com
  // ROLE_ADMINISTRATOR válido (GET/POST funcionam normal, e o mesmo padrão de rota
  // funciona pra outros recursos admin-only, ex. servidor). Métodos implementados
  // corretos pro contrato documentado, mas não ligados a nenhum botão na UI até o
  // backend corrigir — ver STATUS.md seção 7.9.
  atualizar(id: number, dados: ConvenioRequest, pdf?: File | null): Promise<Convenio> {
    return api
      .put<Convenio>(`${BASE}/${id}`, montarFormData(dados, pdf), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
