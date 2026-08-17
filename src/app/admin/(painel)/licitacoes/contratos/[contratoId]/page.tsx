'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { MdDeleteOutline, MdEdit, MdVisibility } from 'react-icons/md'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Fornecedor } from '@/modules/admin/geral/types'
import { ContratoLicitacao, Aditivo } from '@/modules/contratos/types'
import { contratoService } from '@/modules/admin/licitacoes/contrato.service'
import { aditivoService } from '@/modules/admin/licitacoes/aditivo.service'
import { AditivoRequest, Documento, DocumentoUploadRequest } from '@/modules/admin/licitacoes/types'
import { hrefDocumento } from '@/utils/documento'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'
const classeArquivo =
  'block w-full text-sm text-admin-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark'

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

function formatarMoeda(valor?: number) {
  if (valor === undefined || valor === null) return '—'
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type Aba = 'documento' | 'aditivos'

export default function ContratoDetalheAdminPage() {
  const params = useParams<{ contratoId: string }>()
  const searchParams = useSearchParams()
  const contratoId = Number(params.contratoId)
  const licitacaoId = searchParams.get('licitacaoId')

  const [contrato, setContrato] = useState<ContratoLicitacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    contratoService
      .buscarPorId(contratoId)
      .then(setContrato)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [contratoId])

  const [aba, setAba] = useState<Aba>('documento')

  if (loading) {
    return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  }
  if (erro) return <AdminErrorState message={erro} />
  if (!contrato) return null

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={licitacaoId ? `/admin/licitacoes/${licitacaoId}` : '/admin/licitacoes'}
          className="text-sm text-admin-accent hover:underline"
        >
          &larr; Voltar para {licitacaoId ? 'a licitação' : 'Licitações'}
        </Link>
        <div>
          <h1 className="text-lg font-bold text-admin-text">
            Contrato nº {contrato.numeroContrato}/{contrato.exercicio}
          </h1>
          <p className="text-sm text-admin-text-muted">{contrato.objeto}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-admin-text-faint text-xs">Fornecedor</p>
          <p className="font-semibold text-admin-text">{contrato.fornecedor}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Status</p>
          <p className="font-semibold text-admin-text">{contrato.status}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Unidade</p>
          <p className="font-semibold text-admin-text">{contrato.unidade}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Gestor do contrato</p>
          <p className="font-semibold text-admin-text">{contrato.gestorContrato}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Assinatura</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(contrato.dataAssinatura)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Publicação</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(contrato.dataPublicacao)} ({contrato.meioPublicacao})</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Vigência</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(contrato.dataInicio)} — {formatarData(contrato.dataTermino)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Valor</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(contrato.valorContrato)}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-admin-border">
        {([
          ['documento', 'Documento'],
          ['aditivos', 'Aditivos']
        ] as [Aba, string][]).map(([valor, label]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-all ${
              aba === valor ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-muted hover:text-admin-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {aba === 'documento' && <AbaDocumento contratoId={contratoId} />}
      {aba === 'aditivos' && <AbaAditivos contratoId={contratoId} />}
    </div>
  )
}

function AbaDocumento({ contratoId }: { contratoId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    contratoService
      .listarDocumentos(contratoId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [contratoId])

  const [dados, setDados] = useState<DocumentoUploadRequest>({ assunto: '', tipoDocumento: '', dataEnvio: '' })
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (documentoParaExcluir === null) return

    setExcluindo(true)
    try {
      await contratoService.excluirDocumento(contratoId, documentoParaExcluir)
      setDocumentoParaExcluir(null)
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
      await contratoService.criarDocumento(contratoId, dados, arquivo)
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
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Novo documento</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="assunto">Assunto</label>
                <input
                  id="assunto"
                  required
                  value={dados.assunto}
                  onChange={e => setDados({ ...dados, assunto: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="tipoDocumento">Tipo de documento</label>
                <input
                  id="tipoDocumento"
                  required
                  value={dados.tipoDocumento}
                  onChange={e => setDados({ ...dados, tipoDocumento: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataEnvio">Data de envio</label>
                <input
                  id="dataEnvio"
                  type="date"
                  required
                  value={dados.dataEnvio}
                  onChange={e => setDados({ ...dados, dataEnvio: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="arquivo">Arquivo (PDF)</label>
              <input
                id="arquivo"
                type="file"
                accept="application/pdf"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className={classeArquivo}
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar documento'}
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum documento cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Assunto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Envio</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(d => (
                  <tr key={d.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text">{d.assunto}</td>
                    <td className="p-3.5 text-admin-text-muted">{d.tipoDocumento}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(d.dataEnvio)}</td>
                    <td className="p-3.5">
                      <Link
                        href={hrefDocumento(contratoService.urlDocumento(contratoId, d.id), d.assunto, { admin: true })}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver documento
                      </Link>
                    </td>
                    <td className="p-3.5 text-right">
                      {podeExcluir(usuario, 'licitacoes') && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setDocumentoParaExcluir(d.id)}
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
        aberto={documentoParaExcluir !== null}
        titulo="Excluir documento?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setDocumentoParaExcluir(null)}
      />
    </div>
  )
}

const ADITIVO_VAZIO = { dataAssinatura: '', objeto: '', fornecedorId: 0 }
type AditivoFormState = { id: number | null } & typeof ADITIVO_VAZIO

function AbaAditivos({ contratoId }: { contratoId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Aditivo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    aditivoService
      .listarPorContrato(contratoId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [contratoId])

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  useEffect(() => {
    fornecedoresService.listar({ size: 200, sort: 'nome,asc' }).then(p => setFornecedores(p.content)).catch(() => {})
  }, [])

  const [form, setForm] = useState<AditivoFormState | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [aditivoParaExcluir, setAditivoParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setArquivo(null)
    setForm({ id: null, ...ADITIVO_VAZIO })
  }

  function abrirEdicao(a: Aditivo) {
    setErroForm(null)
    setArquivo(null)
    setForm({ id: a.id, dataAssinatura: a.dataAssinatura, objeto: a.objeto, fornecedorId: a.fornecedorId ?? 0 })
  }

  async function confirmarExclusao() {
    if (aditivoParaExcluir === null) return

    setExcluindo(true)
    try {
      await aditivoService.excluir(aditivoParaExcluir)
      setAditivoParaExcluir(null)
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

    setSalvando(true)
    setErroForm(null)

    const dados: AditivoRequest = {
      dataAssinatura: form.dataAssinatura,
      objeto: form.objeto,
      fornecedorId: form.fornecedorId,
      contratoLicitacaoId: contratoId
    }

    try {
      if (form.id) {
        await aditivoService.atualizar(form.id, dados, arquivo)
      } else {
        await aditivoService.criar(dados, arquivo)
      }
      setForm(null)
      setArquivo(null)
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
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          + Novo aditivo
        </button>
      )}

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar aditivo' : 'Novo aditivo'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataAssinatura">Data de assinatura</label>
                <input
                  id="dataAssinatura"
                  type="date"
                  required
                  value={form.dataAssinatura}
                  onChange={e => setForm({ ...form, dataAssinatura: e.target.value })}
                  className={classeInput}
                />
              </div>
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

            <div>
              <label className={classeLabel} htmlFor="arquivo">
                Arquivo (PDF) {form.id && <span className="font-normal normal-case text-admin-text-faint">— opcional, mantém o atual se não enviar um novo</span>}
              </label>
              <input
                id="arquivo"
                type="file"
                accept="application/pdf"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className={classeArquivo}
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
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum aditivo cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Assinatura</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Objeto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Fornecedor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Documento</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(a => (
                  <tr key={a.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(a.dataAssinatura)}</td>
                    <td className="p-3.5 text-admin-text">{a.objeto}</td>
                    <td className="p-3.5 text-admin-text-muted">{a.fornecedorNome}</td>
                    <td className="p-3.5">
                      {a.caminhoPdf ? (
                        <Link
                          href={hrefDocumento(aditivoService.urlArquivo(a.id), a.objeto, { admin: true })}
                          className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                        >
                          <MdVisibility size={15} /> Ver documento
                        </Link>
                      ) : (
                        <span className="text-admin-text-faint">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'licitacoes') && (
                          <button
                            onClick={() => abrirEdicao(a)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'licitacoes') && (
                          <button
                            onClick={() => setAditivoParaExcluir(a.id)}
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
        aberto={aditivoParaExcluir !== null}
        titulo="Excluir aditivo?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAditivoParaExcluir(null)}
      />
    </div>
  )
}
