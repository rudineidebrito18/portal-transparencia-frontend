'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  MdAddCircleOutline,
  MdApartment,
  MdArrowOutward,
  MdAssignment,
  MdBadge,
  MdCampaign,
  MdDelete,
  MdEdit,
  MdGavel,
  MdGroup,
  MdHistory,
  MdNewspaper,
  MdNoteAdd
} from 'react-icons/md'

import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { REGISTRY_MODULOS_GENERICOS } from '@/modules/admin/genericos/registry'
import { auditoriaService } from '@/modules/admin/auditoria/auditoria.service'
import { AuditLog } from '@/modules/admin/auditoria/types'
import { contratoService } from '@/modules/contratos/contrato.service'
import { licitacaoService } from '@/modules/licitacoes/licitacao.service'
import { obraService } from '@/modules/obras/obra.service'
import { StatusObra } from '@/modules/obras/types'
import { servidorService } from '@/modules/recursos-humanos/servidor.service'
import { formatarDataHora } from '@/utils/date'

interface EstadoKpi {
  valor: number | null
  erro: boolean
}

const KPI_VAZIO: EstadoKpi = { valor: null, erro: false }

const ACOES_RAPIDAS = [
  { href: '/admin/institucional/noticias', label: 'Nova notícia', icone: MdNewspaper },
  { href: '/admin/institucional/avisos', label: 'Novo aviso', icone: MdCampaign },
  { href: '/admin/licitacoes', label: 'Licitações', icone: MdGavel },
  { href: '/admin/rh/servidores', label: 'Servidores', icone: MdBadge },
  { href: '/admin/usuarios', label: 'Usuários', icone: MdGroup },
  { href: '/admin/auditoria', label: 'Auditoria', icone: MdHistory }
]

const ICONE_ACAO: Record<AuditLog['acao'], { icone: typeof MdNoteAdd; cor: string }> = {
  CRIACAO: { icone: MdNoteAdd, cor: 'text-admin-success bg-admin-success-light' },
  EDICAO: { icone: MdEdit, cor: 'text-admin-info bg-admin-info-light' },
  EXCLUSAO: { icone: MdDelete, cor: 'text-admin-error bg-admin-error-light' }
}

const LABEL_ACAO: Record<AuditLog['acao'], string> = {
  CRIACAO: 'criou',
  EDICAO: 'editou',
  EXCLUSAO: 'excluiu'
}

