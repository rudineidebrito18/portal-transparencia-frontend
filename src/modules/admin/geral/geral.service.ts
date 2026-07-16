import { api } from '@/services/api'
import { Fornecedor, FornecedorRequest, Unidade, UnidadeRequest } from './types'

// Fornecedores e Unidades (seção 6.9 do prompt do admin) são JSON puro, sem
// paginação nem filtro no backend — mesma forma do padrão de usuariosService.
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
export const unidadesService = criarServicoAdminSimples<Unidade, UnidadeRequest>('/geral/unidades')
