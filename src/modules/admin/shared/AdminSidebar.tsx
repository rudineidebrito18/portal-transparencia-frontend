'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { REGISTRY_MODULOS_GENERICOS } from '@/modules/admin/genericos/registry'

// Grupos ainda não implementados (módulos bespoke da seção 6 do prompt do
// admin) — aparecem como "em breve" pra dar visão do todo, mesmo padrão do
// hub público (ItemAcessoCard). Ver STATUS.md pra ordem de prioridade.
const GRUPOS_PENDENTES = [
  'Diário Oficial (publicação e aprovação)',
  'Licitações, Contratos e Aditivos',
  'Obras Públicas e Repasses',
  'Convênios e Emendas Parlamentares',
  'RH: Servidor, Folha, Cargos, Diárias, Concursos',
  'Anticorrupção (dívida ativa, empresas inidôneas)'
]

const LINKS_INSTITUCIONAL_GERAL = [
  { href: '/admin/institucional/avisos', label: 'Avisos' },
  { href: '/admin/institucional/noticias', label: 'Notícias' },
  { href: '/admin/geral/fornecedores', label: 'Fornecedores' },
  { href: '/admin/geral/unidades', label: 'Unidades' },
  { href: '/admin/geral/tabela-valores', label: 'Tabela de Valores de Diária' }
]

const LINKS_ESIC_OUVIDORIA = [
  { href: '/admin/esic/config', label: 'E-SIC — Configuração' },
  { href: '/admin/esic/formularios', label: 'E-SIC — Formulários Recebidos' },
  { href: '/admin/ouvidoria/config', label: 'Ouvidoria — Configuração' }
]

function agruparPorCategoria() {
  const grupos = new Map<string, typeof REGISTRY_MODULOS_GENERICOS>()

  for (const modulo of REGISTRY_MODULOS_GENERICOS) {
    const lista = grupos.get(modulo.categoria) ?? []
    lista.push(modulo)
    grupos.set(modulo.categoria, lista)
  }

  return grupos
}

export default function AdminSidebar() {
  const { usuario, logout } = useAuth()
  const pathname = usePathname()
  const grupos = agruparPorCategoria()

  return (
    <aside className="w-72 shrink-0 bg-primary-dark text-white min-h-screen flex flex-col">
      <div className="p-5 border-b border-white/10">
        <p className="font-bold text-sm">Painel Administrativo</p>
        <p className="text-xs text-white/60">Portal da Transparência</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-sm">
        <Link
          href="/admin"
          className={`block px-3 py-2 rounded-lg font-semibold transition ${pathname === '/admin' ? 'bg-white/15' : 'hover:bg-white/10'}`}
        >
          Início
        </Link>

        {isAdministrador(usuario) && (
          <Link
            href="/admin/usuarios"
            className={`block px-3 py-2 rounded-lg font-semibold transition ${pathname === '/admin/usuarios' ? 'bg-white/15' : 'hover:bg-white/10'}`}
          >
            Gestão de Usuários
          </Link>
        )}

        {isAdministrador(usuario) && (
          <Link
            href="/admin/auditoria"
            className={`block px-3 py-2 rounded-lg font-semibold transition ${pathname === '/admin/auditoria' ? 'bg-white/15' : 'hover:bg-white/10'}`}
          >
            Auditoria
          </Link>
        )}

        <div>
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            Institucional e Geral
          </p>
          {LINKS_INSTITUCIONAL_GERAL.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-1.5 rounded-lg transition ${pathname === link.href ? 'bg-white/15' : 'hover:bg-white/10 text-white/85'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div>
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            ESIC e Ouvidoria
          </p>
          {LINKS_ESIC_OUVIDORIA.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-1.5 rounded-lg transition ${pathname === link.href ? 'bg-white/15' : 'hover:bg-white/10 text-white/85'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {[...grupos.entries()].map(([categoria, modulos]) => (
          <div key={categoria}>
            <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
              {categoria}
            </p>
            {modulos.map(modulo => {
              const href = `/admin/modulos/${modulo.slug}`
              return (
                <Link
                  key={modulo.slug}
                  href={href}
                  className={`block px-3 py-1.5 rounded-lg transition ${pathname === href ? 'bg-white/15' : 'hover:bg-white/10 text-white/85'}`}
                >
                  {modulo.label}
                </Link>
              )
            })}
          </div>
        ))}

        <div>
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-white/50">
            Em breve
          </p>
          {GRUPOS_PENDENTES.map(nome => (
            <p key={nome} className="px-3 py-1.5 text-white/35 cursor-not-allowed">
              {nome}
            </p>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 text-xs">
        <p className="font-semibold truncate">{usuario?.email}</p>
        <p className="text-white/50 mb-2">
          {isAdministrador(usuario) ? 'Administrador' : 'Gerente'}
        </p>
        <button
          onClick={logout}
          className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition font-semibold"
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
