'use client'

import { FormEvent, useCallback, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import { esicFormularioService } from '@/modules/admin/esic-ouvidoria/esic-ouvidoria.service'
import {
  FiltroFormularioEsic,
  FormularioEsic,
  GrauSigilo,
  LABELS_GRAU_SIGILO,
  LABELS_STATUS_ESIC,
  LABELS_TIPO_SOLICITACAO_ESIC,
  StatusEsic,
  TipoSolicitacaoEsic
} from '@/modules/admin/esic-ouvidoria/types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(data).toLocaleDateString('pt-BR')
}

interface FormState {
  id: number
  status: StatusEsic
  grauSigilo: GrauSigilo
  resposta: string
}

export default function EsicFormulariosAdminPage() {
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroFormularioEsic & { page?: number; size?: number; sort?: string }) => esicFormularioService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    FormularioEsic,
    FiltroFormularioEsic
  >({ fetchFunction, initialSort: 'criadoEm,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirTriagem(item: FormularioEsic) {
    setErroForm(null)
    setForm({ id: item.id, status: item.status, grauSigilo: item.grauSigilo, resposta: item.resposta ?? '' })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)
    try {
      await esicFormularioService.atualizarStatus(form.id, {
        status: form.status,
        grauSigilo: form.grauSigilo,
        resposta: form.resposta
      })
      setForm(null)
      recarregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">E-SIC — Formulários Recebidos</h1>
      <p className="text-sm text-admin-text-muted">
        Grau de sigilo, status e resposta são definidos aqui na triagem — a solicitação chega sempre
        como Pública/Recebida. Solicitações com grau Público e status Respondida aparecem na aba
        &quot;Solicitações Públicas&quot; da página pública do E-SIC.
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

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Triagem — solicitação #{form.id}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="status">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as StatusEsic })}
                  className={classeInput}
                >
                  {(Object.keys(LABELS_STATUS_ESIC) as StatusEsic[]).map(s => (
                    <option key={s} value={s}>{LABELS_STATUS_ESIC[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="grauSigilo">Grau de sigilo</label>
                <select
                  id="grauSigilo"
                  value={form.grauSigilo}
                  onChange={e => setForm({ ...form, grauSigilo: e.target.value as GrauSigilo })}
                  className={classeInput}
                >
                  {(Object.keys(LABELS_GRAU_SIGILO) as GrauSigilo[]).map(g => (
                    <option key={g} value={g}>{LABELS_GRAU_SIGILO[g]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="resposta">
                Resposta {form.grauSigilo === 'PUBLICO' && '(visível publicamente se o status for Respondida)'}
              </label>
              <textarea
                id="resposta"
                rows={5}
                value={form.resposta}
                onChange={e => setForm({ ...form, resposta: e.target.value })}
                className={classeInput}
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

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
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Protocolo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Solicitante</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Solicitação</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Sigilo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Recebido em</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors align-top">
                    <td className="p-3.5 whitespace-nowrap text-admin-text-muted font-mono text-xs">{item.protocolo}</td>
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
                    <td className="p-3.5 whitespace-nowrap text-admin-text-muted">{LABELS_STATUS_ESIC[item.status]}</td>
                    <td className="p-3.5 whitespace-nowrap text-admin-text-muted">{LABELS_GRAU_SIGILO[item.grauSigilo]}</td>
                    <td className="p-3.5 whitespace-nowrap text-admin-text-muted tabular-nums">{formatarData(item.criadoEm)}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => abrirTriagem(item)}
                        className="px-3 py-1.5 rounded-lg border border-admin-border text-xs font-semibold text-admin-accent hover:bg-admin-surface-3 transition-colors whitespace-nowrap"
                      >
                        Triagem
                      </button>
                    </td>
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
