'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import {
  decretoUnidadeService,
  documentoUnidadeService,
  exGestorUnidadeService,
  ordenadorUnidadeService,
  setorUnidadeService
} from '@/modules/admin/geral/unidadeSubrecursos.service'
import {
  Decreto,
  DocumentoUnidade,
  PessoaCargoUnidade,
  SetorUnidade,
  TipoDocumentoUnidade,
  TipoDocumentoUnidadeDescricao,
  Unidade
} from '@/modules/admin/geral/types'

function formatarData(data?: string | null) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

type Aba = 'decretos' | 'documentos' | 'exGestores' | 'ordenadores' | 'setores'

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

  if (loading) return <Skeleton className="h-64" />
  if (erro) return <ErrorState message={erro} />
  if (!unidade) return null

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/geral/unidades" className="text-sm text-primary hover:underline">
          &larr; Voltar para Unidades
        </Link>
        <h1 className="text-lg font-bold text-primary mt-1">{unidade.nome}</h1>
      </div>

      <Card className="p-4 flex flex-col md:flex-row gap-4" hoverable={false}>
        {unidade.gestorFotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={unidade.gestorFotoUrl}
            alt={unidade.gestorNome}
            className="w-24 h-24 rounded-lg object-cover shrink-0"
          />
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1">
          <div>
            <p className="text-text-secondary/60 text-xs">CNPJ</p>
            <p className="font-semibold">{unidade.cnpj || '—'}</p>
          </div>
          <div>
            <p className="text-text-secondary/60 text-xs">Telefone</p>
            <p className="font-semibold">{unidade.telefone || '—'}</p>
          </div>
          <div>
            <p className="text-text-secondary/60 text-xs">E-mail</p>
            <p className="font-semibold">{unidade.email || '—'}</p>
          </div>
          <div>
            <p className="text-text-secondary/60 text-xs">Horário de atendimento</p>
            <p className="font-semibold">{unidade.horarioAtendimento || '—'}</p>
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-text-secondary/60 text-xs">Endereço</p>
            <p className="font-semibold">{unidade.endereco || '—'}</p>
          </div>
          <div className="col-span-2 md:col-span-4">
            <p className="text-text-secondary/60 text-xs">Atribuições</p>
            <p className="font-semibold whitespace-pre-line">{unidade.atribuicoes || '—'}</p>
          </div>
          <div>
            <p className="text-text-secondary/60 text-xs">Gestor atual</p>
            <p className="font-semibold">
              {unidade.gestorNome || '—'} {unidade.gestorCargo && `— ${unidade.gestorCargo}`}
              {unidade.gestorVerificado && <Badge className="bg-success/10 text-success ml-2">Verificado</Badge>}
            </p>
          </div>
          <div>
            <p className="text-text-secondary/60 text-xs">Vigência do órgão</p>
            <p className="font-semibold">{formatarData(unidade.dataInicio)} — {formatarData(unidade.dataFim)}</p>
          </div>
        </div>
      </Card>

      <div className="flex gap-1 border-b border-border/30 flex-wrap">
        {([
          ['decretos', 'Decretos'],
          ['documentos', 'Documentos'],
          ['exGestores', 'Ex-gestores'],
          ['ordenadores', 'Ordenadores'],
          ['setores', 'Setores']
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

      {aba === 'decretos' && <AbaDecretos unidadeId={unidadeId} />}
      {aba === 'documentos' && <AbaDocumentos unidadeId={unidadeId} />}
      {aba === 'exGestores' && <AbaPessoaCargo unidadeId={unidadeId} tipo="exGestores" />}
      {aba === 'ordenadores' && <AbaPessoaCargo unidadeId={unidadeId} tipo="ordenadores" />}
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

  async function excluir(id: number) {
    if (!confirm('Excluir este decreto? Essa ação não pode ser desfeita.')) return
    try {
      await decretoUnidadeService.excluir(id)
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
    <div className="space-y-4">
      {podeCriar(usuario, 'geral') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo decreto</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arquivo (PDF, DOC, DOCX, XLS ou XLSX)</label>
              <input
                type="file"
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
              {enviando ? 'Enviando...' : 'Enviar decreto'}
            </button>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum decreto cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3">Data</th>
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(d => (
                <tr key={d.id} className="border-t border-border/20">
                  <td className="p-3">{d.descricao}</td>
                  <td className="p-3">{formatarData(d.data)}</td>
                  <td className="p-3">
                    <a href={d.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      Abrir
                    </a>
                  </td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'geral') && (
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

  if (loading) return <Skeleton className="h-40" />
  if (erro) return <ErrorState message={erro} />

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

  async function excluir() {
    if (!atual) return
    if (!confirm('Excluir este documento? Essa ação não pode ser desfeita.')) return
    try {
      await documentoUnidadeService.excluir(atual.id)
      aoAtualizar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  return (
    <Card className="p-4 space-y-3" hoverable={false}>
      <h3 className="font-semibold text-sm">{TipoDocumentoUnidadeDescricao[tipo]}</h3>

      {atual ? (
        <div className="text-sm space-y-1">
          <p className="text-text-secondary/60 text-xs">Enviado em {formatarData(atual.dataEnvio)}</p>
          <a href={atual.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Abrir arquivo atual
          </a>
        </div>
      ) : (
        <p className="text-sm text-text-secondary/50">Nenhum arquivo enviado.</p>
      )}

      {podeEscrever && (
        <div className="space-y-2">
          <input
            type="file"
            onChange={e => setArquivo(e.target.files?.[0] ?? null)}
            className="w-full text-xs file:mr-2 file:px-2 file:py-1 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:font-semibold"
          />
          {erro && <ErrorState message={erro} />}
          <div className="flex gap-2">
            <button
              onClick={enviar}
              disabled={!arquivo || enviando}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : atual ? 'Substituir' : 'Enviar'}
            </button>
            {atual && podeApagar && (
              <button onClick={excluir} className="px-3 py-1.5 rounded-lg border border-error/30 text-error text-xs font-semibold hover:bg-error/10 transition-all">
                Excluir
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

function AbaPessoaCargo({ unidadeId, tipo }: { unidadeId: number; tipo: 'exGestores' | 'ordenadores' }) {
  const { usuario } = useAuth()
  const servico = tipo === 'exGestores' ? exGestorUnidadeService : ordenadorUnidadeService
  const titulo = tipo === 'exGestores' ? 'ex-gestor' : 'ordenador de despesa'

  const [lista, setLista] = useState<PessoaCargoUnidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    servico
      .listarPorUnidade(unidadeId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(carregar, [unidadeId, tipo])

  const [nome, setNome] = useState('')
  const [cargo, setCargo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function excluir(id: number) {
    if (!confirm(`Excluir este ${titulo}? Essa ação não pode ser desfeita.`)) return
    try {
      await servico.excluir(id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
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
      await servico.criar(unidadeId, { nome, cargo, dataInicio, dataFim })
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
    <div className="space-y-4">
      {podeCriar(usuario, 'geral') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo {titulo}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  required
                  value={cargo}
                  onChange={e => setCargo(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de início</label>
                <input
                  type="date"
                  required
                  value={dataInicio}
                  onChange={e => setDataInicio(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de término</label>
                <input
                  type="date"
                  required
                  value={dataFim}
                  onChange={e => setDataFim(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message={`Nenhum ${titulo} cadastrado.`} />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Período</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(p => (
                <tr key={p.id} className="border-t border-border/20">
                  <td className="p-3">{p.nome}</td>
                  <td className="p-3">{p.cargo}</td>
                  <td className="p-3">{formatarData(p.dataInicio)} — {formatarData(p.dataFim)}</td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'geral') && (
                      <button onClick={() => excluir(p.id)} className="text-error hover:underline">
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

  async function excluir(id: number) {
    if (!confirm('Excluir este setor? Essa ação não pode ser desfeita.')) return
    try {
      await setorUnidadeService.excluir(id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
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
    <div className="space-y-4">
      {podeCriar(usuario, 'geral') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo setor</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                required
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                required
                rows={2}
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum setor cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Descrição</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(s => (
                <tr key={s.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{s.nome}</td>
                  <td className="p-3">{s.descricao}</td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'geral') && (
                      <button onClick={() => excluir(s.id)} className="text-error hover:underline">
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
