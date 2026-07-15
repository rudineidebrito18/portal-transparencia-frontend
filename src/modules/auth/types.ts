export type Papel = 'ROLE_MANAGER' | 'ROLE_ADMINISTRATOR'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
}

export interface Usuario {
  id: number | null
  email: string
  roles: Papel[]
}

export interface UsuarioResponseDto {
  id: number
  email: string
  roles: string[]
}
