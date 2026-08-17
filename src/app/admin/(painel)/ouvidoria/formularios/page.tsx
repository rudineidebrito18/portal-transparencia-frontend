'use client'

import { useCallback } from 'react'

import Link from 'next/link'
import { MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import { ouvidoriaFormularioService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import { FiltroFormularioOuvidoria, FinalidadeOuvidoria, FormularioOuvidoria, LABELS_FINALIDADE_OUVIDORIA } from '@/modules/admin/esic-ouvidoria/types'
import { hrefDocumento } from '@/utils/documento'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

export default function OuvidoriaFormulariosAdminPage() {
  const fetchFunction = useCallback(
    (params: FiltroFormularioOuvidoria & { page?: number; size?: number; sort?: string }) => ouvidoriaFormularioService.listar(params),
    []
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    FormularioOuvidoria,
    FiltroFormularioOuvidoria
  >({ fetchFunction, initialSort: 'criadoEm,desc' })

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">Ouvidoria — Formulários Recebidos</h1>
      <p className="text-sm text-admin-text-muted">
        Somente leitura — o backend ainda não expõe edição/exclusão de manifestações da Ouvidoria.
      </p>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <select
          value={filtros.finalidade ?? ''}
          onChange={e => setFiltros({ ...filtros, finalidade: (e.target.value as FinalidadeOuvidoria) || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todas as finalidades</option>
          {(Object.keys(LABELS_FINALIDADE_OUVIDORIA) as FinalidadeOuvidoria[]).map(f => (
            <option key={f} value={f}>{LABELS_FINALIDADE_OUVIDORIA[f]}</option>
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma manifestação encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Finalidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Solicitante</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Comentário</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Anexo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Recebido em</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors align-top">
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-muted">
                        {LABELS_FINALIDADE_OUVIDORIA[item.finalidade]}
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
                    <td className="p-3.5 whitespace-nowrap text-admin-text-muted">{item.unidadeNome ?? '—'}</td>
                    <td className="p-3.5 max-w-lg text-admin-text-muted">{item.comentario}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      {item.caminhoArquivo ? (
                        <Link
                          href={hrefDocumento(ouvidoriaFormularioService.urlArquivo(item.id), `Manifestação de ${item.nome ?? 'anônimo'}`, { admin: true })}
                          className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                        >
                          <MdVisibility size={15} /> Ver anexo
                        </Link>
                      ) : (
                        <span className="text-admin-text-faint">—</span>
                      )}
                    </td>
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
