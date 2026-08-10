'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MdChevronRight, MdEdit, MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador, podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { licitacaoService } from '@/modules/admin/licitacoes/licitacao.service'
import {
  FiltroLicitacaoAdmin,
  LicitacaoRequest,
  LicitacaoResumo,
  StatusLicitacao,
  StatusLicitacaoDescricao,
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao,
  normalizarStatus,
  normalizarTipoProcedimento
} from '@/modules/admin/licitacoes/types'

type LicitacaoFormState = { id: number | null } & LicitacaoRequest

const FORM_VAZIO: LicitacaoRequest = {
  numeroInstrumento: '',
  ano: new Date().getFullYear(),
  numeroProcesso: '',
  dataPublicacao: '',
  dataSessao: '',
  dataAbertura: '',
  tipoProcedimentoLicitacao: TipoProcedimentoLicitacao.PE,
  status: StatusLicitacao.EM_ABERTO,
  unidade: '',
  nomeAutoridade: '',
  covid: false,
  objeto: ''
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

type TomStatus = 'info' | 'success' | 'error' | 'neutro'

// "Em aberto"/"em andamento" (e as variantes SINC-Contrata) tratados como
// informativo (processo em curso), concluído como sucesso, deserta/fracassada/anulada
// como erro (não resultou em contratação), e os demais (suspenso, incluído pelo
// sistema) como neutro.
const TOM_STATUS_LICITACAO: Record<StatusLicitacao, TomStatus> = {
  [StatusLicitacao.EM_ABERTO]: 'info',
  [StatusLicitacao.SINC_ABERTO]: 'info',
  [StatusLicitacao.EM_ANDAMENTO]: 'info',
  [StatusLicitacao.SINC_ANDAMENTO]: 'info',
  [StatusLicitacao.FINALIZADO]: 'success',
  [StatusLicitacao.SUSPENSO]: 'neutro',
  [StatusLicitacao.DESERTA]: 'error',
  [StatusLicitacao.FRACASSADA]: 'error',
  [StatusLicitacao.ANULADA]: 'error',
  [StatusLicitacao.INCLUIDO_SISTEMA]: 'neutro'
}

const CLASSES_TOM: Record<TomStatus, { pill: string; dot: string }> = {
  info: { pill: 'bg-admin-info-light text-admin-info', dot: 'bg-admin-info' },
  success: { pill: 'bg-admin-success-light text-admin-success', dot: 'bg-admin-success' },
  error: { pill: 'bg-admin-error-light text-admin-error', dot: 'bg-admin-error' },
  neutro: { pill: 'bg-admin-surface-3 text-admin-text-muted', dot: 'bg-admin-text-faint' }
}

function BadgeStatusLicitacao({ statusDescricao }: { statusDescricao: string }) {
  const statusKey = normalizarStatus(statusDescricao)
  const tom = statusKey ? TOM_STATUS_LICITACAO[statusKey] : 'neutro'
  const label = statusKey ? StatusLicitacaoDescricao[statusKey] : statusDescricao
  const { pill, dot } = CLASSES_TOM[tom]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pill}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

function formatarMoeda(valor?: number) {
  if (valor === undefined || valor === null) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function LicitacoesAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroLicitacaoAdmin & { page?: number; size?: number; sort?: string }) => licitacaoService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, filtros, setFiltros, setPagina } = usePageableResource<
    LicitacaoResumo,
    FiltroLicitacaoAdmin
  >({ fetchFunction, initialSort: 'dataAbertura,desc' })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    unidadesService.listar({ size: 200, sort: 'nome,asc' }).then(p => setUnidades(p.content)).catch(() => {})
  }, [])

  const [form, setForm] = useState<LicitacaoFormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [carregandoEdicao, setCarregandoEdicao] = useState<number | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm({ id: null, ...FORM_VAZIO })
  }

  async function abrirEdicao(id: number) {
    setErroForm(null)
    setCarregandoEdicao(id)
    try {
      const l = await licitacaoService.buscarPorId(id)
      setForm({
        id,
        numeroInstrumento: l.numeroInstrumento,
        ano: l.ano,
        numeroProcesso: l.numeroProcesso,
        dataPublicacao: l.dataPublicacao,
        dataSessao: l.dataSessao,
        dataAbertura: l.dataAbertura,
        dataHomologacao: l.dataHomologacao,
        valorEstimado: l.valorEstimado,
        valorAdjudicado: l.valorAdjudicado,
        valorDotacao: l.valorDotacao,
        tipoProcedimentoLicitacao: normalizarTipoProcedimento(l.tipoProcedimentoLicitacao) ?? TipoProcedimentoLicitacao.PE,
        status: normalizarStatus(l.status) ?? StatusLicitacao.EM_ABERTO,
        tipoCriterio: l.tipoCriterio,
        regimeExecucao: l.regimeExecucao,
        finalidade: l.finalidade,
        tipoResultado: l.tipoResultado,
        naturezaDespesa: l.naturezaDespesa,
        origemRecurso: l.origemRecurso,
        unidade: l.unidade,
        nomeAutoridade: l.nomeAutoridade,
        sistemaEletronico: l.sistemaEletronico,
        lei: l.lei,
        covid: l.covid,
        objeto: l.objeto
      })
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao carregar licitação')
    } finally {
      setCarregandoEdicao(null)
    }
  }

  const [licitacaoParaAlternar, setLicitacaoParaAlternar] = useState<LicitacaoResumo | null>(null)
  const [alterandoVisibilidade, setAlterandoVisibilidade] = useState(false)

  async function confirmarAlternarVisibilidade() {
    if (!licitacaoParaAlternar) return

    const tornarVisivel = !licitacaoParaAlternar.visivel
    setAlterandoVisibilidade(true)
    try {
      await licitacaoService.alterarVisibilidade(licitacaoParaAlternar.id, tornarVisivel)
      setLicitacaoParaAlternar(null)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao alterar visibilidade')
    } finally {
      setAlterandoVisibilidade(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const { id, ...dados } = form

    try {
      if (id) {
        await licitacaoService.atualizar(id, dados)
      } else {
        await licitacaoService.criar(dados)
      }
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
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">Licitações</h1>

        {podeCriar(usuario, 'licitacoes') && !form && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova licitação
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Nº instrumento..."
          defaultValue={filtros.numeroInstrumento ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, numeroInstrumento: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="Nº processo..."
          defaultValue={filtros.numeroProcesso ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, numeroProcesso: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          type="number"
          placeholder="Ano..."
          defaultValue={filtros.ano ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, ano: Number((e.target as HTMLInputElement).value) || undefined }) }}
          className={`${classeInput} w-28`}
        />
        <select
          value={filtros.status ?? ''}
          onChange={e => setFiltros({ ...filtros, status: e.target.value || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os status</option>
          {Object.values(StatusLicitacao).map(s => (
            <option key={s} value={s}>{StatusLicitacaoDescricao[s]}</option>
          ))}
        </select>
        <select
          value={filtros.tipoProcedimentoLicitacao ?? ''}
          onChange={e => setFiltros({ ...filtros, tipoProcedimentoLicitacao: e.target.value || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os procedimentos</option>
          {Object.values(TipoProcedimentoLicitacao).map(t => (
            <option key={t} value={t}>{TipoProcedimentoDescricao[t]}</option>
          ))}
        </select>
        <select
          value={filtros.unidadeId ?? ''}
          onChange={e => setFiltros({ ...filtros, unidadeId: e.target.value ? Number(e.target.value) : undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todas as unidades (Órgãos)</option>
          {unidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
        {isAdministrador(usuario) && (
          <select
            value={String(filtros.visivel) === 'false' ? 'ocultas' : 'visiveis'}
            onChange={e => setFiltros({ ...filtros, visivel: e.target.value === 'ocultas' ? false : undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="visiveis">Visíveis</option>
            <option value="ocultas">Ocultas</option>
          </select>
        )}
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar licitação' : 'Nova licitação'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numeroInstrumento">Nº do instrumento</label>
                <input
                  id="numeroInstrumento"
                  required
                  value={form.numeroInstrumento}
                  onChange={e => setForm({ ...form, numeroInstrumento: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  required
                  value={form.ano}
                  onChange={e => setForm({ ...form, ano: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="numeroProcesso">Nº do processo</label>
                <input
                  id="numeroProcesso"
                  required
                  value={form.numeroProcesso}
                  onChange={e => setForm({ ...form, numeroProcesso: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataPublicacao">Data de publicação</label>
                <input
                  id="dataPublicacao"
                  type="date"
                  required
                  value={form.dataPublicacao}
                  onChange={e => setForm({ ...form, dataPublicacao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataSessao">Data da sessão</label>
                <input
                  id="dataSessao"
                  type="date"
                  required
                  value={form.dataSessao}
                  onChange={e => setForm({ ...form, dataSessao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataAbertura">Data de abertura</label>
                <input
                  id="dataAbertura"
                  type="date"
                  required
                  value={form.dataAbertura}
                  onChange={e => setForm({ ...form, dataAbertura: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataHomologacao">Data de homologação</label>
                <input
                  id="dataHomologacao"
                  type="date"
                  value={form.dataHomologacao ?? ''}
                  onChange={e => setForm({ ...form, dataHomologacao: e.target.value || undefined })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="tipoProcedimentoLicitacao">Tipo de procedimento</label>
                <select
                  id="tipoProcedimentoLicitacao"
                  required
                  value={form.tipoProcedimentoLicitacao}
                  onChange={e => setForm({ ...form, tipoProcedimentoLicitacao: e.target.value as TipoProcedimentoLicitacao })}
                  className={classeInput}
                >
                  {Object.values(TipoProcedimentoLicitacao).map(t => (
                    <option key={t} value={t}>{TipoProcedimentoDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="status">Status</label>
                <select
                  id="status"
                  required
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as StatusLicitacao })}
                  className={classeInput}
                >
                  {Object.values(StatusLicitacao).map(s => (
                    <option key={s} value={s}>{StatusLicitacaoDescricao[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="valorEstimado">Valor estimado</label>
                <input
                  id="valorEstimado"
                  type="number"
                  step="0.01"
                  value={form.valorEstimado ?? ''}
                  onChange={e => setForm({ ...form, valorEstimado: e.target.value ? Number(e.target.value) : undefined })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorAdjudicado">Valor adjudicado</label>
                <input
                  id="valorAdjudicado"
                  type="number"
                  step="0.01"
                  value={form.valorAdjudicado ?? ''}
                  onChange={e => setForm({ ...form, valorAdjudicado: e.target.value ? Number(e.target.value) : undefined })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorDotacao">Valor da dotação</label>
                <input
                  id="valorDotacao"
                  type="number"
                  step="0.01"
                  value={form.valorDotacao ?? ''}
                  onChange={e => setForm({ ...form, valorDotacao: e.target.value ? Number(e.target.value) : undefined })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="unidade">Unidade responsável</label>
                <input
                  id="unidade"
                  value={form.unidade ?? ''}
                  onChange={e => setForm({ ...form, unidade: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="nomeAutoridade">Autoridade responsável</label>
                <input
                  id="nomeAutoridade"
                  value={form.nomeAutoridade ?? ''}
                  onChange={e => setForm({ ...form, nomeAutoridade: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="sistemaEletronico">Sistema eletrônico</label>
                <input
                  id="sistemaEletronico"
                  value={form.sistemaEletronico ?? ''}
                  onChange={e => setForm({ ...form, sistemaEletronico: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="lei">Lei</label>
                <input
                  id="lei"
                  value={form.lei ?? ''}
                  onChange={e => setForm({ ...form, lei: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="regimeExecucao">Regime de execução</label>
                <input
                  id="regimeExecucao"
                  value={form.regimeExecucao ?? ''}
                  onChange={e => setForm({ ...form, regimeExecucao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-admin-text-muted">
                  <input
                    type="checkbox"
                    checked={form.covid}
                    onChange={e => setForm({ ...form, covid: e.target.checked })}
                    className="rounded border-admin-border accent-admin-accent"
                  />
                  Relacionada à COVID-19
                </label>
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="objeto">Objeto</label>
              <textarea
                id="objeto"
                required
                rows={2}
                value={form.objeto}
                onChange={e => setForm({ ...form, objeto: e.target.value })}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma licitação encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº TCE</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Instrumento</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Abertura</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor total</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(l => (
                  <tr key={l.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text tabular-nums">{l.numeroSequencial}</td>
                    <td className="p-3.5 text-admin-text">{l.numeroInstrumento}/{l.ano}</td>
                    <td className="p-3.5 text-admin-text-muted">{l.tipoProcedimentoLicitacao}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <BadgeStatusLicitacao statusDescricao={l.statusDescricao} />
                        {!l.visivel && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-faint">
                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-text-faint" />
                            Oculta
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-admin-text-muted">{l.unidade ?? '—'}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(l.dataAbertura)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(l.valorTotalDespesa)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/licitacoes/${l.id}`}
                          aria-label="Ver detalhes"
                          className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </Link>
                        {podeEditar(usuario, 'licitacoes') && (
                          <button
                            onClick={() => abrirEdicao(l.id)}
                            disabled={carregandoEdicao === l.id}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors disabled:opacity-60"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'licitacoes') && (
                          <button
                            onClick={() => setLicitacaoParaAlternar(l)}
                            aria-label={l.visivel ? 'Ocultar' : 'Mostrar'}
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            {l.visivel ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

      <ConfirmDialog
        aberto={licitacaoParaAlternar !== null}
        titulo={licitacaoParaAlternar?.visivel ? 'Ocultar licitação?' : 'Tornar licitação visível?'}
        mensagem={
          licitacaoParaAlternar?.visivel
            ? 'Ela deixa de aparecer na consulta pública para quem não é admin. Não é exclusão — dá pra reverter depois.'
            : 'Ela volta a aparecer normalmente na consulta pública.'
        }
        confirmarLabel={licitacaoParaAlternar?.visivel ? 'Ocultar' : 'Tornar visível'}
        perigoso={licitacaoParaAlternar?.visivel}
        carregando={alterandoVisibilidade}
        onConfirmar={confirmarAlternarVisibilidade}
        onCancelar={() => setLicitacaoParaAlternar(null)}
      />
    </div>
  )
}
