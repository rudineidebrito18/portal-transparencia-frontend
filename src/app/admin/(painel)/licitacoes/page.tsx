'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador, podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { licitacaoService } from '@/modules/admin/licitacoes/licitacao.service'
import {
  FiltroLicitacaoAdmin,
  LicitacaoRequest,
  LicitacaoResumo,
  StatusLicitacao,
  StatusLicitacaoDescricao,
  StatusLicitacaoStyle,
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

  const [alterandoVisibilidade, setAlterandoVisibilidade] = useState<number | null>(null)

  async function alternarVisibilidade(l: LicitacaoResumo) {
    const tornarVisivel = !l.visivel
    const mensagem = tornarVisivel
      ? 'Tornar esta licitação visível de novo na consulta pública?'
      : 'Ocultar esta licitação da consulta pública? Ela deixa de aparecer pra quem não é admin (não é exclusão — dá pra reverter depois).'
    if (!confirm(mensagem)) return

    setAlterandoVisibilidade(l.id)
    try {
      await licitacaoService.alterarVisibilidade(l.id, tornarVisivel)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao alterar visibilidade')
    } finally {
      setAlterandoVisibilidade(null)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Licitações</h1>

        {podeCriar(usuario, 'licitacoes') && !form && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova licitação
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <input
          placeholder="Nº instrumento..."
          defaultValue={filtros.numeroInstrumento ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, numeroInstrumento: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Nº processo..."
          defaultValue={filtros.numeroProcesso ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, numeroProcesso: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="number"
          placeholder="Ano..."
          defaultValue={filtros.ano ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, ano: Number((e.target as HTMLInputElement).value) || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm w-28"
        />
        <select
          value={filtros.status ?? ''}
          onChange={e => setFiltros({ ...filtros, status: e.target.value || undefined })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os status</option>
          {Object.values(StatusLicitacao).map(s => (
            <option key={s} value={s}>{StatusLicitacaoDescricao[s]}</option>
          ))}
        </select>
        <select
          value={filtros.tipoProcedimentoLicitacao ?? ''}
          onChange={e => setFiltros({ ...filtros, tipoProcedimentoLicitacao: e.target.value || undefined })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os procedimentos</option>
          {Object.values(TipoProcedimentoLicitacao).map(t => (
            <option key={t} value={t}>{TipoProcedimentoDescricao[t]}</option>
          ))}
        </select>
        {isAdministrador(usuario) && (
          <select
            value={String(filtros.visivel) === 'false' ? 'ocultas' : 'visiveis'}
            onChange={e => setFiltros({ ...filtros, visivel: e.target.value === 'ocultas' ? false : undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="visiveis">Visíveis</option>
            <option value="ocultas">Ocultas</option>
          </select>
        )}
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar licitação' : 'Nova licitação'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nº do instrumento</label>
                <input
                  required
                  value={form.numeroInstrumento}
                  onChange={e => setForm({ ...form, numeroInstrumento: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ano</label>
                <input
                  type="number"
                  required
                  value={form.ano}
                  onChange={e => setForm({ ...form, ano: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nº do processo</label>
                <input
                  required
                  value={form.numeroProcesso}
                  onChange={e => setForm({ ...form, numeroProcesso: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de publicação</label>
                <input
                  type="date"
                  required
                  value={form.dataPublicacao}
                  onChange={e => setForm({ ...form, dataPublicacao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data da sessão</label>
                <input
                  type="date"
                  required
                  value={form.dataSessao}
                  onChange={e => setForm({ ...form, dataSessao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de abertura</label>
                <input
                  type="date"
                  required
                  value={form.dataAbertura}
                  onChange={e => setForm({ ...form, dataAbertura: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de homologação</label>
                <input
                  type="date"
                  value={form.dataHomologacao ?? ''}
                  onChange={e => setForm({ ...form, dataHomologacao: e.target.value || undefined })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de procedimento</label>
                <select
                  required
                  value={form.tipoProcedimentoLicitacao}
                  onChange={e => setForm({ ...form, tipoProcedimentoLicitacao: e.target.value as TipoProcedimentoLicitacao })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(TipoProcedimentoLicitacao).map(t => (
                    <option key={t} value={t}>{TipoProcedimentoDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  required
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as StatusLicitacao })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(StatusLicitacao).map(s => (
                    <option key={s} value={s}>{StatusLicitacaoDescricao[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Valor estimado</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valorEstimado ?? ''}
                  onChange={e => setForm({ ...form, valorEstimado: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor adjudicado</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valorAdjudicado ?? ''}
                  onChange={e => setForm({ ...form, valorAdjudicado: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor da dotação</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.valorDotacao ?? ''}
                  onChange={e => setForm({ ...form, valorDotacao: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Unidade responsável</label>
                <input
                  value={form.unidade ?? ''}
                  onChange={e => setForm({ ...form, unidade: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Autoridade responsável</label>
                <input
                  value={form.nomeAutoridade ?? ''}
                  onChange={e => setForm({ ...form, nomeAutoridade: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sistema eletrônico</label>
                <input
                  value={form.sistemaEletronico ?? ''}
                  onChange={e => setForm({ ...form, sistemaEletronico: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Lei</label>
                <input
                  value={form.lei ?? ''}
                  onChange={e => setForm({ ...form, lei: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Regime de execução</label>
                <input
                  value={form.regimeExecucao ?? ''}
                  onChange={e => setForm({ ...form, regimeExecucao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.covid}
                    onChange={e => setForm({ ...form, covid: e.target.checked })}
                  />
                  Relacionada à COVID-19
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objeto</label>
              <textarea
                required
                rows={2}
                value={form.objeto}
                onChange={e => setForm({ ...form, objeto: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma licitação encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nº TCE</th>
                <th className="p-3">Instrumento</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Abertura</th>
                <th className="p-3">Valor total</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(l => (
                <tr key={l.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{l.numeroSequencial}</td>
                  <td className="p-3">{l.numeroInstrumento}/{l.ano}</td>
                  <td className="p-3">{l.tipoProcedimentoLicitacao}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        const statusKey = normalizarStatus(l.statusDescricao)
                        return (
                          <Badge className={statusKey ? StatusLicitacaoStyle[statusKey] : 'bg-gray-100 text-gray-600'}>
                            {statusKey ? StatusLicitacaoDescricao[statusKey] : l.statusDescricao}
                          </Badge>
                        )
                      })()}
                      {!l.visivel && <Badge className="bg-gray-100 text-gray-500">Oculta</Badge>}
                    </div>
                  </td>
                  <td className="p-3">{l.unidade ?? '—'}</td>
                  <td className="p-3">{formatarData(l.dataAbertura)}</td>
                  <td className="p-3">{formatarMoeda(l.valorTotalDespesa)}</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/admin/licitacoes/${l.id}`} className="text-primary hover:underline">
                      Ver
                    </Link>
                    {podeEditar(usuario, 'licitacoes') && (
                      <button
                        onClick={() => abrirEdicao(l.id)}
                        disabled={carregandoEdicao === l.id}
                        className="text-primary hover:underline disabled:opacity-60"
                      >
                        {carregandoEdicao === l.id ? 'Carregando...' : 'Editar'}
                      </button>
                    )}
                    {podeExcluir(usuario, 'licitacoes') && (
                      <button
                        onClick={() => alternarVisibilidade(l)}
                        disabled={alterandoVisibilidade === l.id}
                        className="text-primary hover:underline disabled:opacity-60 inline-flex items-center gap-1"
                      >
                        {l.visivel ? <MdVisibilityOff /> : <MdVisibility />}
                        {alterandoVisibilidade === l.id ? 'Aguarde...' : l.visivel ? 'Ocultar' : 'Mostrar'}
                      </button>
                    )}
                  </td>
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
