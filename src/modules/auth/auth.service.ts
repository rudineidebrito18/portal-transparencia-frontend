import { authApi } from '@/services/authApi'
import { usuariosService } from '@/modules/admin/usuarios/usuarios.service'
import { LoginRequest, LoginResponse, Papel } from './types'

export function login(credenciais: LoginRequest): Promise<LoginResponse> {
  return authApi.post<LoginResponse>('/users/login', credenciais).then(r => r.data)
}

// O JWT não carrega roles nem id (só sub/iat/exp) e não existe endpoint
// "/users/me". GET /api/admin/users só responde 200 pra ROLE_ADMINISTRATOR
// (403 pra ROLE_MANAGER) — usamos essa diferença como sonda pra descobrir o
// papel de quem acabou de logar. Único papel que pode logar além de
// ADMINISTRATOR é MANAGER, então um 403 aqui é conclusivo. Bônus: quando a
// sonda funciona (usuário é admin), a própria lista retornada já revela o
// próprio id (casando pelo e-mail do token) — usado pra desabilitar
// "alterar role"/"excluir" na própria linha em /admin/usuarios.
export async function detectarPapeisEId(email: string): Promise<{ roles: Papel[]; id: number | null }> {
  try {
    const usuarios = await usuariosService.listar()
    const proprio = usuarios.find(u => u.email === email)
    return { roles: ['ROLE_ADMINISTRATOR'], id: proprio?.id ?? null }
  } catch {
    return { roles: ['ROLE_MANAGER'], id: null }
  }
}
