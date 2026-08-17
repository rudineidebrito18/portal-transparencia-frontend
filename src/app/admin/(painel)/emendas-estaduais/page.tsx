'use client'

import { FormEvent, useCallback, useState } from 'react'

import { MdEdit, MdDeleteOutline, MdSearch, MdTravelExplore } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import {
  FonteEmenda,
  FonteEmendaDescricao,
  OrigemCadastroEmenda,
  OrigemCadastroEmendaDescricao
} from '@/modules/emendas-estaduais/enums'
import { emendaEstadualService } from '@/modules/admin/emendas-estaduais/emendaEstadual.service'
import { EmendaEstadual, EmendaEstadualDescoberta, EmendaEstadualRequest, FiltroEmendaEstadual } from '@/modules/admin/emendas-estaduais/types'

interface FormState extends EmendaEstadualRequest {
  id: number | null
}

const FORM_VAZIO: FormState = {
  id: null,
  codigoEmenda: '',
  ano: null,
  parlamentarNome: '',
  tipo: '',
  modalidade: '',
  unidadeGestora: '',
  nomeUnidadeGestora: '',
  empenhos: '',
  entidadeBeneficiada: '',
  localizadorGasto: '',
  objeto: '',
  funcao: '',
  subfuncao: '',
  acao: '',
  subacao: '',
  valorSolicitado: null,
  valorRepasse: null,
  valorPreEmpenhado: null,
  valorEmpenhado: null,
  valorLiquidado: null,
  valorPago: null,
  codigoFavorecido: '',
  fonteOrigem: null,
  linkDetalhes: '',
  viaBuscaAssistida: false
}

