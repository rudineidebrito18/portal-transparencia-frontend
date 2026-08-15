'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ComponentType, useEffect, useRef } from 'react'
import {
  MdAccountBalance,
  MdApartment,
  MdBadge,
  MdFactCheck,
  MdGavel,
  MdHandshake,
  MdHistory,
  MdLocalHospital,
  MdLogout,
  MdMenuBook,
  MdNewspaper,
  MdSchool,
  MdSpaceDashboard,
  MdSupportAgent,
  MdVolunteerActivism
} from 'react-icons/md'

import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { REGISTRY_MODULOS_GENERICOS } from '@/modules/admin/genericos/registry'

interface Props {
  colapsada: boolean
  onExpandir: () => void
}

// RH bespoke (servidor/cargos/diárias/folha/concursos) — mescla com a
// categoria "Recursos Humanos" do registry genérico (que só tem
// Estagiários/Terceirizados), pra não duplicar o cabeçalho da seção.
const LINKS_RH_BESPOKE = [
  { href: '/admin/rh/servidores', label: 'Servidores' },
  { href: '/admin/rh/cargos', label: 'Cargos' },
  { href: '/admin/rh/diarias', label: 'Diárias' },
  { href: '/admin/rh/folha', label: 'Folha de Pagamento' },
  { href: '/admin/rh/concursos', label: 'Concursos' }
]

// Convênios (base) e Emendas Parlamentares — mesclam com a categoria "Convênios e
// Repasses" do registry genérico (acordos firmados / transferências), mesmo motivo
// do LINKS_RH_BESPOKE acima.
const LINKS_CONVENIOS_BESPOKE = [
  { href: '/admin/convenios', label: 'Convênios' },
  { href: '/admin/emendas-parlamentares', label: 'Emendas Parlamentares' },
  { href: '/admin/obras', label: 'Obras Públicas' }
]

// Licitações, Contratos e Aditivos (bespoke) — mescla com a categoria "Licitações" do
// registry genérico (que só tem Fiscal de Contratos), mesmo motivo do LINKS_RH_BESPOKE.
const LINKS_LICITACOES_BESPOKE = [
  { href: '/admin/licitacoes', label: 'Licitações' }
]

// Anticorrupção (dívida ativa, empresas inidôneas) — mescla com a categoria "Fiscal e
// Orçamentário" do registry genérico (que só tem Renúncia Fiscal), mesmo motivo do
// LINKS_RH_BESPOKE. Grupo de permissão é 'anticorrupcao' (admin-only pra editar/excluir),
// não 'fiscal-orcamentario' — só a categoria visual da sidebar é compartilhada.
const LINKS_ANTICORRUPCAO_BESPOKE = [
  { href: '/admin/anticorrupcao/empresas-divida-ativa', label: 'Empresas em Dívida Ativa' },
  { href: '/admin/anticorrupcao/empresas-inidoneas', label: 'Empresas Inidôneas ou Suspensas' }
]

const LINKS_INSTITUCIONAL_GERAL = [
  { href: '/admin/institucional/avisos', label: 'Avisos' },
  { href: '/admin/institucional/noticias', label: 'Notícias' },
  { href: '/admin/geral/prefeito', label: 'Perfil do Prefeito' },
  { href: '/admin/geral/vice-prefeito', label: 'Perfil do Vice-Prefeito' },
  { href: '/admin/geral/fornecedores', label: 'Fornecedores' },
  { href: '/admin/geral/unidades', label: 'Unidades' },
  { href: '/admin/geral/tabela-valores', label: 'Tabela de Valores de Diária' },
  { href: '/admin/institucional/estrutura-organizacional', label: 'Estrutura Organizacional' }
]

// Mescla com a categoria "ESIC e Ouvidoria" do registry genérico (Regulamentação, Declaração
// de Solicitações, Declaração de Sigilo — item 29 do backlog), mesmo motivo do
// LINKS_RH_BESPOKE acima — por isso não faz mais parte do bloco 100% manual mais abaixo.
const LINKS_ESIC_OUVIDORIA = [
  { href: '/admin/esic/config', label: 'E-SIC — Configuração' },
  { href: '/admin/esic/formularios', label: 'E-SIC — Formulários Recebidos' },
  { href: '/admin/esic/documentos-classificados-sigilo', label: 'E-SIC — Documentos por Grau de Sigilo' },
  { href: '/admin/ouvidoria/config', label: 'Ouvidoria — Configuração' },
  { href: '/admin/ouvidoria/formularios', label: 'Ouvidoria — Formulários Recebidos' }
]

