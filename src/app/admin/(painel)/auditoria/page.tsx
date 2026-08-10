'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { auditoriaService } from '@/modules/admin/auditoria/auditoria.service'
import { AcaoAuditoria, AuditLog, FiltroAuditoria } from '@/modules/admin/auditoria/types'

const ACAO_LABEL: Record<AcaoAuditoria, string> = {
  CRIACAO: 'Criação',
  EDICAO: 'Edição',
  EXCLUSAO: 'Exclusão'
}

const ACAO_ESTILO: Record<AcaoAuditoria, { pill: string; dot: string }> = {
  CRIACAO: { pill: 'bg-admin-success-light text-admin-success', dot: 'bg-admin-success' },
  EDICAO: { pill: 'bg-admin-info-light text-admin-info', dot: 'bg-admin-info' },
  EXCLUSAO: { pill: 'bg-admin-error-light text-admin-error', dot: 'bg-admin-error' }
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

export default function AuditoriaPage() {
  const { usuario } = useAuth()

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    AuditLog,
    FiltroAuditoria
  >({ fetchFunction: auditoriaService.listar, initialSort: 'dataHora,desc' })

  if (!isAdministrador(usuario)) {
    return <AdminErrorState title="Acesso restrito" message="Apenas administradores podem ver o log de auditoria." />
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold text-admin-text">Auditoria</h1>
        <p className="text-sm text-admin-text-muted">
          Registro de quem criou/editou/excluiu o quê — cobre todos os módulos do sistema,
          incluindo licitações, obras, RH específico e diário oficial.
        </p>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          type="number"
          placeholder="ID do usuário"
          defaultValue={filtros.usuarioId ?? ''}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const valor = (e.target as HTMLInputElement).value
              setFiltros({ ...filtros, usuarioId: valor ? Number(valor) : undefined })
            }
          }}
          className={`${classeInput} w-36`}
        />
        <input
          placeholder="Módulo (ex: Fornecedor, Cargo, Notícia)"
          defaultValue={filtros.modulo ?? ''}
          onKeyDown={e => {
            if (e.key === 'Enter') setFiltros({ ...filtros, modulo: (e.target as HTMLInputElement).value })
          }}
          className={`${classeInput} flex-1 min-w-[240px]`}
        />
        <input
          type="datetime-local"
          value={filtros.dataInicial ?? ''}
          onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
          className={`${classeInput} w-auto`}
        />
        <input
          type="datetime-local"
          value={filtros.dataFinal ?? ''}
          onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
          className={`${classeInput} w-auto`}
        />
      </div>

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum registro de auditoria encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Quando</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Usuário</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Ação</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Módulo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Registro</th>
                </tr>
              </thead>
              <tbody>
                {data.map(log => (
                  <tr key={log.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{new Date(log.dataHora).toLocaleString('pt-BR')}</td>
                    <td className="p-3.5 text-admin-text">{log.usuarioEmail}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${ACAO_ESTILO[log.acao].pill}`}>
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${ACAO_ESTILO[log.acao].dot}`} />
                        {ACAO_LABEL[log.acao]}
                      </span>
                    </td>
                    <td className="p-3.5 text-admin-text-muted">{log.modulo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">#{log.entidadeId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}
