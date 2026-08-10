'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MdMenuOpen, MdOutlineCircle, MdSearch } from 'react-icons/md'

import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { REGISTRY_MODULOS_GENERICOS } from '@/modules/admin/genericos/registry'

interface Props {
  colapsada: boolean
  onToggleColapsada: () => void
}

interface EntradaBusca {
  href: string
  label: string
  categoria: string
}

// Mesma fonte de verdade da sidebar (registry + listas bespoke) — busca é 100%
// client-side sobre rotas reais que já existem no app, não é um endpoint novo nem
// dado inventado. Duplicar essas listas aqui (em vez de importar de AdminSidebar.tsx)
// seria mais DRY, mas AdminSidebar não as exporta hoje e a duplicação é pequena — se
// crescer, vale extrair pra um arquivo `nav.ts` compartilhado.
const ENTRADAS_BESPOKE: EntradaBusca[] = [
  { href: '/admin', label: 'Início', categoria: 'Painel' },
  { href: '/admin/usuarios', label: 'Gestão de Usuários', categoria: 'Painel' },
  { href: '/admin/auditoria', label: 'Auditoria', categoria: 'Painel' },
  { href: '/admin/institucional/avisos', label: 'Avisos', categoria: 'Institucional e Geral' },
  { href: '/admin/institucional/noticias', label: 'Notícias', categoria: 'Institucional e Geral' },
  { href: '/admin/geral/prefeito', label: 'Perfil do Prefeito', categoria: 'Institucional e Geral' },
  { href: '/admin/geral/vice-prefeito', label: 'Perfil do Vice-Prefeito', categoria: 'Institucional e Geral' },
  { href: '/admin/geral/fornecedores', label: 'Fornecedores', categoria: 'Institucional e Geral' },
  { href: '/admin/geral/unidades', label: 'Unidades', categoria: 'Institucional e Geral' },
  { href: '/admin/geral/tabela-valores', label: 'Tabela de Valores de Diária', categoria: 'Institucional e Geral' },
  { href: '/admin/esic/config', label: 'E-SIC — Configuração', categoria: 'ESIC e Ouvidoria' },
  { href: '/admin/esic/formularios', label: 'E-SIC — Formulários Recebidos', categoria: 'ESIC e Ouvidoria' },
  { href: '/admin/ouvidoria/config', label: 'Ouvidoria — Configuração', categoria: 'ESIC e Ouvidoria' },
  { href: '/admin/ouvidoria/formularios', label: 'Ouvidoria — Formulários Recebidos', categoria: 'ESIC e Ouvidoria' },
  { href: '/admin/rh/servidores', label: 'Servidores', categoria: 'Recursos Humanos' },
  { href: '/admin/rh/cargos', label: 'Cargos', categoria: 'Recursos Humanos' },
  { href: '/admin/rh/diarias', label: 'Diárias', categoria: 'Recursos Humanos' },
  { href: '/admin/rh/folha', label: 'Folha de Pagamento', categoria: 'Recursos Humanos' },
  { href: '/admin/rh/concursos', label: 'Concursos', categoria: 'Recursos Humanos' },
  { href: '/admin/licitacoes', label: 'Licitações', categoria: 'Licitações' },
  { href: '/admin/convenios', label: 'Convênios', categoria: 'Convênios e Repasses' },
  { href: '/admin/emendas-parlamentares', label: 'Emendas Parlamentares', categoria: 'Convênios e Repasses' },
  { href: '/admin/obras', label: 'Obras Públicas', categoria: 'Convênios e Repasses' },
  { href: '/admin/anticorrupcao/empresas-divida-ativa', label: 'Empresas em Dívida Ativa', categoria: 'Fiscal e Orçamentário' },
  { href: '/admin/anticorrupcao/empresas-inidoneas', label: 'Empresas Inidôneas ou Suspensas', categoria: 'Fiscal e Orçamentário' },
  { href: '/admin/diario-oficial/config', label: 'Diário Oficial — Configuração', categoria: 'Diário Oficial' },
  { href: '/admin/diario-oficial/publicacoes', label: 'Diário Oficial — Publicações', categoria: 'Diário Oficial' },
  { href: '/admin/diario-oficial/edicoes-nao-eletronicas', label: 'Diário Oficial — Edições Não Eletrônicas', categoria: 'Diário Oficial' }
]

