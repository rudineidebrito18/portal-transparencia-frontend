import { Papel } from '@/modules/auth/types'

export interface UsuarioAdmin {
  id: number
  email: string
  roles: Papel[]
}

export interface CriarUsuarioRequest {
  email: string
  password: string
  role: Papel
}

export interface AlterarRoleRequest {
  role: Papel
}
