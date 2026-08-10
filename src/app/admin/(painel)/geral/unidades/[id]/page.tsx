'use client'

import Image from 'next/image'
import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MdApartment, MdEdit, MdDeleteOutline, MdVisibility } from 'react-icons/md'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador, podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import {
  decretoUnidadeService,
  documentoUnidadeService,
  gestorUnidadeService,
  ordenadorUnidadeService,
  setorUnidadeService
} from '@/modules/admin/geral/unidadeSubrecursos.service'
import {
  Decreto,
  DocumentoUnidade,
  GestorUnidade,
  GestorUnidadeRequest,
  PessoaCargoUnidade,
  SetorUnidade,
  TipoDocumentoUnidade,
  TipoDocumentoUnidadeDescricao,
  Unidade
} from '@/modules/admin/geral/types'
import { hrefDocumento } from '@/utils/documento'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarData(data?: string | null) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

type Aba = 'decretos' | 'documentos' | 'gestores' | 'ordenadores' | 'setores'

export default function UnidadeDetalheAdminPage() {
  const params = useParams<{ id: string }>()
  const unidadeId = Number(params.id)

  const [unidade, setUnidade] = useState<Unidade | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setErro(null)
    unidadesService
      .buscarPorId(unidadeId)
      .then(setUnidade)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }, [unidadeId])

  const [aba, setAba] = useState<Aba>('decretos')

  if (loading) return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  if (erro) return <AdminErrorState message={erro} />
  if (!unidade) return null

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/geral/unidades" className="text-sm text-admin-accent hover:underline">
          &larr; Voltar para Unidades
        </Link>
        <h1 className="text-lg font-bold text-admin-text mt-1">{unidade.nome}</h1>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6 flex flex-col md:flex-row gap-4">
        {unidade.gestorAtual?.fotoUrl ? (
          <Image
            src={unidade.gestorAtual.fotoUrl}
            alt={unidade.gestorAtual.nome}
            width={96}
            height={96}
            className="w-24 h-24 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-24 h-24 rounded-lg bg-admin-accent/10 text-admin-accent flex items-center justify-center shrink-0">
            <MdApartment size={36} />
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1">
          <div>
            <p className="text-admin-text-faint text-xs">CNPJ</p>
            <p className="font-semibold text-admin-text">{unidade.cnpj || '—'}</p>
          </div>
          <div>
            <p className="text-admin-text-faint text-xs">Telefone</p>
            <p className="font-semibold text-admin-text">{unidade.telefone || '—'}</p>
          </div>
          <div>
            <p className="text-admin-text-faint text-xs">E-mail</p>
            <p className="font-semibold text-admin-text">{unidade.email || '—'}</p>
          </div>
          <div>
            <p className="text-admin-text-faint text-xs">Horário de atendimento</p>
            <p className="font-semibold text-admin-text">{unidade.horarioAtendimento || '—'}</p>
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-admin-text-faint text-xs">Endereço</p>
            <p className="font-semibold text-admin-text">{unidade.endereco || '—'}</p>
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-admin-text-faint text-xs">Atribuições</p>
            <p className="font-semibold text-admin-text whitespace-pre-line">{unidade.atribuicoes || '—'}</p>
          </div>
          <div>
            <p className="text-admin-text-faint text-xs">Gestor atual</p>
            <p className="font-semibold text-admin-text">
              {unidade.gestorAtual?.nome || '—'} {unidade.gestorAtual?.cargo && `— ${unidade.gestorAtual.cargo}`}
              {unidade.gestorAtual?.verificado && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-success-light text-admin-success ml-2">
                  <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-success" />
                  Verificado
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-admin-text-faint text-xs">Vigência do órgão</p>
            <p className="font-semibold text-admin-text">{formatarData(unidade.dataInicio)} — {formatarData(unidade.dataFim)}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-admin-border flex-wrap">
        {([
          ['decretos', 'Decretos'],
          ['documentos', 'Documentos'],
          ['gestores', 'Gestores'],
          ['ordenadores', 'Ordenadores'],
          ['setores', 'Setores']
        ] as [Aba, string][]).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              aba === valor ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-faint hover:text-admin-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'decretos' && <AbaDecretos unidadeId={unidadeId} />}
      {aba === 'documentos' && <AbaDocumentos unidadeId={unidadeId} />}
      {aba === 'gestores' && <AbaGestores unidadeId={unidadeId} />}
      {aba === 'ordenadores' && <AbaPessoaCargo unidadeId={unidadeId} />}
      {aba === 'setores' && <AbaSetores unidadeId={unidadeId} />}
    </div>
  )
}

function AbaDecretos({ unidadeId }: { unidadeId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Decreto[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    decretoUnidadeService
      .listarPorUnidade(unidadeId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [unidadeId])

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
      await decretoUnidadeService.excluir(idParaExcluir)
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
      await decretoUnidadeService.criar(unidadeId, { descricao, data }, arquivo)
      setDescricao('')
      setData('')
      setArquivo(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar decreto')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-5">
      {podeCriar(usuario, 'geral') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Novo decreto</h2>

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
              <label className={classeLabel} htmlFor="arquivo">Arquivo (PDF, DOC, DOCX, XLS ou XLSX)</label>
              <input
                id="arquivo"
                type="file"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-admin-text-muted bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-admin-accent file:text-white file:text-sm file:font-semibold file:cursor-pointer hover:file:bg-admin-accent-dark"
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar decreto'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum decreto cadastrado." />}

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
                {lista.map(d => (
                  <tr key={d.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text">{d.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(d.data)}</td>
                    <td className="p-3.5">
                      <Link
                        href={hrefDocumento(d.arquivoUrl, d.descricao, { admin: true })}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver
                      </Link>
                    </td>
                    <td className="p-3.5 text-right">
                      {podeExcluir(usuario, 'geral') && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setIdParaExcluir(d.id)}
                            aria-label="Excluir"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
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
        titulo="Excluir decreto?"
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

const TIPOS_DOCUMENTO: TipoDocumentoUnidade[] = [
  TipoDocumentoUnidade.TERMO,
  TipoDocumentoUnidade.EDTC,
  TipoDocumentoUnidade.DECLARACAO_ESIC
]

function AbaDocumentos({ unidadeId }: { unidadeId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<DocumentoUnidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    documentoUnidadeService
      .listarPorUnidade(unidadeId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [unidadeId])

  if (loading) return <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
  if (erro) return <AdminErrorState message={erro} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TIPOS_DOCUMENTO.map(tipo => (
        <SlotDocumento
          key={tipo}
          unidadeId={unidadeId}
          tipo={tipo}
          atual={lista.find(d => d.tipo === tipo) ?? null}
          podeEscrever={podeCriar(usuario, 'geral')}
          podeApagar={podeExcluir(usuario, 'geral')}
          aoAtualizar={carregar}
        />
      ))}
    </div>
  )
}

function SlotDocumento({
  unidadeId,
  tipo,
  atual,
  podeEscrever,
  podeApagar,
  aoAtualizar
}: {
  unidadeId: number
  tipo: TipoDocumentoUnidade
  atual: DocumentoUnidade | null
  podeEscrever: boolean
  podeApagar: boolean
  aoAtualizar: () => void
}) {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)
  const [excluindo, setExcluindo] = useState(false)

  async function enviar() {
    if (!arquivo) return
    setEnviando(true)
    setErro(null)
    try {
      await documentoUnidadeService.enviar(unidadeId, { tipo }, arquivo)
      setArquivo(null)
      aoAtualizar()
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao enviar')
    } finally {
      setEnviando(false)
    }
  }

  async function confirmarExclusao() {
    if (!atual) return
    setExcluindo(true)
    try {
      await documentoUnidadeService.excluir(atual.id)
      setConfirmandoExclusao(false)
      aoAtualizar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 space-y-3">
      <h3 className="font-semibold text-sm text-admin-text">{TipoDocumentoUnidadeDescricao[tipo]}</h3>

      {atual ? (
        <div className="text-sm space-y-1">
          <p className="text-admin-text-faint text-xs">Enviado em {formatarData(atual.dataEnvio)}</p>
          <Link
            href={hrefDocumento(atual.arquivoUrl, TipoDocumentoUnidadeDescricao[tipo], { admin: true })}
            className="inline-flex items-center gap-1 text-admin-accent hover:underline"
          >
            <MdVisibility size={15} /> Ver arquivo atual
          </Link>
        </div>
      ) : (
        <p className="text-sm text-admin-text-faint">Nenhum arquivo enviado.</p>
      )}

      {podeEscrever && (
        <div className="space-y-2">
          <input
            type="file"
            onChange={e => setArquivo(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-admin-text-muted file:mr-2 file:px-2 file:py-1 file:rounded-lg file:border-0 file:bg-admin-accent file:text-white file:text-xs file:font-semibold file:cursor-pointer hover:file:bg-admin-accent-dark"
          />
          {erro && <AdminErrorState message={erro} />}
          <div className="flex gap-2">
            <button
              onClick={enviar}
              disabled={!arquivo || enviando}
              className="px-3 py-1.5 rounded-lg admin-gradient-accent text-white text-xs font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : atual ? 'Substituir' : 'Enviar'}
            </button>
            {atual && podeApagar && (
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="px-3 py-1.5 rounded-lg border border-admin-error/30 text-admin-error text-xs font-semibold hover:bg-admin-error-light transition-all"
              >
                Excluir
              </button>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        aberto={confirmandoExclusao}
        titulo="Excluir documento?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setConfirmandoExclusao(false)}
      />
    </div>
  )
}

function AbaPessoaCargo({ unidadeId }: { unidadeId: number }) {
  const { usuario } = useAuth()
  const titulo = 'ordenador de despesa'

  const [lista, setLista] = useState<PessoaCargoUnidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    ordenadorUnidadeService
      .listarPorUnidade(unidadeId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [unidadeId])

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await ordenadorUnidadeService.excluir(idParaExcluir)
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

    if (dataInicio && dataFim && dataInicio > dataFim) {
      setErroForm('A data de início não pode ser depois da data de término.')
      return
    }

    setSalvando(true)
    setErroForm(null)

    try {
      await ordenadorUnidadeService.criar(unidadeId, { nome, cargo, dataInicio, dataFim })
      setNome('')
      setCargo('')
      setDataInicio('')
      setDataFim('')
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      {podeCriar(usuario, 'geral') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Novo {titulo}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  required
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataInicio">Data de início</label>
                <input
                  id="dataInicio"
                  type="date"
                  required
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataFim">Data de término</label>
                <input
                  id="dataFim"
                  type="date"
                  required
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message={`Nenhum ${titulo} cadastrado.`} />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Período</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(p => (
                  <tr key={p.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{p.nome}</td>
                    <td className="p-3.5 text-admin-text-muted">{p.cargo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(p.dataInicio)} — {formatarData(p.dataFim)}</td>
                    <td className="p-3.5 text-right">
                      {podeExcluir(usuario, 'geral') && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setIdParaExcluir(p.id)}
                            aria-label="Excluir"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
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
        titulo={`Excluir ${titulo}?`}
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

interface GestorFormState {
  id: number | null
  nome: string
  cargo: string
  dataInicio: string
  dataFim: string
  verificado: boolean
}

const GESTOR_VAZIO: GestorFormState = { id: null, nome: '', cargo: '', dataInicio: '', dataFim: '', verificado: false }

// Gestor divergiu de ex-gestores/ordenadores em 2026-08-05: virou histórico com 1
// vigente (POST cria e já ativa, desativando o anterior), PUT só corrige dados sem
// mexer em quem tá ativo, PATCH .../ativar reativa um antigo, e DELETE é admin-only
// no backend (checagem direta com isAdministrador, não via podeExcluir(usuario,
// 'geral') — esse grupo resolve MANAGER, certo pros outros sub-recursos, errado aqui).
function AbaGestores({ unidadeId }: { unidadeId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<GestorUnidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    gestorUnidadeService
      .listarPorUnidade(unidadeId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [unidadeId])

  const [form, setForm] = useState<GestorFormState | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [processando, setProcessando] = useState<number | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setFoto(null)
    setForm(GESTOR_VAZIO)
  }

  function abrirEdicao(g: GestorUnidade) {
    setErroForm(null)
    setFoto(null)
    setForm({
      id: g.id,
      nome: g.nome,
      cargo: g.cargo,
      dataInicio: g.dataInicio ?? '',
      dataFim: g.dataFim ?? '',
      verificado: g.verificado
    })
  }

  async function ativar(gestorId: number) {
    setProcessando(gestorId)
    try {
      await gestorUnidadeService.ativar(unidadeId, gestorId)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao reativar')
    } finally {
      setProcessando(null)
    }
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await gestorUnidadeService.excluir(unidadeId, idParaExcluir)
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
    if (!form) return

    if (form.dataInicio && form.dataFim && form.dataInicio > form.dataFim) {
      setErroForm('A data de início não pode ser depois da data de término.')
      return
    }

    setSalvando(true)
    setErroForm(null)

    const dados: GestorUnidadeRequest = {
      nome: form.nome,
      cargo: form.cargo,
      dataInicio: form.dataInicio || undefined,
      dataFim: form.dataFim || undefined,
      verificado: form.verificado
    }

    try {
      if (form.id) {
        await gestorUnidadeService.atualizar(unidadeId, form.id, dados, foto)
      } else {
        await gestorUnidadeService.criar(unidadeId, dados, foto)
      }
      setForm(null)
      setFoto(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-admin-text-muted">
        Cadastrar um novo gestor aqui o torna automaticamente o vigente (desativa o
        anterior, sem apagar do histórico). Pra corrigir dados de um registro existente
        sem trocar quem está ativo, use &quot;Editar&quot;; pra voltar um gestor antigo a
        ser o vigente, use &quot;Reativar&quot;.
      </p>

      {podeCriar(usuario, 'geral') && !form && (
        <button
          onClick={abrirCriacao}
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          + Novo gestor
        </button>
      )}

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">
              {form.id ? 'Editar registro' : 'Novo gestor (torna-se o vigente)'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataInicio">Data de início (opcional)</label>
                <input
                  id="dataInicio"
                  type="date"
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataFim">Data de término (opcional)</label>
                <input
                  id="dataFim"
                  type="date"
                  min={form.dataInicio || undefined}
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-admin-text-muted">
              <input
                type="checkbox"
                checked={form.verificado}
                onChange={e => setForm({ ...form, verificado: e.target.checked })}
                className="rounded border-admin-border accent-admin-accent"
              />
              Cadastro verificado
            </label>

            <div>
              <label className={classeLabel} htmlFor="foto">
                Foto {form.id && '(opcional — mantém a atual se vazio)'}
              </label>
              <input
                id="foto"
                type="file"
                accept="image/*"
                onChange={e => setFoto(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-admin-text-muted
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:text-white
                  file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark"
              />
              {foto && <p className="text-xs text-admin-text-faint mt-1">Selecionada: {foto.name}</p>}
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
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum gestor cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Período</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(g => (
                  <tr key={g.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{g.nome}</td>
                    <td className="p-3.5 text-admin-text-muted">{g.cargo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">
                      {formatarData(g.dataInicio)} — {g.dataFim ? formatarData(g.dataFim) : 'o momento'}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        {g.ativo && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-info-light text-admin-info">
                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-info" />
                            Vigente
                          </span>
                        )}
                        {g.verificado && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-success-light text-admin-success">
                            <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-success" />
                            Verificado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'geral') && (
                          <button
                            onClick={() => abrirEdicao(g)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {!g.ativo && podeEditar(usuario, 'geral') && (
                          <button
                            onClick={() => ativar(g.id)}
                            disabled={processando === g.id}
                            className="px-2 py-1 rounded-md text-xs font-semibold text-admin-accent hover:bg-admin-surface-3 disabled:opacity-60 transition-colors"
                          >
                            {processando === g.id ? 'Aguarde...' : 'Reativar'}
                          </button>
                        )}
                        {isAdministrador(usuario) && (
                          <button
                            onClick={() => setIdParaExcluir(g.id)}
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
        titulo="Excluir registro do histórico?"
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

function AbaSetores({ unidadeId }: { unidadeId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<SetorUnidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    setorUnidadeService
      .listarPorUnidade(unidadeId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [unidadeId])

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await setorUnidadeService.excluir(idParaExcluir)
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

    setSalvando(true)
    setErroForm(null)

    try {
      await setorUnidadeService.criar(unidadeId, { nome, descricao })
      setNome('')
      setDescricao('')
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-5">
      {podeCriar(usuario, 'geral') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Novo setor</h2>

            <div>
              <label className={classeLabel} htmlFor="nome">Nome</label>
              <input
                id="nome"
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                required
                rows={2}
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className={classeInput}
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum setor cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Descrição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(s => (
                  <tr key={s.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{s.nome}</td>
                    <td className="p-3.5 text-admin-text-muted">{s.descricao}</td>
                    <td className="p-3.5 text-right">
                      {podeExcluir(usuario, 'geral') && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setIdParaExcluir(s.id)}
                            aria-label="Excluir"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        </div>
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
        titulo="Excluir setor?"
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
