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
  FormaRepasseEmenda,
  FormaRepasseEmendaDescricao,
  OrigemCadastroEmenda,
  OrigemCadastroEmendaDescricao,
  TipoEmenda,
  TipoEmendaDescricao
} from '@/modules/emendas-federais/enums'
import { emendaFederalService } from '@/modules/admin/emendas-federais/emendaFederal.service'
import { EmendaFederal, EmendaFederalDescoberta, EmendaFederalRequest, FiltroEmendaFederal } from '@/modules/admin/emendas-federais/types'

interface FormState extends EmendaFederalRequest {
  id: number | null
}

const FORM_VAZIO: FormState = {
  id: null,
  codigoEmenda: '',
  ano: null,
  tipoEmenda: null,
  autorNome: '',
  autorCargo: '',
  autorPartido: '',
  autorCodigo: '',
  formaRepasse: null,
  valorIndicado: null,
  valorEmpenhado: null,
  valorLiquidado: null,
  valorPago: null,
  situacao: '',
  localidadeDoGasto: '',
  objeto: '',
  programa: '',
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

export default function EmendasFederaisAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroEmendaFederal & { page?: number; size?: number; sort?: string }) => emendaFederalService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    EmendaFederal,
    FiltroEmendaFederal
  >({ fetchFunction, initialSort: 'atualizadoEm,desc' })

  // Fluxo de cadastro em 2 passos (PLANO_MODULO_EMENDAS.md §5.3): primeiro busca por código nas
  // fontes oficiais; só abre o formulário depois — pré-preenchido se achou, em branco se não.
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [codigoBusca, setCodigoBusca] = useState('')
  const [buscando, setBuscando] = useState(false)
  const [buscaMensagem, setBuscaMensagem] = useState<string | null>(null)

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  // Busca por CNPJ (complementar à busca por código): traz todas as emendas do município de
  // uma vez, sem exigir que o admin já conheça um código específico.
  const [descobertaAberta, setDescobertaAberta] = useState(false)
  const [descobrindo, setDescobrindo] = useState(false)
  const [descobertaErro, setDescobertaErro] = useState<string | null>(null)
  const [descobertas, setDescobertas] = useState<EmendaFederalDescoberta[] | null>(null)
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [importando, setImportando] = useState(false)

  async function abrirDescoberta() {
    setDescobertaAberta(true)
    setDescobertaErro(null)
    setDescobertas(null)
    setSelecionadas(new Set())
    setDescobrindo(true)
    try {
      const resultado = await emendaFederalService.descobrirDoMunicipio()
      setDescobertas(resultado)
      // Pré-marca só as que ainda não estão cadastradas — evita reimportar tudo por acidente.
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
      await emendaFederalService.importarDoMunicipio(Array.from(selecionadas))
      setDescobertaAberta(false)
      recarregar()
    } catch (e: unknown) {
      setDescobertaErro(e instanceof Error ? e.message : 'Erro ao importar')
    } finally {
      setImportando(false)
    }
  }

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
      const encontrada = await emendaFederalService.buscarAssistido(codigoBusca.trim())
      if (encontrada) {
        setForm({ id: null, ...encontrada, viaBuscaAssistida: true })
        setBuscaAberta(false)
      } else {
        setBuscaMensagem('Não encontrada nas fontes oficiais (Transferegov/CGU). Você pode cadastrar manualmente.')
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

  function abrirEdicao(e: EmendaFederal) {
    setErroForm(null)
    setForm({ ...e, id: e.id, viaBuscaAssistida: false })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await emendaFederalService.excluir(idParaExcluir)
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
    const request: EmendaFederalRequest = dados

    try {
      if (id) {
        await emendaFederalService.atualizar(id, request)
      } else {
        await emendaFederalService.criar(request)
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
        <h1 className="text-lg font-bold text-admin-text">Emendas Federais</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <div className="flex gap-2">
            <button
              onClick={abrirDescoberta}
              className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text hover:bg-admin-surface-3 transition-all flex items-center gap-2"
            >
              <MdTravelExplore size={16} />
              Buscar emendas do município (CNPJ)
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
          <label className={classeLabel} htmlFor="filtro-tipo">Tipo</label>
          <select
            id="filtro-tipo"
            value={filtros.tipo ?? ''}
            onChange={e => setFiltros({ ...filtros, tipo: e.target.value || undefined, ano: undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="">Todos</option>
            {Object.values(TipoEmenda).map(t => (
              <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={classeLabel} htmlFor="ano">Ano</label>
          <select
            id="ano"
            value={filtros.ano ?? ''}
            onChange={e => setFiltros({ ...filtros, ano: e.target.value ? Number(e.target.value) : undefined, tipo: undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="">Todos</option>
            {ANOS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-admin-text-faint self-end pb-2">
          O backend só filtra por tipo ou por ano, nunca os dois ao mesmo tempo.
        </p>
      </div>

      {/* BUSCA POR CNPJ: traz tudo de uma vez, admin escolhe o que importar */}
      {descobertaAberta && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm text-admin-text">Emendas do município no Transferegov</h2>
            <button
              type="button"
              onClick={() => setDescobertaAberta(false)}
              className="text-xs text-admin-text-muted hover:text-admin-text"
            >
              Fechar
            </button>
          </div>

          {descobrindo && (
            <p className="text-sm text-admin-text-muted">Buscando pelo CNPJ do município...</p>
          )}

          {descobertaErro && <AdminErrorState message={descobertaErro} />}

          {!descobrindo && descobertas && descobertas.length === 0 && !descobertaErro && (
            <p className="text-sm text-admin-text-muted">Nenhuma emenda encontrada pro município no Transferegov.</p>
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
                        <span className="text-admin-text-muted">{d.dados.autorNome ?? '—'}</span>
                        {d.jaCadastrada && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-admin-surface-3 text-admin-text-muted">
                            Já cadastrada — importar atualiza os valores
                          </span>
                        )}
                      </div>
                      <p className="text-admin-text-muted text-xs mt-0.5">{d.dados.objeto ?? '—'}</p>
                      <p className="text-admin-text-muted text-xs tabular-nums">{formatarMoeda(d.dados.valorIndicado)}</p>
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
          <h2 className="font-semibold text-sm text-admin-text">Nova emenda federal</h2>
          <p className="text-xs text-admin-text-faint">
            Digite o código oficial da emenda (ex.: 202638930003) pra buscar os dados nas fontes
            oficiais (Transferegov/CGU) e pré-preencher o formulário. Se não achar, você cadastra manualmente.
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
                <label className={classeLabel} htmlFor="autorNome">Autor</label>
                <input
                  id="autorNome"
                  value={form.autorNome ?? ''}
                  onChange={e => setForm({ ...form, autorNome: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="autorCargo">Cargo do autor</label>
                <input
                  id="autorCargo"
                  placeholder="Deputado Federal, Senador..."
                  value={form.autorCargo ?? ''}
                  onChange={e => setForm({ ...form, autorCargo: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="autorPartido">Partido</label>
                <input
                  id="autorPartido"
                  value={form.autorPartido ?? ''}
                  onChange={e => setForm({ ...form, autorPartido: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="tipoEmenda">Tipo</label>
                <select
                  id="tipoEmenda"
                  value={form.tipoEmenda ?? ''}
                  onChange={e => setForm({ ...form, tipoEmenda: (e.target.value || null) as TipoEmenda | null })}
                  className={classeInput}
                >
                  <option value="">—</option>
                  {Object.values(TipoEmenda).map(t => (
                    <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="formaRepasse">Forma de repasse</label>
                <select
                  id="formaRepasse"
                  value={form.formaRepasse ?? ''}
                  onChange={e => setForm({ ...form, formaRepasse: (e.target.value || null) as FormaRepasseEmenda | null })}
                  className={classeInput}
                >
                  <option value="">—</option>
                  {Object.values(FormaRepasseEmenda).map(f => (
                    <option key={f} value={f}>{FormaRepasseEmendaDescricao[f]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="situacao">Situação</label>
                <input
                  id="situacao"
                  value={form.situacao ?? ''}
                  onChange={e => setForm({ ...form, situacao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="localidadeDoGasto">Localidade do gasto</label>
                <input
                  id="localidadeDoGasto"
                  placeholder="Pode ser MÚLTIPLO"
                  value={form.localidadeDoGasto ?? ''}
                  onChange={e => setForm({ ...form, localidadeDoGasto: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={classeLabel} htmlFor="valorIndicado">Valor indicado</label>
                <input
                  id="valorIndicado"
                  type="number"
                  step="0.01"
                  value={form.valorIndicado ?? ''}
                  onChange={e => setForm({ ...form, valorIndicado: e.target.value ? Number(e.target.value) : null })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorEmpenhado">Empenhado</label>
                <input
                  id="valorEmpenhado"
                  type="number"
                  step="0.01"
                  value={form.valorEmpenhado ?? ''}
                  onChange={e => setForm({ ...form, valorEmpenhado: e.target.value ? Number(e.target.value) : null })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorLiquidado">Liquidado</label>
                <input
                  id="valorLiquidado"
                  type="number"
                  step="0.01"
                  value={form.valorLiquidado ?? ''}
                  onChange={e => setForm({ ...form, valorLiquidado: e.target.value ? Number(e.target.value) : null })}
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

            <div>
              <label className={classeLabel} htmlFor="linkDetalhes">Link para detalhes</label>
              <input
                id="linkDetalhes"
                type="url"
                value={form.linkDetalhes ?? ''}
                onChange={e => setForm({ ...form, linkDetalhes: e.target.value })}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma emenda federal encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Código</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Objeto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Origem</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Indicado / Pago</th>
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
                        {e.tipoEmenda ? TipoEmendaDescricao[e.tipoEmenda] : '—'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-accent/10 text-admin-accent">
                        {OrigemCadastroEmendaDescricao[e.origemCadastro as OrigemCadastroEmenda]}
                      </span>
                    </td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(e.valorIndicado)} / {formatarMoeda(e.valorPago)}</td>
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
        titulo="Excluir emenda federal?"
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
