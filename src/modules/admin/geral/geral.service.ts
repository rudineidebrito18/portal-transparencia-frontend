import { api } from '@/services/api'
import { Fornecedor, FornecedorRequest, Unidade, UnidadeRequest } from './types'

// Fornecedores (seção 6.9 do prompt do admin) é JSON puro, sem paginação nem
// filtro no backend — mesma forma do padrão de usuariosService.
function criarServicoAdminSimples<T, Req>(basePath: string) {
  return {
    listar(): Promise<T[]> {
      return api.get<T[]>(basePath).then(r => r.data)
    },

    criar(dados: Req): Promise<T> {
      return api.post<T>(basePath, dados).then(r => r.data)
    },

    atualizar(id: number, dados: Req): Promise<T> {
      return api.put<T>(`${basePath}/${id}`, dados).then(r => r.data)
    },

    excluir(id: number): Promise<void> {
      return api.delete(`${basePath}/${id}`).then(() => undefined)
    }
  }
}

export const fornecedoresService = criarServicoAdminSimples<Fornecedor, FornecedorRequest>('/geral/fornecedores')

const UNIDADES_BASE = '/geral/unidades'

// Unidades saiu da fábrica JSON genérica em 2026-07-16: o backend passou a
// exigir multipart/form-data (parte "dados" + "foto" opcional) pra virar a
// base do futuro módulo público "Secretarias" — mesmo padrão de
// tabela-valores.service.ts. Não reaproveitar criarServicoAdminSimples aqui:
// ela ainda serve Fornecedores, que continua JSON puro.
function montarFormData(dados: UnidadeRequest, foto?: File | null): FormData {
  const formData = new FormData()
  formData.append('dados', new Blob([JSON.stringify(dados)], { type: 'application/json' }))
  if (foto) formData.append('foto', foto)
  return formData
}

export const unidadesService = {
  listar(nome?: string): Promise<Unidade[]> {
    return api.get<Unidade[]>(UNIDADES_BASE, { params: nome ? { nome } : undefined }).then(r => r.data)
  },

  criar(dados: UnidadeRequest, foto?: File | null): Promise<Unidade> {
    return api
      .post<Unidade>(UNIDADES_BASE, montarFormData(dados, foto), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  atualizar(id: number, dados: UnidadeRequest, foto?: File | null): Promise<Unidade> {
    return api
      .put<Unidade>(`${UNIDADES_BASE}/${id}`, montarFormData(dados, foto), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${UNIDADES_BASE}/${id}`).then(() => undefined)
  }
}
