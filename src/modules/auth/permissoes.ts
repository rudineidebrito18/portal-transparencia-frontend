import { Papel, Usuario } from './types'

const NIVEIS: Record<Papel, number> = {
  ROLE_MANAGER: 1,
  ROLE_ADMINISTRATOR: 2
}

// ROLE_ADMINISTRATOR implica todas as permissões de ROLE_MANAGER (hierarquia
// do backend), mesmo que a conta não tenha o role MANAGER explicitamente.
export function temPapel(usuario: Usuario | null, papelMinimo: Papel): boolean {
  if (!usuario) return false

  const nivelUsuario = Math.max(0, ...usuario.roles.map(r => NIVEIS[r] ?? 0))
  return nivelUsuario >= NIVEIS[papelMinimo]
}

export function isAdministrador(usuario: Usuario | null): boolean {
  return temPapel(usuario, 'ROLE_ADMINISTRATOR')
}

// Grupos de módulo conforme a tabela da seção 5 do prompt-frontend-dashboard-admin.md.
export type GrupoModulo =
  | 'padrao'
  | 'licitacoes'
  | 'fiscal-orcamentario'
  | 'anticorrupcao'
  | 'obras-repasses'
  | 'rh'
  | 'esic-ouvidoria'
  | 'usuarios'
  | 'institucional'
  | 'geral'

const EDITAR_ADMIN_ONLY: Set<GrupoModulo> = new Set([
  'licitacoes',
  'fiscal-orcamentario',
  'anticorrupcao',
  'obras-repasses',
  'rh',
  'usuarios'
])

const EXCLUIR_ADMIN_ONLY: Set<GrupoModulo> = new Set([
  'licitacoes',
  'fiscal-orcamentario',
  'anticorrupcao',
  'obras-repasses',
  'rh',
  'esic-ouvidoria',
  'usuarios'
])

export function podeCriar(usuario: Usuario | null, grupo: GrupoModulo): boolean {
  if (grupo === 'usuarios') return isAdministrador(usuario)
  return temPapel(usuario, 'ROLE_MANAGER')
}

export function podeEditar(usuario: Usuario | null, grupo: GrupoModulo): boolean {
  return EDITAR_ADMIN_ONLY.has(grupo) ? isAdministrador(usuario) : temPapel(usuario, 'ROLE_MANAGER')
}

export function podeExcluir(usuario: Usuario | null, grupo: GrupoModulo): boolean {
  return EXCLUIR_ADMIN_ONLY.has(grupo) ? isAdministrador(usuario) : temPapel(usuario, 'ROLE_MANAGER')
}