function CardKpi({
  label,
  estado,
  icone: Icone,
  destaque = false
}: {
  label: string
  estado: EstadoKpi
  icone: typeof MdGavel
  destaque?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-admin-border p-5 flex flex-col justify-between ${
        destaque ? 'bg-admin-surface admin-gradient-mesh shadow-admin-glow' : 'bg-admin-surface'
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-admin-text-faint">{label}</span>
        <span
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
            destaque ? 'admin-gradient-accent text-white' : 'bg-admin-surface-2 text-admin-accent'
          }`}
        >
          <Icone size={18} />
        </span>
      </div>

      <div className="mt-4">
        {estado.erro ? (
          <span className="text-sm text-admin-text-faint">Indisponível</span>
        ) : estado.valor === null ? (
          <span className="block h-8 w-16 rounded bg-admin-surface-2 animate-pulse" aria-hidden="true" />
        ) : (
          <span className={`font-bold tabular-nums text-admin-text ${destaque ? 'text-4xl' : 'text-2xl'}`}>
            {estado.valor.toLocaleString('pt-BR')}
          </span>
        )}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const { usuario } = useAuth()

  const [licitacoes, setLicitacoes] = useState<EstadoKpi>(KPI_VAZIO)
  const [contratos, setContratos] = useState<EstadoKpi>(KPI_VAZIO)
  const [obrasAndamento, setObrasAndamento] = useState<EstadoKpi>(KPI_VAZIO)
  const [servidores, setServidores] = useState<EstadoKpi>(KPI_VAZIO)

  const [atividades, setAtividades] = useState<AuditLog[] | null>(null)
  const [erroAtividades, setErroAtividades] = useState(false)

  useEffect(() => {
    // Cada KPI busca e atualiza o próprio estado de forma independente — se um
    // endpoint falhar (ex: módulo fora do ar), os outros continuam aparecendo
    // normalmente em vez de derrubar o dashboard inteiro.
    licitacaoService.listar({ size: 1 })
      .then(p => setLicitacoes({ valor: p.totalElements, erro: false }))
      .catch(() => setLicitacoes({ valor: null, erro: true }))

    contratoService.listarTodos({ size: 1 })
      .then(p => setContratos({ valor: p.totalElements, erro: false }))
      .catch(() => setContratos({ valor: null, erro: true }))

    obraService.listar({ status: StatusObra.EM_ANDAMENTO, size: 1 })
      .then(p => setObrasAndamento({ valor: p.totalElements, erro: false }))
      .catch(() => setObrasAndamento({ valor: null, erro: true }))

    servidorService.listar({ size: 1 })
      .then(p => setServidores({ valor: p.totalElements, erro: false }))
      .catch(() => setServidores({ valor: null, erro: true }))

    if (isAdministrador(usuario)) {
      auditoriaService.listar({ size: 6, sort: 'dataHora,desc' })
        .then(p => setAtividades(p.content))
        .catch(() => setErroAtividades(true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-admin-text">Olá, {usuario?.email?.split('@')[0]}</h1>
        <p className="text-sm text-admin-text-muted mt-0.5">
          {isAdministrador(usuario) ? 'Administrador' : 'Gerente'} · Portal da Transparência
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 lg:col-span-1">
          <CardKpi label="Licitações" estado={licitacoes} icone={MdGavel} destaque />
        </div>
        <CardKpi label="Contratos" estado={contratos} icone={MdAssignment} />
        <CardKpi label="Obras em andamento" estado={obrasAndamento} icone={MdApartment} />
        <CardKpi label="Servidores" estado={servidores} icone={MdBadge} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-admin-border bg-admin-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-admin-text">Atividade recente</h2>
            {isAdministrador(usuario) && (
              <Link href="/admin/auditoria" className="text-xs font-semibold text-admin-accent hover:underline flex items-center gap-1">
                Ver tudo <MdArrowOutward size={12} />
              </Link>
            )}
          </div>

          {!isAdministrador(usuario) && (
            <p className="text-sm text-admin-text-faint">Disponível apenas para administradores.</p>
          )}

          {isAdministrador(usuario) && erroAtividades && (
            <p className="text-sm text-admin-text-faint">Não foi possível carregar a atividade recente.</p>
          )}

          {isAdministrador(usuario) && !erroAtividades && atividades === null && (
            <div className="space-y-3" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-lg bg-admin-surface-2 animate-pulse" />
              ))}
            </div>
          )}

          {isAdministrador(usuario) && atividades !== null && atividades.length === 0 && (
            <p className="text-sm text-admin-text-faint">Nenhuma atividade registrada ainda.</p>
          )}

          {isAdministrador(usuario) && atividades !== null && atividades.length > 0 && (
            <ul className="space-y-1">
              {atividades.map(log => {
                const { icone: Icone, cor } = ICONE_ACAO[log.acao]
                return (
                  <li key={log.id} className="flex items-center gap-3 py-2 border-b border-admin-border last:border-0">
                    <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${cor}`}>
                      <Icone size={15} />
                    </span>
                    <p className="text-sm text-admin-text-muted min-w-0 flex-1 truncate">
                      <span className="text-admin-text font-medium">{log.usuarioEmail}</span>{' '}
                      {LABEL_ACAO[log.acao]} um registro em <span className="text-admin-text">{log.modulo}</span>
                    </p>
                    <span className="shrink-0 text-xs text-admin-text-faint tabular-nums">
                      {formatarDataHora(log.dataHora)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
            <h2 className="text-sm font-semibold text-admin-text mb-3">Ações rápidas</h2>
            <div className="grid grid-cols-2 gap-2">
              {ACOES_RAPIDAS.map(({ href, label, icone: Icone }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-start gap-2 rounded-xl border border-admin-border bg-admin-surface-2 p-3 text-xs font-medium text-admin-text-muted hover:border-admin-accent/40 hover:text-admin-text hover:bg-admin-surface-3 transition-colors"
                >
                  <Icone size={18} className="text-admin-accent" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
            <div className="flex items-center gap-2 mb-1">
              <MdAddCircleOutline size={16} className="text-admin-accent" />
              <h2 className="text-sm font-semibold text-admin-text">Módulos de gestão</h2>
            </div>
            <p className="text-sm text-admin-text-muted leading-relaxed">
              {REGISTRY_MODULOS_GENERICOS.length} módulos genéricos disponíveis na barra lateral,
              além das telas dedicadas de Licitações, Obras, RH e Diário Oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