// Mescla com a categoria "Diário Oficial" do registry genérico (Legislação do Diário
// Oficial), mesmo motivo do LINKS_RH_BESPOKE acima.
const LINKS_DIARIO_OFICIAL_BESPOKE = [
  { href: '/admin/diario-oficial/config', label: 'Diário Oficial — Configuração' },
  { href: '/admin/diario-oficial/publicacoes', label: 'Diário Oficial — Publicações' },
  { href: '/admin/diario-oficial/edicoes-nao-eletronicas', label: 'Diário Oficial — Edições Não Eletrônicas' }
]

// Mescla com a categoria "Saúde" do registry genérico (Unidade de Saúde, Medicamentos,
// Plano de Saúde, Relatórios de Saúde), mesmo motivo do LINKS_RH_BESPOKE acima.
const LINKS_SAUDE_BESPOKE = [
  { href: '/admin/institucional/conselho-saude', label: 'Conselho Municipal de Saúde' }
]

// Mescla com a categoria "Educação" do registry genérico (Lista de Espera — Creche,
// Lista de Solicitação de Matrícula, Plano de Educação, Lista de Alunos), mesmo motivo
// do LINKS_RH_BESPOKE acima.
const LINKS_EDUCACAO_BESPOKE = [
  { href: '/admin/institucional/conselho-educacao', label: 'Conselho Municipal de Educação' }
]

// Assistência Social não tem categoria no registry genérico (nenhum módulo genérico
// nesse domínio ainda) — categoria manual própria, mesmo padrão de
// LINKS_INSTITUCIONAL_GERAL/LINKS_ESIC_OUVIDORIA abaixo, não do mecanismo de merge.
const LINKS_ASSISTENCIA_SOCIAL = [
  { href: '/admin/institucional/conselho-assistencia-social', label: 'Conselho Municipal de Assistência Social' }
]

// Ícone por categoria — só nos cabeçalhos (não em cada link individual, seriam ~50
// ícones sem significado real distinto). `Institucional`/`Geral` reaproveitam o mesmo
// bloco visual já que a sidebar não os separa hoje.
const ICONE_CATEGORIA: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  'Institucional e Geral': MdApartment,
  'ESIC e Ouvidoria': MdSupportAgent,
  'Recursos Humanos': MdBadge,
  Licitações: MdGavel,
  'Convênios e Repasses': MdHandshake,
  'Fiscal e Orçamentário': MdAccountBalance,
  'Diário Oficial': MdNewspaper,
  Planejamento: MdHistory,
  'Prestação de Contas': MdFactCheck,
  Legislação: MdMenuBook,
  Saúde: MdLocalHospital,
  Educação: MdSchool,
  'Assistência Social': MdVolunteerActivism
}

