'use client'

import { useCallback } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { ouvidoriaFormularioService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import { FiltroFormularioOuvidoria, FinalidadeOuvidoria, FormularioOuvidoria, LABELS_FINALIDADE_OUVIDORIA } from '@/modules/admin/esic-ouvidoria/types'

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
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">Ouvidoria — Formulários Recebidos</h1>
      <p className="text-sm text-text-secondary/70">
        Somente leitura — o backend ainda não expõe edição/exclusão de manifestações da Ouvidoria.
      </p>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <select
          value={filtros.finalidade ?? ''}
          onChange={e => setFiltros({ ...filtros, finalidade: (e.target.value as FinalidadeOuvidoria) || undefined })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
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
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="E-mail..."
          defaultValue={filtros.email ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, email: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">De:</span>
          <input
            type="date"
            value={filtros.dataInicial ?? ''}
            onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">Até:</span>
          <input
            type="date"
            value={filtros.dataFinal ?? ''}
            onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </Card>

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma manifestação encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Finalidade</th>
                <th className="p-3">Solicitante</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Comentário</th>
                <th className="p-3">Anexo</th>
                <th className="p-3">Recebido em</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t border-border/20 align-top">
                  <td className="p-3 whitespace-nowrap">
                    <Badge className="bg-primary/10 text-primary">{LABELS_FINALIDADE_OUVIDORIA[item.finalidade]}</Badge>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {item.anonima ? (
                      <span className="text-text-secondary/60 italic">Anônimo</span>
                    ) : (
                      <>
                        <p className="font-semibold">{item.nome}</p>
                        <p className="text-xs text-text-secondary/60">{item.email}</p>
                      </>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">{item.unidadeNome ?? '—'}</td>
                  <td className="p-3 max-w-lg">{item.comentario}</td>
                  <td className="p-3 whitespace-nowrap">
                    {item.caminhoArquivo ? (
                      <a href={item.caminhoArquivo} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        Abrir
                      </a>
                    ) : (
                      <span className="text-text-secondary/40">—</span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">{formatarData(item.criadoEm)}</td>
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
