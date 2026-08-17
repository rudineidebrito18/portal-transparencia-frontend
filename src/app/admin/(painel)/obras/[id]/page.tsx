'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MdArrowBack, MdDeleteOutline, MdEdit, MdVisibility } from 'react-icons/md'

import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Fornecedor } from '@/modules/admin/geral/types'
import { obraService } from '@/modules/admin/obras/obra.service'
import { medicaoService } from '@/modules/admin/obras/medicao.service'
import { anexoObraService } from '@/modules/admin/obras/anexoObra.service'
import { artService } from '@/modules/admin/obras/art.service'
import {
  ObraPublica,
  Medicao,
  MedicaoRequest,
  AnexoObra,
  Art,
  StatusObra,
  TipoObraDescricao,
  StatusObraDescricao
} from '@/modules/admin/obras/types'
import { hrefDocumento } from '@/utils/documento'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'
const classeFile =
  'w-full text-sm text-admin-text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-admin-accent file:text-white file:text-sm file:font-semibold file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark'

// Cores próprias do painel admin (não reaproveita StatusObraStyle/StatusObraDot do site
// público — aqueles são pílulas claras tipo `bg-yellow-100`, ficariam sem vida no shell
// escuro do admin, mesmo problema já corrigido em outras páginas desta rodada).
const STATUS_OBRA_COR: Record<StatusObra, string> = {
  [StatusObra.EM_ANDAMENTO]: 'bg-admin-info-light text-admin-info',
  [StatusObra.CONCLUIDA]: 'bg-admin-success-light text-admin-success',
  [StatusObra.CANCELADA]: 'bg-admin-error-light text-admin-error'
}
const STATUS_OBRA_DOT: Record<StatusObra, string> = {
  [StatusObra.EM_ANDAMENTO]: 'bg-admin-info',
  [StatusObra.CONCLUIDA]: 'bg-admin-success',
  [StatusObra.CANCELADA]: 'bg-admin-error'
}

function PillStatus({ cor, dot, label }: { cor: string; dot: string; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cor}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  )
}

function formatarMoeda(valor?: number | null) {
  return (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatarData(data?: string) {
  if (!data) return '—'
  const isoData = data.includes('T') ? data : `${data}T00:00:00`
  return new Date(isoData).toLocaleDateString('pt-BR')
}

function formatarDataHora(data?: string) {
  if (!data) return '—'
  const isoData = data.includes('T') ? data : `${data}T00:00:00`
  return new Date(isoData).toLocaleString('pt-BR')
}

type Aba = 'medicoes' | 'anexos' | 'arts'

const MEDICAO_VAZIA: MedicaoRequest = {
  numero: 1,
  dataInicio: '',
  dataFim: '',
  fornecedorId: 0,
  situacao: '',
  responsavelExecucao: '',
  responsavelFiscalizacao: '',
  responsavelPasta: '',
  percentual: 0,
  valor: 0
}

export default function ObraDetalheAdminPage() {
  const params = useParams<{ id: string }>()
  const obraId = Number(params.id)

  const [obra, setObra] = useState<ObraPublica | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregarObra() {
    setLoading(true)
    setErro(null)
    obraService
      .buscarPorId(obraId)
      .then(setObra)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregarObra, [obraId])

  const [aba, setAba] = useState<Aba>('medicoes')

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  useEffect(() => {
    fornecedoresService.listar({ size: 200, sort: 'nome,asc' }).then(p => setFornecedores(p.content)).catch(() => {})
  }, [])

  if (loading) {
    return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  }
  if (erro) return <AdminErrorState message={erro} />
  if (!obra) return null

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/obras" className="inline-flex items-center gap-1 text-sm text-admin-accent hover:underline">
          <MdArrowBack size={14} /> Voltar para Obras
        </Link>
        <div className="flex items-center justify-between mt-1 flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-admin-text">Obra nº {obra.numero} — {obra.local}</h1>
            <p className="text-sm text-admin-text-muted">{obra.objeto}</p>
          </div>
          <div className="flex gap-1.5">
            <PillStatus cor={STATUS_OBRA_COR[obra.status]} dot={STATUS_OBRA_DOT[obra.status]} label={StatusObraDescricao[obra.status]} />
            {obra.paralisada && <PillStatus cor="bg-admin-error-light text-admin-error" dot="bg-admin-error" label="Paralisada" />}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-5 grid grid-cols-2 md:grid-cols-4 gap-5 text-sm">
        <div>
          <p className="text-admin-text-faint text-xs">Tipo</p>
          <p className="font-semibold text-admin-text">{TipoObraDescricao[obra.tipo]}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Unidade responsável</p>
          <p className="font-semibold text-admin-text">{obra.nomeUnidade}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Fornecedor responsável</p>
          <p className="font-semibold text-admin-text">{obra.nomeFornecedor}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Fonte de recursos</p>
          <p className="font-semibold text-admin-text">{obra.fonte}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Início</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(obra.dataInicio)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Previsão de término</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(obra.dataPrevistaTermino)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Término real</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(obra.dataTermino)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Última atualização</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarDataHora(obra.ultimaAtualizacao)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Valor total</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(obra.valorTotal)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Total medido</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(obra.totalMedicao)} ({obra.percentualObra?.toFixed(1) ?? 0}%)</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Total pago</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(obra.totalMedicaoPaga)} ({obra.percentualFinanceiro?.toFixed(1) ?? 0}%)</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Saldo da obra / conta</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(obra.saldoObra)} / {formatarMoeda(obra.saldoConta)}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-admin-border">
        {([
          ['medicoes', 'Medições'],
          ['anexos', 'Anexos'],
          ['arts', 'ART']
        ] as [Aba, string][]).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              aba === valor ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-faint hover:text-admin-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'medicoes' && <AbaMedicoes obraId={obraId} fornecedores={fornecedores} aoAtualizar={carregarObra} />}
      {aba === 'anexos' && <AbaAnexos obraId={obraId} />}
      {aba === 'arts' && <AbaArts obraId={obraId} />}
    </div>
  )
}

