'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { auditoriaService } from '@/modules/admin/auditoria/auditoria.service'
import { AcaoAuditoria, AuditLog, FiltroAuditoria } from '@/modules/admin/auditoria/types'

const ACAO_LABEL: Record<AcaoAuditoria, string> = {
  CRIACAO: 'Criação',
  EDICAO: 'Edição',
  EXCLUSAO: 'Exclusão'
}

const ACAO_COR: Record<AcaoAuditoria, string> = {
  CRIACAO: 'bg-success/10 text-success',
  EDICAO: 'bg-accent/10 text-accent',
  EXCLUSAO: 'bg-error/10 text-error'
}

export default function AuditoriaPage() {
  const { usuario } = useAuth()

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    AuditLog,
    FiltroAuditoria
  >({ fetchFunction: auditoriaService.listar, initialSort: 'dataHora,desc' })

  if (!isAdministrador(usuario)) {
    return <ErrorState title="Acesso restrito" message="Apenas administradores podem ver o log de auditoria." />
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-primary">Auditoria</h1>
        <p className="text-sm text-text-secondary/70">
          Registro de quem criou/editou/excluiu o quê. Cobre só os módulos do padrão genérico
          (Renúncia Fiscal, PPA, Lei etc.) e a gestão de usuários por enquanto — módulos
          próprios (licitações, obras, RH específico, diário oficial) ainda não geram registro.
        </p>
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
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
          className="border border-border/30 rounded-lg px-3 py-2 text-sm w-36"
        />
        <input
          placeholder="Módulo (ex: recursos-humanos/estagiarios)"
          defaultValue={filtros.modulo ?? ''}
          onKeyDown={e => {
            if (e.key === 'Enter') setFiltros({ ...filtros, modulo: (e.target as HTMLInputElement).value })
          }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm flex-1 min-w-[240px]"
        />
        <input
          type="datetime-local"
          value={filtros.dataInicial ?? ''}
          onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="datetime-local"
          value={filtros.dataFinal ?? ''}
          onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
      </Card>

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhum registro de auditoria encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Quando</th>
                <th className="p-3">Usuário</th>
                <th className="p-3">Ação</th>
                <th className="p-3">Módulo</th>
                <th className="p-3">Registro</th>
              </tr>
            </thead>
            <tbody>
              {data.map(log => (
                <tr key={log.id} className="border-t border-border/20">
                  <td className="p-3 whitespace-nowrap">{new Date(log.dataHora).toLocaleString('pt-BR')}</td>
                  <td className="p-3">{log.usuarioEmail}</td>
                  <td className="p-3">
                    <Badge className={ACAO_COR[log.acao]}>{ACAO_LABEL[log.acao]}</Badge>
                  </td>
                  <td className="p-3">{log.modulo}</td>
                  <td className="p-3">#{log.entidadeId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}