const anoAtual = new Date().getFullYear()
const ANOS = Array.from({ length: 10 }, (_, i) => anoAtual - i)

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarMoeda(valor: number | null) {
  if (valor === null) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function EmendasEstaduaisAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroEmendaEstadual & { page?: number; size?: number; sort?: string }) => emendaEstadualService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    EmendaEstadual,
    FiltroEmendaEstadual
  >({ fetchFunction, initialSort: 'atualizadoEm,desc' })

  // Fluxo de cadastro em 2 passos: primeiro busca por código no Portal MA (o ano vem embutido no
  // próprio código EPI.<ano>.<sequencial>); só abre o formulário depois.
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [codigoBusca, setCodigoBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscaMensagem, setBuscaMensagem] = useState<string | null>(null)

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  // Busca por município (complementar à busca por código): traz todas as emendas estaduais do
  // ano corrente pro município de uma vez, sem exigir código conhecido.
  const [descobertaAberta, setDescobertaAberta] = useState(false)
  const [descobrindo, setDescobrindo] = useState(false)
  const [descobertaErro, setDescobertaErro] = useState<string | null>(null)
  const [descobertas, setDescobertas] = useState<EmendaEstadualDescoberta[] | null>(null)
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [importando, setImportando] = useState(false)

  function abrirBusca() {
    setCodigoBusca('')
    setBuscaMensagem(null)
    setBuscaAberta(true)
  }

  async function executarBusca() {
    if (!codigoBusca.trim()) return

    setBuscando(true)
    setBuscaMensagem(null)
    try {
      const encontrada = await emendaEstadualService.buscarAssistido(codigoBusca.trim())
      if (encontrada) {
        setForm({ id: null, ...encontrada, viaBuscaAssistida: true })
        setBuscaAberta(false)
      } else {
        setBuscaMensagem('Não encontrada no Portal da Transparência do MA. Você pode cadastrar manualmente.')
      }
    } catch (e: unknown) {
      setBuscaMensagem(e instanceof Error ? e.message : 'Erro ao buscar')
    } finally {
      setBuscando(false)
    }
  }

  function cadastrarManualmente() {
    setForm({ ...FORM_VAZIO, codigoEmenda: codigoBusca.trim() })
    setBuscaAberta(false)
  }

  function abrirEdicao(e: EmendaEstadual) {
    setErroForm(null)
    setForm({ ...e, id: e.id, viaBuscaAssistida: false })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await emendaEstadualService.excluir(idParaExcluir)
      setIdParaExcluir(null)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const { id, ...dados } = form
    const request: EmendaEstadualRequest = dados

    try {
      if (id) {
        await emendaEstadualService.atualizar(id, request)
      } else {
        await emendaEstadualService.criar(request)
      }

      setForm(null)
      recarregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  async function abrirDescoberta() {
    setDescobertaAberta(true)
    setDescobertaErro(null)
    setDescobertas(null)
    setSelecionadas(new Set())
    setDescobrindo(true)
    try {
      const resultado = await emendaEstadualService.descobrirDoMunicipio()
      setDescobertas(resultado)
      setSelecionadas(new Set(resultado.filter(d => !d.jaCadastrada).map(d => d.dados.codigoEmenda)))
    } catch (e: unknown) {
      setDescobertaErro(e instanceof Error ? e.message : 'Erro ao buscar emendas do município')
    } finally {
      setDescobrindo(false)
    }
  }

  function alternarSelecao(codigo: string) {
    setSelecionadas(prev => {
      const proximo = new Set(prev)
      if (proximo.has(codigo)) proximo.delete(codigo)
      else proximo.add(codigo)
      return proximo
    })
  }

  async function importarSelecionadas() {
    if (selecionadas.size === 0) return

    setImportando(true)
    setDescobertaErro(null)
    try {
      await emendaEstadualService.importarDoMunicipio(Array.from(selecionadas))
      setDescobertaAberta(false)
      recarregar()
    } catch (e: unknown) {
      setDescobertaErro(e instanceof Error ? e.message : 'Erro ao importar')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">Emendas Estaduais</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <div className="flex gap-2">
            <button
              onClick={abrirDescoberta}
              className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text hover:bg-admin-surface-3 transition-all flex items-center gap-2"
            >
              <MdTravelExplore size={16} />
              Buscar emendas do município
            </button>
            <button
              onClick={abrirBusca}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
            >
              + Nova emenda
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <div>
          <label className={classeLabel} htmlFor="ano">Ano</label>
          <select
            id="ano"
            value={filtros.ano ?? ''}
            onChange={e => setFiltros({ ...filtros, ano: e.target.value ? Number(e.target.value) : undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="">Todos</option>
            {ANOS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BUSCA POR MUNICÍPIO: traz tudo de uma vez, admin escolhe o que importar */}
      {descobertaAberta && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-admin-text">Emendas do município no Portal MA</h2>
            <button
              type="button"
              onClick={() => setDescobertaAberta(false)}
              className="text-xs text-admin-text-muted hover:text-admin-text"
            >
              Fechar
            </button>
          </div>

          {descobrindo && (
            <p className="text-sm text-admin-text-muted">Buscando pelo município no Portal MA (ano corrente)...</p>
          )}

          {descobertaErro && <AdminErrorState message={descobertaErro} />}

          {!descobrindo && descobertas && descobertas.length === 0 && !descobertaErro && (
            <p className="text-sm text-admin-text-muted">Nenhuma emenda encontrada pro município no Portal MA este ano.</p>
          )}

          {!descobrindo && descobertas && descobertas.length > 0 && (
            <>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {descobertas.map(d => (
                  <label
                    key={d.dados.codigoEmenda}
                    className="flex items-start gap-3 p-3 rounded-lg border border-admin-border hover:bg-admin-surface-3/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      aria-label={`Selecionar emenda ${d.dados.codigoEmenda}`}
                      checked={selecionadas.has(d.dados.codigoEmenda)}
                      onChange={() => alternarSelecao(d.dados.codigoEmenda)}
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-admin-text">{d.dados.codigoEmenda}</span>
                        <span className="text-admin-text-muted">{d.dados.parlamentarNome ?? '—'}</span>
                        {d.jaCadastrada && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-admin-surface-3 text-admin-text-muted">
                            Já cadastrada — importar atualiza os valores
                          </span>
                        )}
                      </div>
                      <p className="text-admin-text-muted text-xs mt-0.5">{d.dados.objeto ?? '—'}</p>
                      <p className="text-admin-text-muted text-xs tabular-nums">{formatarMoeda(d.dados.valorRepasse)}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={importarSelecionadas}
                  disabled={importando || selecionadas.size === 0}
                  className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
                >
                  {importando ? 'Importando...' : `Importar selecionadas (${selecionadas.size})`}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* PASSO 1: BUSCA ASSISTIDA */}
      {buscaAberta && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <h2 className="font-semibold text-sm text-admin-text">Nova emenda estadual</h2>
          <p className="text-xs text-admin-text-faint">
            Digite o código oficial da emenda (ex.: EPI.2026.05266) pra buscar os dados no Portal
            da Transparência do MA e pré-preencher o formulário. Se não achar, você cadastra manualmente.
          </p>

          <div className="flex gap-2">
            <input
              placeholder="Código da emenda"
              value={codigoBusca}
              onChange={e => setCodigoBusca(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') executarBusca() }}
              className={classeInput}
            />
            <button
              type="button"
              onClick={executarBusca}
              disabled={buscando || !codigoBusca.trim()}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
            >
              <MdSearch size={16} />
              {buscando ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {buscaMensagem && (
            <div className="text-sm text-admin-text-muted bg-admin-surface-3 rounded-lg p-3">
              {buscaMensagem}
            </div>
          )}

          <div className="flex gap-2">
            {buscaMensagem && (
              <button
                type="button"
                onClick={cadastrarManualmente}
                className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text hover:bg-admin-surface-3 transition-all"
              >
                Cadastrar manualmente
              </button>
            )}
            <button
              type="button"
              onClick={() => setBuscaAberta(false)}
              className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* PASSO 2: FORMULÁRIO */}
      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar emenda' : 'Nova emenda'}</h2>
              {form.viaBuscaAssistida && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-admin-accent/10 text-admin-accent font-semibold">
                  Pré-preenchido pela busca — revise antes de salvar
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="codigoEmenda">Código da emenda</label>
                <input
                  id="codigoEmenda"
                  required
                  value={form.codigoEmenda}
                  onChange={e => setForm({ ...form, codigoEmenda: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  value={form.ano ?? ''}
                  onChange={e => setForm({ ...form, ano: e.target.value ? Number(e.target.value) : null })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="fonteOrigem">Fonte</label>
                <select
                  id="fonteOrigem"
                  value={form.fonteOrigem ?? ''}
                  onChange={e => setForm({ ...form, fonteOrigem: (e.target.value || null) as FonteEmenda | null })}
                  className={classeInput}
                >
                  <option value="">—</option>
                  {Object.values(FonteEmenda).map(f => (
                    <option key={f} value={f}>{FonteEmendaDescricao[f]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="objeto">Objeto</label>
              <textarea
                id="objeto"
                value={form.objeto ?? ''}
                onChange={e => setForm({ ...form, objeto: e.target.value })}
                className={classeInput}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="parlamentarNome">Parlamentar</label>
                <input
                  id="parlamentarNome"
                  value={form.parlamentarNome ?? ''}
                  onChange={e => setForm({ ...form, parlamentarNome: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="tipo">Tipo</label>
                <input
                  id="tipo"
                  placeholder="Ex.: EMENDA PARLAMENTAR"
                  value={form.tipo ?? ''}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="modalidade">Modalidade</label>
                <input
                  id="modalidade"
                  placeholder="Ex.: 41-Transferências a Municípios - Fundo a Fundo"
                  value={form.modalidade ?? ''}
                  onChange={e => setForm({ ...form, modalidade: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="localizadorGasto">Localizador de gasto (município)</label>
                <input
                  id="localizadorGasto"
                  placeholder="Ex.: LAGO DOS RODRIGUES"
                  value={form.localizadorGasto ?? ''}
                  onChange={e => setForm({ ...form, localizadorGasto: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="nomeUnidadeGestora">Unidade gestora</label>
                <input
                  id="nomeUnidadeGestora"
                  value={form.nomeUnidadeGestora ?? ''}
                  onChange={e => setForm({ ...form, nomeUnidadeGestora: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="codigoFavorecido">CNPJ do favorecido</label>
                <input
                  id="codigoFavorecido"
                  placeholder="Pode ser o CNPJ do fundo, não da prefeitura"
                  value={form.codigoFavorecido ?? ''}
                  onChange={e => setForm({ ...form, codigoFavorecido: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="valorSolicitado">Solicitado</label>
                <input
                  id="valorSolicitado"
                  type="number"
                  step="0.01"
                  value={form.valorSolicitado ?? ''}
                  onChange={e => setForm({ ...form, valorSolicitado: e.target.value ? Number(e.target.value) : null })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorRepasse">Repasse</label>
                <input
                  id="valorRepasse"
                  type="number"
                  step="0.01"
                  value={form.valorRepasse ?? ''}
                  onChange={e => setForm({ ...form, valorRepasse: e.target.value ? Number(e.target.value) : null })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorPago">Pago</label>
                <input
                  id="valorPago"
                  type="number"
                  step="0.01"
                  value={form.valorPago ?? ''}
                  onChange={e => setForm({ ...form, valorPago: e.target.value ? Number(e.target.value) : null })}
                  className={classeInput}
                />
              </div>
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma emenda estadual encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Código</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Objeto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Modalidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Origem</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Repasse / Pago</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(e => (
                  <tr key={e.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{e.codigoEmenda}</td>
                    <td className="p-3.5 text-admin-text">{e.objeto ?? '—'}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-muted">
                        {e.modalidade ?? '—'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-accent/10 text-admin-accent">
                        {OrigemCadastroEmendaDescricao[e.origemCadastro as OrigemCadastroEmenda]}
                      </span>
                    </td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(e.valorRepasse)} / {formatarMoeda(e.valorPago)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => abrirEdicao(e)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => setIdParaExcluir(e.id)}
                            aria-label="Excluir"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                          >
                            <MdDeleteOutline size={16} />
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
        aberto={idParaExcluir !== null}
        titulo="Excluir emenda estadual?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
      />
    </div>
  )
}
