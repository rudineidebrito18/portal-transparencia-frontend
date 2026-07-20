'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeExcluir } from '@/modules/auth/permissoes'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Fornecedor } from '@/modules/admin/geral/types'
import { ContratoLicitacao, Aditivo } from '@/modules/contratos/types'
import { contratoService } from '@/modules/admin/licitacoes/contrato.service'
import { aditivoService } from '@/modules/admin/licitacoes/aditivo.service'
import { AditivoRequest, Documento, DocumentoUploadRequest } from '@/modules/admin/licitacoes/types'

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

  if (loading) return <Skeleton className="h-64" />
  if (erro) return <ErrorState message={erro} />
  if (!contrato) return null

  return (
    <div className="space-y-4">
      <div>
        <Link
          href={licitacaoId ? `/admin/licitacoes/${licitacaoId}` : '/admin/licitacoes'}
          className="text-sm text-primary hover:underline"
        >
          &larr; Voltar para {licitacaoId ? 'a licitação' : 'Licitações'}
        </Link>
        <div>
          <h1 className="text-lg font-bold text-primary">
            Contrato nº {contrato.numeroContrato}/{contrato.exercicio}
          </h1>
          <p className="text-sm text-text-secondary/70">{contrato.objeto}</p>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" hoverable={false}>
        <div>
          <p className="text-text-secondary/60 text-xs">Fornecedor</p>
          <p className="font-semibold">{contrato.fornecedor}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Status</p>
          <p className="font-semibold">{contrato.status}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Unidade</p>
          <p className="font-semibold">{contrato.unidade}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Gestor do contrato</p>
          <p className="font-semibold">{contrato.gestorContrato}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Assinatura</p>
          <p className="font-semibold">{formatarData(contrato.dataAssinatura)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Publicação</p>
          <p className="font-semibold">{formatarData(contrato.dataPublicacao)} ({contrato.meioPublicacao})</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Vigência</p>
          <p className="font-semibold">{formatarData(contrato.dataInicio)} — {formatarData(contrato.dataTermino)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Valor</p>
          <p className="font-semibold">{formatarMoeda(contrato.valorContrato)}</p>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-border/30">
        {([
          ['documento', 'Documento'],
          ['aditivos', 'Aditivos']
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

  async function excluir(id: number) {
    if (!confirm('Excluir este documento? Essa ação não pode ser desfeita.')) return
    try {
      await contratoService.excluirDocumento(contratoId, id)
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

const ADITIVO_VAZIO = { dataAssinatura: '', objeto: '', fornecedorId: 0, caminhoPdf: '' }

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
    fornecedoresService.listar().then(setFornecedores).catch(() => {})
  }, [])

  const [form, setForm] = useState<typeof ADITIVO_VAZIO | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function excluir(id: number) {
    if (!confirm('Excluir este aditivo? Essa ação não pode ser desfeita.')) return
    try {
      await aditivoService.excluir(id)
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

    const dados: AditivoRequest = {
      dataAssinatura: form.dataAssinatura,
      objeto: form.objeto,
      fornecedorId: form.fornecedorId,
      caminhoPdf: form.caminhoPdf || undefined,
      contratoLicitacaoId: contratoId
    }

    try {
      await aditivoService.criar(dados)
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
          onClick={() => { setErroForm(null); setForm(ADITIVO_VAZIO) }}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          + Novo aditivo
        </button>
      )}

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo aditivo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <select
                  required
                  value={form.fornecedorId || ''}
                  onChange={e => setForm({ ...form, fornecedorId: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Selecione...</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
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

            <div>
              <label className="block text-sm font-medium mb-1">Caminho do PDF</label>
              <input
                value={form.caminhoPdf}
                onChange={e => setForm({ ...form, caminhoPdf: e.target.value })}
                placeholder="/documentos/aditivos/exemplo.pdf"
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
              <p className="text-xs text-text-secondary/60 mt-1">
                O backend ainda não tem upload de arquivo pra aditivo — esse campo salva só o texto do caminho, não faz upload.
              </p>
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
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum aditivo cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Assinatura</th>
                <th className="p-3">Objeto</th>
                <th className="p-3">Fornecedor</th>
                <th className="p-3">PDF</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(a => (
                <tr key={a.id} className="border-t border-border/20">
                  <td className="p-3">{formatarData(a.dataAssinatura)}</td>
                  <td className="p-3">{a.objeto}</td>
                  <td className="p-3">{a.fornecedorNome}</td>
                  <td className="p-3">{a.caminhoPdf || '—'}</td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'licitacoes') && (
                      <button onClick={() => excluir(a.id)} className="text-error hover:underline">
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
