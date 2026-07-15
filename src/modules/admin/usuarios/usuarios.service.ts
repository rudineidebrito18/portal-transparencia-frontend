import { api } from '@/services/api'
import { AlterarRoleRequest, CriarUsuarioRequest, UsuarioAdmin } from './types'

const BASE = '/admin/users'

export const usuariosService = {
  listar(): Promise<UsuarioAdmin[]> {
    return api.get<UsuarioAdmin[]>(BASE).then(r => r.data)
  },

  criar(dados: CriarUsuarioRequest): Promise<UsuarioAdmin> {
    return api.post<UsuarioAdmin>(BASE, dados).then(r => r.data)
  },

  alterarRole(id: number, dados: AlterarRoleRequest): Promise<UsuarioAdmin> {
    return api.patch<UsuarioAdmin>(`${BASE}/${id}/role`, dados).then(r => r.data)
  },

  excluir(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  }
}