function todasEntradas(): EntradaBusca[] {
  const genericas = REGISTRY_MODULOS_GENERICOS.map(m => ({
    href: `/admin/modulos/${m.slug}`,
    label: m.label,
    categoria: m.categoria
  }))
  return [...ENTRADAS_BESPOKE, ...genericas]
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function tituloDaRota(pathname: string, entradas: EntradaBusca[]): { categoria: string | null; label: string } {
  const encontrado = entradas.find(e => e.href === pathname)
  if (encontrado) return { categoria: encontrado.categoria, label: encontrado.label }

  const segmentos = pathname.split('/').filter(Boolean)
  const ultimo = segmentos[segmentos.length - 1] ?? 'admin'
  const label = ultimo.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return { categoria: null, label }
}

export default function AdminTopbar({ colapsada, onToggleColapsada }: Props) {
  const { usuario } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const entradas = useMemo(() => todasEntradas(), [])
  const { categoria, label } = tituloDaRota(pathname, entradas)

  const [busca, setBusca] = useState('')
  const [buscaAberta, setBuscaAberta] = useState(false)
  const buscaRef = useRef<HTMLDivElement>(null)

  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim())
    if (!termo) return []
    return entradas.filter(e => normalizar(e.label).includes(termo)).slice(0, 8)
  }, [busca, entradas])

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (buscaRef.current && !buscaRef.current.contains(e.target as Node)) setBuscaAberta(false)
    }
    document.addEventListener('mousedown', aoClicarFora)
    return () => document.removeEventListener('mousedown', aoClicarFora)
  }, [])

  function irPara(href: string) {
    router.push(href)
    setBusca('')
    setBuscaAberta(false)
  }

  const ambienteMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true'

  return (
    <header className="h-16 shrink-0 flex items-center gap-4 px-5 border-b border-admin-border bg-admin-surface/80 admin-glass">
      <button
        onClick={onToggleColapsada}
        aria-label={colapsada ? 'Expandir menu' : 'Recolher menu'}
        className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-admin-text-muted hover:bg-admin-surface-2 hover:text-admin-text transition-colors"
      >
        <MdMenuOpen size={20} className={`transition-transform ${colapsada ? 'rotate-180' : ''}`} />
      </button>

      <div className="hidden md:flex items-center gap-1.5 text-sm text-admin-text-muted min-w-0">
        <span className="text-admin-text-faint">Painel</span>
        {categoria && (
          <>
            <span className="text-admin-text-faint">/</span>
            <span className="truncate">{categoria}</span>
          </>
        )}
        <span className="text-admin-text-faint">/</span>
        <span className="text-admin-text font-semibold truncate">{label}</span>
      </div>

      <div ref={buscaRef} className="relative flex-1 max-w-sm ml-auto">
        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-faint" size={18} />
        <input
          type="text"
          value={busca}
          onChange={e => { setBusca(e.target.value); setBuscaAberta(true) }}
          onFocus={() => setBuscaAberta(true)}
          placeholder="Buscar módulo ou página..."
          aria-label="Buscar módulo ou página"
          className="w-full bg-admin-surface-2 border border-admin-border rounded-lg pl-9 pr-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all"
        />

        {buscaAberta && resultados.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-admin-surface-3 border border-admin-border-strong rounded-lg shadow-admin-lg overflow-hidden z-50">
            {resultados.map(r => (
              <button
                key={r.href}
                onClick={() => irPara(r.href)}
                className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm text-admin-text hover:bg-admin-surface-2 transition-colors"
              >
                <span className="truncate">{r.label}</span>
                <span className="text-xs text-admin-text-faint shrink-0">{r.categoria}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <span
        className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
          ambienteMock
            ? 'bg-admin-warning-light text-admin-warning'
            : 'bg-admin-success-light text-admin-success'
        }`}
      >
        <MdOutlineCircle size={8} className="fill-current" />
        {ambienteMock ? 'Dados de demonstração' : 'Ambiente conectado'}
      </span>

      <Link
        href="/admin/usuarios"
        className="shrink-0 w-9 h-9 rounded-full admin-gradient-accent flex items-center justify-center text-xs font-bold text-white shadow-admin-glow"
        aria-label={isAdministrador(usuario) ? 'Administrador' : 'Gerente'}
        title={usuario?.email}
      >
        {usuario ? usuario.email.slice(0, 2).toUpperCase() : '?'}
      </Link>
    </header>
  )
}
