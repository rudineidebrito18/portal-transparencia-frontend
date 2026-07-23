import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { AlterarRoleRequest, CriarUsuarioRequest, UsuarioAdmin } from './types'

const BASE = '/admin/users'

type ListarParams = { page?: number; size?: number; sort?: string }

export const usuariosService = {
  listar(params: ListarParams = {}): Promise<Page<UsuarioAdmin>> {
    return api.get<Page<UsuarioAdmin>>(BASE, { params }).then(r => r.data)
  },

  criar(dados: CriarUsuarioRequest): Promise<UsuarioAdmin> {
    return api.post<UsuarioAdmin>(BASE, dados).then(r => r.data)
  },

  alterarRole(id: number, dados: AlterarRoleRequest): Promise<UsuarioAdmin> {
    return api.patch<UsuarioAdmin>(`${BASE}/${id}/role`, dados).then(r => r.data)
  },

  // DELETE aqui é soft delete no backend: desativa a conta (não consegue mais
  // logar), não apaga o registro — preserva a referência pro log de auditoria.
  desativar(id: number): Promise<void> {
    return api.delete(`${BASE}/${id}`).then(() => undefined)
  },

  reativar(id: number): Promise<UsuarioAdmin> {
    return api.patch<UsuarioAdmin>(`${BASE}/${id}/reativar`).then(r => r.data)
  }
}