// Cabeçalho de categoria. Expandida: só um rótulo, não navega. Colapsada: vira botão
// clicável (expande a sidebar de novo) com tooltip — sem isso, os links individuais
// abaixo dele (que não têm ícone próprio, ver ItemNav) ficariam invisíveis mas ainda
// ocupando espaço quando colapsada, e é exatamente esse buraco que parecia "estranho".
function CabecalhoCategoria({
  categoria,
  icone: Icone,
  colapsada,
  onExpandir
}: {
  categoria: string
  icone?: ComponentType<{ size?: number; className?: string }>
  colapsada: boolean
  onExpandir: () => void
}) {
  if (colapsada) {
    return (
      <button
        onClick={onExpandir}
        aria-label={`Expandir menu — ${categoria}`}
        className="group relative w-full flex items-center justify-center rounded-lg py-2 text-admin-text-faint hover:bg-admin-surface-2 hover:text-admin-text transition-colors"
      >
        {Icone && <Icone size={16} className="shrink-0" />}
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-admin-surface-3 border border-admin-border-strong px-2.5 py-1.5 text-xs font-medium text-admin-text opacity-0 shadow-admin-md transition-opacity duration-150 group-hover:opacity-100 z-50"
        >
          {categoria}
        </span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 mb-1">
      {Icone && <Icone size={14} className="text-admin-text-faint shrink-0" />}
      <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-faint truncate">{categoria}</p>
    </div>
  )
}

function agruparPorCategoria() {
  const grupos = new Map<string, typeof REGISTRY_MODULOS_GENERICOS>()

  for (const modulo of REGISTRY_MODULOS_GENERICOS) {
    const lista = grupos.get(modulo.categoria) ?? []
    lista.push(modulo)
    grupos.set(modulo.categoria, lista)
  }

  return grupos
}

function iniciais(email: string): string {
  const nomeParte = email.split('@')[0] ?? email
  const pedacos = nomeParte.split(/[._-]/).filter(Boolean)
  const letras = pedacos.length >= 2 ? pedacos[0][0] + pedacos[1][0] : nomeParte.slice(0, 2)
  return letras.toUpperCase()
}

// Item de nav com indicador de ativo em barra de gradiente (não preenchimento sólido —
// mais discreto, "premium" sem competir com o ícone/texto) + tooltip via CSS puro
// (group-hover) quando a sidebar está colapsada, sem precisar de posicionamento via JS.
function ItemNav({
  href,
  label,
  ativo,
  colapsada,
  icone: Icone,
  onNavigate
}: {
  href: string
  label: string
  ativo: boolean
  colapsada: boolean
  icone?: ComponentType<{ size?: number; className?: string }>
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
        colapsada ? 'justify-center px-0' : ''
      } ${
        ativo
          ? 'bg-admin-surface-3 text-admin-text font-semibold'
          : 'text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text'
      }`}
    >
      {ativo && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full admin-gradient-accent"
        />
      )}
      {Icone && <Icone size={16} className="shrink-0" />}
      {!colapsada && <span className="truncate">{label}</span>}

      {colapsada && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-admin-surface-3 border border-admin-border-strong px-2.5 py-1.5 text-xs font-medium text-admin-text opacity-0 shadow-admin-md transition-opacity duration-150 group-hover:opacity-100 z-50"
        >
          {label}
        </span>
      )}
    </Link>
  )
}

export default function AdminSidebar({ colapsada, onExpandir }: Props) {
  const { usuario, logout } = useAuth()
  const pathname = usePathname()
  const grupos = agruparPorCategoria()

  function irPara(href: string) {
    return pathname === href
  }

  // No colapsado, clicar em qualquer item real expande a sidebar de novo (categoria
  // inteira só aparece expandida — ver decisão em STATUS.md 2.27).
  const handleNavigate = colapsada ? onExpandir : undefined

  // Clicar num ícone de categoria colapsada expandia a sidebar, mas o scroll ficava
  // onde estava antes (em pixels) — como o conteúdo colapsado é muito mais compacto que
  // o expandido, esse mesmo scroll em pixels não corresponde mais à mesma categoria
  // depois de expandir, e na prática sempre parecia "voltar pro início da lista"
  // (usuário reportou isso). `categoriaAlvoRef` guarda qual categoria foi clicada; o
  // efeito abaixo rola até ela assim que `colapsada` vira `false`. Ref (não state) de
  // propósito — só precisa ser lido uma vez dentro do efeito, não precisa re-renderizar.
  const categoriaRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const categoriaAlvoRef = useRef<string | null>(null)

  function expandirParaCategoria(categoria: string) {
    categoriaAlvoRef.current = categoria
    onExpandir()
  }

  useEffect(() => {
    if (colapsada || !categoriaAlvoRef.current) return

    categoriaRefs.current[categoriaAlvoRef.current]?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    categoriaAlvoRef.current = null
  }, [colapsada])

  return (
    <aside
      className={`shrink-0 h-screen flex flex-col bg-admin-surface border-r border-admin-border transition-[width] duration-200 ${
        colapsada ? 'w-[76px]' : 'w-72'
      }`}
    >
      <div className={`flex items-center gap-2.5 p-4 border-b border-admin-border ${colapsada ? 'justify-center px-0' : ''}`}>
        <Image
          src="/logo_lago_r.png"
          alt="Prefeitura Municipal de Lago dos Rodrigues"
          width={1024}
          height={275}
          priority
          className={colapsada ? 'w-11 h-auto shrink-0' : 'w-36 h-auto shrink-0'}
        />
        {!colapsada && (
          <p className="text-xs text-admin-text-faint truncate">Painel Administrativo</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 text-sm">
        <div className="space-y-0.5">
          <ItemNav href="/admin" label="Início" ativo={irPara('/admin')} colapsada={colapsada} icone={MdSpaceDashboard} onNavigate={handleNavigate} />

          {isAdministrador(usuario) && (
            <ItemNav
              href="/admin/usuarios"
              label="Gestão de Usuários"
              ativo={irPara('/admin/usuarios')}
              colapsada={colapsada}
              icone={MdBadge}
              onNavigate={handleNavigate}
            />
          )}

          {isAdministrador(usuario) && (
            <ItemNav
              href="/admin/auditoria"
              label="Auditoria"
              ativo={irPara('/admin/auditoria')}
              colapsada={colapsada}
              icone={MdHistory}
              onNavigate={handleNavigate}
            />
          )}
        </div>

        {[
          { categoria: 'Institucional e Geral', links: LINKS_INSTITUCIONAL_GERAL },
          { categoria: 'Assistência Social', links: LINKS_ASSISTENCIA_SOCIAL }
        ].map(({ categoria, links }) => {
          const Icone = ICONE_CATEGORIA[categoria]
          return (
            <div key={categoria} ref={el => { categoriaRefs.current[categoria] = el }} className="space-y-0.5">
              <CabecalhoCategoria categoria={categoria} icone={Icone} colapsada={colapsada} onExpandir={() => expandirParaCategoria(categoria)} />
              {!colapsada && links.map(link => (
                <ItemNav key={link.href} href={link.href} label={link.label} ativo={irPara(link.href)} colapsada={colapsada} onNavigate={handleNavigate} />
              ))}
            </div>
          )
        })}

        {[...grupos.entries()].map(([categoria, modulos]) => {
          const Icone = ICONE_CATEGORIA[categoria]
          const extras =
            (categoria === 'Recursos Humanos' && LINKS_RH_BESPOKE) ||
            (categoria === 'Licitações' && LINKS_LICITACOES_BESPOKE) ||
            (categoria === 'Convênios e Repasses' && LINKS_CONVENIOS_BESPOKE) ||
            (categoria === 'Fiscal e Orçamentário' && LINKS_ANTICORRUPCAO_BESPOKE) ||
            (categoria === 'Diário Oficial' && LINKS_DIARIO_OFICIAL_BESPOKE) ||
            (categoria === 'Saúde' && LINKS_SAUDE_BESPOKE) ||
            (categoria === 'Educação' && LINKS_EDUCACAO_BESPOKE) ||
            (categoria === 'ESIC e Ouvidoria' && LINKS_ESIC_OUVIDORIA) ||
            []

          return (
            <div key={categoria} ref={el => { categoriaRefs.current[categoria] = el }} className="space-y-0.5">
              <CabecalhoCategoria categoria={categoria} icone={Icone} colapsada={colapsada} onExpandir={() => expandirParaCategoria(categoria)} />

              {!colapsada && extras.map(link => (
                <ItemNav key={link.href} href={link.href} label={link.label} ativo={irPara(link.href)} colapsada={colapsada} onNavigate={handleNavigate} />
              ))}

              {!colapsada && modulos.map(modulo => {
                const href = `/admin/modulos/${modulo.slug}`
                return (
                  <ItemNav key={modulo.slug} href={href} label={modulo.label} ativo={irPara(href)} colapsada={colapsada} onNavigate={handleNavigate} />
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className={`p-3 border-t border-admin-border ${colapsada ? 'flex flex-col items-center gap-2' : ''}`}>
        <div className={`flex items-center gap-2.5 rounded-lg p-2 ${colapsada ? '' : 'bg-admin-surface-2'}`}>
          <span className="shrink-0 w-8 h-8 rounded-full admin-gradient-accent flex items-center justify-center text-xs font-bold text-white">
            {usuario ? iniciais(usuario.email) : '?'}
          </span>
          {!colapsada && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-admin-text truncate">{usuario?.email}</p>
              <p className="text-[11px] text-admin-text-faint">
                {isAdministrador(usuario) ? 'Administrador' : 'Gerente'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          aria-label="Sair"
          className={`group relative flex items-center gap-2 rounded-lg text-xs font-semibold text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-error transition-colors ${
            colapsada ? 'w-9 h-9 justify-center' : 'w-full mt-1.5 px-3 py-2'
          }`}
        >
          <MdLogout size={16} />
          {!colapsada && 'Sair'}
          {colapsada && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-admin-surface-3 border border-admin-border-strong px-2.5 py-1.5 text-xs font-medium text-admin-text opacity-0 shadow-admin-md transition-opacity duration-150 group-hover:opacity-100 z-50"
            >
              Sair
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
