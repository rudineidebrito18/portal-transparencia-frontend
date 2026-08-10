'use client'

import { useCallback } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import { esicFormularioService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import { FiltroFormularioEsic, FormularioEsic, LABELS_TIPO_SOLICITACAO_ESIC, TipoSolicitacaoEsic } from '@/modules/admin/esic-ouvidoria/types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function EsicFormulariosAdminPage() {
  const fetchFunction = useCallback(
    (params: FiltroFormularioEsic & { page?: number; size?: number; sort?: string }) => esicFormularioService.listar(params),
    []
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    FormularioEsic,
    FiltroFormularioEsic
  >({ fetchFunction, initialSort: 'criadoEm,desc' })

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">E-SIC — Formulários Recebidos</h1>
      <p className="text-sm text-admin-text-muted">
        Somente leitura — o backend ainda não expõe edição/exclusão de solicitações do E-SIC.
      </p>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <select
          value={filtros.tipoSolicitacao ?? ''}
          onChange={e => setFiltros({ ...filtros, tipoSolicitacao: (e.target.value as TipoSolicitacaoEsic) || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os tipos</option>
          {(Object.keys(LABELS_TIPO_SOLICITACAO_ESIC) as TipoSolicitacaoEsic[]).map(t => (
            <option key={t} value={t}>{LABELS_TIPO_SOLICITACAO_ESIC[t]}</option>
          ))}
        </select>
        <input
          placeholder="Nome..."
          defaultValue={filtros.nome ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, nome: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="E-mail..."
          defaultValue={filtros.email ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, email: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>De:</span>
          <input
            type="date"
            value={filtros.dataInicial ?? ''}
            onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Até:</span>
          <input
            type="date"
            value={filtros.dataFinal ?? ''}
            onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum formulário encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Solicitante</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Solicitação</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Recebido em</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors align-top">
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-muted">
                        {LABELS_TIPO_SOLICITACAO_ESIC[item.tipoSolicitacao]}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {item.anonima ? (
                        <span className="text-admin-text-faint italic">Anônimo</span>
                      ) : (
                        <>
                          <p className="font-semibold text-admin-text">{item.nome}</p>
                          <p className="text-xs text-admin-text-faint">{item.email}</p>
                        </>
                      )}
                    </td>
                    <td className="p-3.5 max-w-lg text-admin-text-muted">{item.solicitacao}</td>
                    <td className="p-3.5 whitespace-nowrap text-admin-text-muted tabular-nums">{formatarData(item.criadoEm)}</td>
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
