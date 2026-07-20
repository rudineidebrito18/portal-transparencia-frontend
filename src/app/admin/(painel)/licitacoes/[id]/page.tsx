'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { LicitacaoDetalhe } from '@/modules/licitacoes/types'
import { ContratoLicitacao } from '@/modules/contratos/types'
import { licitacaoService } from '@/modules/admin/licitacoes/licitacao.service'
import { contratoService } from '@/modules/admin/licitacoes/contrato.service'
import {
  ContratoLicitacaoRequest,
  Documento,
  DocumentoUploadRequest,
  StatusLicitacao,
  StatusLicitacaoDescricao,
  StatusLicitacaoStyle,
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao,
  normalizarStatus
} from '@/modules/admin/licitacoes/types'

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

function formatarMoeda(valor?: number) {
  if (valor === undefined || valor === null) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type Aba = 'documentos' | 'contratos'
type ContratoFormState = { id: number | null } & ContratoLicitacaoRequest

const CONTRATO_VAZIO: ContratoLicitacaoRequest = {
  numeroContrato: 0,
  exercicio: new Date().getFullYear(),
  fornecedor: '',
  dataAssinatura: '',
  dataPublicacao: '',
  dataInicio: '',
  dataTermino: '',
  unidade: '',
  gestorContrato: '',
  meioPublicacao: '',
  valorContrato: 0,
  status: StatusLicitacao.EM_ANDAMENTO,
  objeto: ''
}

export default function LicitacaoDetalheAdminPage() {
  const params = useParams<{ id: string }>()
  const licitacaoId = Number(params.id)

  const [licitacao, setLicitacao] = useState<LicitacaoDetalhe | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    licitacaoService
      .buscarPorId(licitacaoId)
      .then(setLicitacao)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [licitacaoId])

  const [aba, setAba] = useState<Aba>('documentos')

  if (loading) return <Skeleton className="h-64" />
  if (erro) return <ErrorState message={erro} />
  if (!licitacao) return null

  const statusKey = normalizarStatus(licitacao.status)

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/licitacoes" className="text-sm text-primary hover:underline">
          &larr; Voltar para Licitações
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-lg font-bold text-primary">
              Licitação nº {licitacao.numeroInstrumento}/{licitacao.ano}
            </h1>
            <p className="text-sm text-text-secondary/70">{licitacao.objeto}</p>
          </div>
          <Badge className={statusKey ? StatusLicitacaoStyle[statusKey] : 'bg-gray-100 text-gray-600'}>
            {statusKey ? StatusLicitacaoDescricao[statusKey] : licitacao.status}
          </Badge>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" hoverable={false}>
        <div>
          <p className="text-text-secondary/60 text-xs">Nº do processo</p>
          <p className="font-semibold">{licitacao.numeroProcesso}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Tipo de procedimento</p>
          <p className="font-semibold">
            {TipoProcedimentoDescricao[licitacao.tipoProcedimentoLicitacao as TipoProcedimentoLicitacao] ?? licitacao.tipoProcedimentoLicitacao}
          </p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Unidade</p>
          <p className="font-semibold">{licitacao.unidade ?? '—'}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Autoridade</p>
          <p className="font-semibold">{licitacao.nomeAutoridade ?? '—'}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Publicação</p>
          <p className="font-semibold">{formatarData(licitacao.dataPublicacao)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Sessão</p>
          <p className="font-semibold">{formatarData(licitacao.dataSessao)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Abertura</p>
          <p className="font-semibold">{formatarData(licitacao.dataAbertura)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Homologação</p>
          <p className="font-semibold">{formatarData(licitacao.dataHomologacao)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Valor estimado</p>
          <p className="font-semibold">{formatarMoeda(licitacao.valorEstimado)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Valor adjudicado</p>
          <p className="font-semibold">{formatarMoeda(licitacao.valorAdjudicado)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Valor da dotação</p>
          <p className="font-semibold">{formatarMoeda(licitacao.valorDotacao)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">COVID-19</p>
          <p className="font-semibold">{licitacao.covid ? 'Sim' : 'Não'}</p>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-border/30">
        {([
          ['documentos', 'Documentos'],
          ['contratos', 'Contratos']
        ] as [Aba, string][]).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              aba === valor ? 'border-primary text-primary' : 'border-transparent text-text-secondary/60 hover:text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'documentos' && <AbaDocumentos licitacaoId={licitacaoId} />}
      {aba === 'contratos' && <AbaContratos licitacaoId={licitacaoId} />}
    </div>
  )
}

function AbaDocumentos({ licitacaoId }: { licitacaoId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    licitacaoService
      .listarDocumentos(licitacaoId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [licitacaoId])

  const [dados, setDados] = useState<DocumentoUploadRequest>({ assunto: '', tipoDocumento: '', dataEnvio: '' })
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function excluir(id: number) {
    if (!confirm('Excluir este documento? Essa ação não pode ser desfeita.')) return
    try {
      await licitacaoService.excluirDocumento(licitacaoId, id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    setEnviando(true)
    setErroForm(null)

    try {
      await licitacaoService.criarDocumento(licitacaoId, dados, arquivo)
      setDados({ assunto: '', tipoDocumento: '', dataEnvio: '' })
      setArquivo(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar documento')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'licitacoes') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo documento</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Assunto</label>
                <input
                  required
                  value={dados.assunto}
                  onChange={e => setDados({ ...dados, assunto: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de documento</label>
                <input
                  required
                  value={dados.tipoDocumento}
                  onChange={e => setDados({ ...dados, tipoDocumento: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de envio</label>
                <input
                  type="date"
                  required
                  value={dados.dataEnvio}
                  onChange={e => setDados({ ...dados, dataEnvio: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arquivo (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar documento'}
            </button>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum documento cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Assunto</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Envio</th>
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(d => (
                <tr key={d.id} className="border-t border-border/20">
                  <td className="p-3">{d.assunto}</td>
                  <td className="p-3">{d.tipoDocumento}</td>
                  <td className="p-3">{formatarData(d.dataEnvio)}</td>
                  <td className="p-3">
                    <a href={d.caminhoPdf} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Abrir
                    </a>
                  </td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'licitacoes') && (
                      <button onClick={() => excluir(d.id)} className="text-error hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function AbaContratos({ licitacaoId }: { licitacaoId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<ContratoLicitacao[]>([])
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    contratoService
      .listarPorLicitacao(licitacaoId, { page: pagina, size: 10 })
      .then(resposta => {
        setLista(resposta.content)
        setTotalPaginas(resposta.totalPages)
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [licitacaoId, pagina])

  const [form, setForm] = useState<ContratoFormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm({ id: null, ...CONTRATO_VAZIO })
  }

  function abrirEdicao(c: ContratoLicitacao) {
    setErroForm(null)
    setForm({
      id: c.id,
      numeroContrato: c.numeroContrato,
      exercicio: c.exercicio,
      fornecedor: c.fornecedor,
      dataAssinatura: c.dataAssinatura,
      dataPublicacao: c.dataPublicacao,
      dataInicio: c.dataInicio,
      dataTermino: c.dataTermino,
      unidade: c.unidade,
      gestorContrato: c.gestorContrato,
      meioPublicacao: c.meioPublicacao,
      valorContrato: c.valorContrato,
      status: normalizarStatus(c.status) ?? StatusLicitacao.EM_ANDAMENTO,
      objeto: c.objeto
    })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este contrato? Essa ação também remove documentos e aditivos vinculados, e não pode ser desfeita.')) return
    try {
      await contratoService.excluir(id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
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
        await contratoService.atualizar(id, dados)
      } else {
        await contratoService.criar(licitacaoId, dados)
      }
      setForm(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      {podeCriar(usuario, 'licitacoes') && !form && (
        <button
          onClick={abrirCriacao}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          + Novo contrato
        </button>
      )}

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar contrato' : 'Novo contrato'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nº do contrato</label>
                <input
                  type="number"
                  required
                  value={form.numeroContrato}
                  onChange={e => setForm({ ...form, numeroContrato: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Exercício</label>
                <input
                  type="number"
                  required
                  value={form.exercicio}
                  onChange={e => setForm({ ...form, exercicio: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <input
                  required
                  value={form.fornecedor}
                  onChange={e => setForm({ ...form, fornecedor: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de assinatura</label>
                <input
                  type="date"
                  required
                  value={form.dataAssinatura}
                  onChange={e => setForm({ ...form, dataAssinatura: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
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
                <label className="block text-sm font-medium mb-1">Meio de publicação</label>
                <input
                  required
                  value={form.meioPublicacao}
                  onChange={e => setForm({ ...form, meioPublicacao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de início</label>
                <input
                  type="date"
                  required
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de término</label>
                <input
                  type="date"
                  required
                  value={form.dataTermino}
                  onChange={e => setForm({ ...form, dataTermino: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor do contrato</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.valorContrato}
                  onChange={e => setForm({ ...form, valorContrato: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Unidade</label>
                <input
                  required
                  value={form.unidade}
                  onChange={e => setForm({ ...form, unidade: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gestor do contrato</label>
                <input
                  required
                  value={form.gestorContrato}
                  onChange={e => setForm({ ...form, gestorContrato: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
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
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum contrato cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nº contrato</th>
                <th className="p-3">Fornecedor</th>
                <th className="p-3">Assinatura</th>
                <th className="p-3">Vigência</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(c => (
                <tr key={c.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{c.numeroContrato}/{c.exercicio}</td>
                  <td className="p-3">{c.fornecedor}</td>
                  <td className="p-3">{formatarData(c.dataAssinatura)}</td>
                  <td className="p-3">{formatarData(c.dataInicio)} — {formatarData(c.dataTermino)}</td>
                  <td className="p-3">{formatarMoeda(c.valorContrato)}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/admin/licitacoes/contratos/${c.id}?licitacaoId=${licitacaoId}`} className="text-primary hover:underline">
                      Ver
                    </Link>
                    {podeEditar(usuario, 'licitacoes') && (
                      <button onClick={() => abrirEdicao(c)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'licitacoes') && (
                      <button onClick={() => excluir(c.id)} className="text-error hover:underline">
                        Excluir
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