function AbaMedicoes({
  obraId,
  fornecedores,
  aoAtualizar
}: {
  obraId: number
  fornecedores: Fornecedor[]
  aoAtualizar: () => void
}) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Medicao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    medicaoService
      .listarPorObra(obraId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [obraId])

  const [form, setForm] = useState<{ id: number | null } & MedicaoRequest | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm({ id: null, ...MEDICAO_VAZIA })
  }

  function abrirEdicao(m: Medicao) {
    setErroForm(null)
    const fornecedor = fornecedores.find(f => f.nome === m.fornecedorNome)
    setForm({
      id: m.id,
      numero: m.numero,
      dataInicio: m.dataInicio,
      dataFim: m.dataFim,
      fornecedorId: fornecedor?.id ?? 0,
      situacao: m.situacao,
      responsavelExecucao: m.responsavelExecucao,
      responsavelFiscalizacao: m.responsavelFiscalizacao,
      responsavelPasta: m.responsavelPasta,
      percentual: m.percentual,
      valor: m.valor
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await medicaoService.excluir(obraId, idParaExcluir)
      setIdParaExcluir(null)
      carregar()
      aoAtualizar()
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

    try {
      if (id) {
        await medicaoService.atualizar(obraId, id, dados)
      } else {
        await medicaoService.criar(obraId, dados)
      }
      setForm(null)
      carregar()
      aoAtualizar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'obras-repasses') && !form && (
        <button
          onClick={abrirCriacao}
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          + Nova medição
        </button>
      )}

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar medição' : 'Nova medição'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numero">Número</label>
                <input
                  id="numero"
                  type="number"
                  min={1}
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataInicio">Data de início</label>
                <input
                  id="dataInicio"
                  type="date"
                  required
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataFim">Data de fim</label>
                <input
                  id="dataFim"
                  type="date"
                  required
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="fornecedorId">Fornecedor</label>
                <select
                  id="fornecedorId"
                  required
                  value={form.fornecedorId || ''}
                  onChange={e => setForm({ ...form, fornecedorId: Number(e.target.value) })}
                  className={classeInput}
                >
                  <option value="" disabled>Selecione...</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="situacao">Situação</label>
                <input
                  id="situacao"
                  required
                  value={form.situacao}
                  onChange={e => setForm({ ...form, situacao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="responsavelExecucao">Responsável execução</label>
                <input
                  id="responsavelExecucao"
                  required
                  value={form.responsavelExecucao}
                  onChange={e => setForm({ ...form, responsavelExecucao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="responsavelFiscalizacao">Responsável fiscalização</label>
                <input
                  id="responsavelFiscalizacao"
                  required
                  value={form.responsavelFiscalizacao}
                  onChange={e => setForm({ ...form, responsavelFiscalizacao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="responsavelPasta">Responsável pasta</label>
                <input
                  id="responsavelPasta"
                  required
                  value={form.responsavelPasta}
                  onChange={e => setForm({ ...form, responsavelPasta: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="percentual">Percentual (%)</label>
                <input
                  id="percentual"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  required
                  value={form.percentual}
                  onChange={e => setForm({ ...form, percentual: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valor">Valor</label>
                <input
                  id="valor"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valor}
                  onChange={e => setForm({ ...form, valor: Number(e.target.value) })}
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
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhuma medição registrada." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Período</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Fornecedor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Situação</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">% / Valor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(m => (
                  <tr key={m.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text tabular-nums">{m.numero}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(m.dataInicio)} — {formatarData(m.dataFim)}</td>
                    <td className="p-3.5 text-admin-text">{m.fornecedorNome}</td>
                    <td className="p-3.5 text-admin-text-muted">{m.situacao}</td>
                    <td className="p-3.5 text-admin-text tabular-nums">{m.percentual}% / {formatarMoeda(m.valor)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => abrirEdicao(m)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => setIdParaExcluir(m.id)}
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

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir medição?"
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

function AbaAnexos({ obraId }: { obraId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<AnexoObra[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    anexoObraService
      .listarPorObra(obraId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [obraId])

  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await anexoObraService.excluir(obraId, idParaExcluir)
      setIdParaExcluir(null)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    setEnviando(true)
    setErroForm(null)

    try {
      await anexoObraService.criar(obraId, { descricao, data }, arquivo)
      setDescricao('')
      setData('')
      setArquivo(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar anexo')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'obras-repasses') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Novo anexo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="descricao">Descrição</label>
                <input
                  id="descricao"
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  required
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="arquivo">Arquivo</label>
              <input
                id="arquivo"
                type="file"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className={classeFile}
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar anexo'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum anexo cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Descrição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(a => (
                  <tr key={a.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text">{a.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(a.data)}</td>
                    <td className="p-3.5">
                      <Link
                        href={hrefDocumento(anexoObraService.urlArquivo(obraId, a.id), a.descricao, { admin: true })}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver
                      </Link>
                    </td>
                    <td className="p-3.5 text-right">
                      {podeExcluir(usuario, 'obras-repasses') && (
                        <button
                          onClick={() => setIdParaExcluir(a.id)}
                          aria-label="Excluir"
                          className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir anexo?"
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

function AbaArts({ obraId }: { obraId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Art[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    artService
      .listarPorObra(obraId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [obraId])

  const [dataExpedicao, setDataExpedicao] = useState('')
  const [numero, setNumero] = useState('')
  const [responsavel, setResponsavel] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [pdf, setPdf] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  // ART não é admin-only (foge do padrão do resto do módulo Obras) — usa grupo
  // 'padrao' pra criar/excluir em vez de 'obras-repasses', que forçaria admin.
  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await artService.excluir(obraId, idParaExcluir)
      setIdParaExcluir(null)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!pdf) return

    setEnviando(true)
    setErroForm(null)

    try {
      await artService.criar(obraId, { dataExpedicao, numero, responsavel, observacoes }, pdf)
      setDataExpedicao('')
      setNumero('')
      setResponsavel('')
      setObservacoes('')
      setPdf(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar ART')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'padrao') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Nova ART</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numero">Número</label>
                <input
                  id="numero"
                  required
                  value={numero}
                  onChange={e => setNumero(e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataExpedicao">Data de expedição</label>
                <input
                  id="dataExpedicao"
                  type="date"
                  required
                  value={dataExpedicao}
                  onChange={e => setDataExpedicao(e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="responsavel">Responsável</label>
                <input
                  id="responsavel"
                  required
                  value={responsavel}
                  onChange={e => setResponsavel(e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className={classeInput}
                rows={2}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="pdf">PDF</label>
              <input
                id="pdf"
                type="file"
                accept="application/pdf"
                required
                onChange={e => setPdf(e.target.files?.[0] ?? null)}
                className={classeFile}
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar ART'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhuma ART cadastrada." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Número</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data de expedição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Responsável</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Documento</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(a => (
                  <tr key={a.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{a.numero}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(a.dataExpedicao)}</td>
                    <td className="p-3.5 text-admin-text">{a.responsavel}</td>
                    <td className="p-3.5">
                      <Link
                        href={hrefDocumento(artService.urlArquivo(obraId, a.id), `Nº ${a.numero}`, { admin: true })}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver
                      </Link>
                    </td>
                    <td className="p-3.5 text-right">
                      {podeExcluir(usuario, 'padrao') && (
                        <button
                          onClick={() => setIdParaExcluir(a.id)}
                          aria-label="Excluir"
                          className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                        >
                          <MdDeleteOutline size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir ART?"
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
