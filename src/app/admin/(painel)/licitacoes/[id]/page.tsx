'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MdChevronRight, MdDeleteOutline, MdEdit, MdVisibility, MdVisibilityOff } from 'react-icons/md'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { LicitacaoDetalhe } from '@/modules/licitacoes/types'
import { ContratoLicitacao } from '@/modules/contratos/types'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { licitacaoService } from '@/modules/admin/licitacoes/licitacao.service'
import { contratoService } from '@/modules/admin/licitacoes/contrato.service'
import {
  ContratoLicitacaoRequest,
  Documento,
  DocumentoUploadRequest,
  LicitacaoOrgao,
  LicitacaoOrgaoRequest,
  StatusLicitacao,
  StatusLicitacaoDescricao,
  TipoOrgao,
  TipoOrgaoDescricao,
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao,
  normalizarStatus
} from '@/modules/admin/licitacoes/types'
import { hrefDocumento } from '@/utils/documento'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'
const classeArquivo =
  'block w-full text-sm text-admin-text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark'

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

type Aba = 'documentos' | 'contratos' | 'orgaos'
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
  const { usuario } = useAuth()
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
  const [confirmandoVisibilidade, setConfirmandoVisibilidade] = useState(false)
  const [alterandoVisibilidade, setAlterandoVisibilidade] = useState(false)

  async function confirmarAlternarVisibilidade() {
    if (!licitacao) return

    const tornarVisivel = !licitacao.visivel
    setAlterandoVisibilidade(true)
    try {
      await licitacaoService.alterarVisibilidade(licitacaoId, tornarVisivel)
      setConfirmandoVisibilidade(false)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao alterar visibilidade')
    } finally {
      setAlterandoVisibilidade(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  }
  if (erro) return <AdminErrorState message={erro} />
  if (!licitacao) return null

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/licitacoes" className="text-sm text-admin-accent hover:underline">
          &larr; Voltar para Licitações
        </Link>
        <div className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-lg font-bold text-admin-text">
              Licitação nº {licitacao.numeroInstrumento}/{licitacao.ano}
              <span className="text-sm font-normal text-admin-text-faint ml-2">Nº TCE {licitacao.numeroSequencial}</span>
            </h1>
            <p className="text-sm text-admin-text-muted">{licitacao.objeto}</p>
          </div>
          <div className="flex items-center gap-2">
            <BadgeStatusLicitacao statusDescricao={licitacao.status} />
            {!licitacao.visivel && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-faint">
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-text-faint" />
                Oculta
              </span>
            )}
            {podeExcluir(usuario, 'licitacoes') && (
              <button
                onClick={() => setConfirmandoVisibilidade(true)}
                className="px-3 py-1.5 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all inline-flex items-center gap-1"
              >
                {licitacao.visivel ? <MdVisibilityOff /> : <MdVisibility />}
                {licitacao.visivel ? 'Ocultar' : 'Mostrar'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-admin-text-faint text-xs">Nº do processo</p>
          <p className="font-semibold text-admin-text">{licitacao.numeroProcesso}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Tipo de procedimento</p>
          <p className="font-semibold text-admin-text">
            {TipoProcedimentoDescricao[licitacao.tipoProcedimentoLicitacao as TipoProcedimentoLicitacao] ?? licitacao.tipoProcedimentoLicitacao}
          </p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Unidade</p>
          <p className="font-semibold text-admin-text">{licitacao.unidade ?? '—'}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Autoridade</p>
          <p className="font-semibold text-admin-text">{licitacao.nomeAutoridade ?? '—'}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Publicação</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(licitacao.dataPublicacao)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Sessão</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(licitacao.dataSessao)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Abertura</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(licitacao.dataAbertura)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Homologação</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarData(licitacao.dataHomologacao)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Valor estimado</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(licitacao.valorEstimado)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Valor adjudicado</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(licitacao.valorAdjudicado)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Valor da dotação</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarMoeda(licitacao.valorDotacao)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">COVID-19</p>
          <p className="font-semibold text-admin-text">{licitacao.covid ? 'Sim' : 'Não'}</p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-admin-border">
        {([
          ['documentos', 'Documentos'],
          ['contratos', 'Contratos'],
          ['orgaos', 'Órgãos']
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

      {aba === 'documentos' && <AbaDocumentos licitacaoId={licitacaoId} />}
      {aba === 'contratos' && <AbaContratos licitacaoId={licitacaoId} />}
      {aba === 'orgaos' && <AbaOrgaos licitacaoId={licitacaoId} />}

      <ConfirmDialog
        aberto={confirmandoVisibilidade}
        titulo={licitacao.visivel ? 'Ocultar licitação?' : 'Tornar licitação visível?'}
        mensagem={
          licitacao.visivel
            ? 'Ela deixa de aparecer na consulta pública para quem não é admin. Não é exclusão — dá pra reverter depois.'
            : 'Ela volta a aparecer normalmente na consulta pública.'
        }
        confirmarLabel={licitacao.visivel ? 'Ocultar' : 'Tornar visível'}
        perigoso={licitacao.visivel}
        carregando={alterandoVisibilidade}
        onConfirmar={confirmarAlternarVisibilidade}
        onCancelar={() => setConfirmandoVisibilidade(false)}
      />
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
  const [documentoParaExcluir, setDocumentoParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (documentoParaExcluir === null) return

    setExcluindo(true)
    try {
      await licitacaoService.excluirDocumento(licitacaoId, documentoParaExcluir)
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
                        href={hrefDocumento(licitacaoService.urlDocumento(licitacaoId, d.id), d.assunto, { admin: true })}
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
  const [contratoParaExcluir, setContratoParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

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

  async function confirmarExclusao() {
    if (contratoParaExcluir === null) return

    setExcluindo(true)
    try {
      await contratoService.excluir(contratoParaExcluir)
      setContratoParaExcluir(null)
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
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          + Novo contrato
        </button>
      )}

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar contrato' : 'Novo contrato'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numeroContrato">Nº do contrato</label>
                <input
                  id="numeroContrato"
                  type="number"
                  required
                  value={form.numeroContrato}
                  onChange={e => setForm({ ...form, numeroContrato: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="exercicio">Exercício</label>
                <input
                  id="exercicio"
                  type="number"
                  required
                  value={form.exercicio}
                  onChange={e => setForm({ ...form, exercicio: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="fornecedor">Fornecedor</label>
                <input
                  id="fornecedor"
                  required
                  value={form.fornecedor}
                  onChange={e => setForm({ ...form, fornecedor: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <label className={classeLabel} htmlFor="meioPublicacao">Meio de publicação</label>
                <input
                  id="meioPublicacao"
                  required
                  value={form.meioPublicacao}
                  onChange={e => setForm({ ...form, meioPublicacao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <label className={classeLabel} htmlFor="dataTermino">Data de término</label>
                <input
                  id="dataTermino"
                  type="date"
                  required
                  value={form.dataTermino}
                  onChange={e => setForm({ ...form, dataTermino: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorContrato">Valor do contrato</label>
                <input
                  id="valorContrato"
                  type="number"
                  step="0.01"
                  required
                  value={form.valorContrato}
                  onChange={e => setForm({ ...form, valorContrato: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="unidade">Unidade</label>
                <input
                  id="unidade"
                  required
                  value={form.unidade}
                  onChange={e => setForm({ ...form, unidade: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="gestorContrato">Gestor do contrato</label>
                <input
                  id="gestorContrato"
                  required
                  value={form.gestorContrato}
                  onChange={e => setForm({ ...form, gestorContrato: e.target.value })}
                  className={classeInput}
                />
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
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum contrato cadastrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº contrato</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Fornecedor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Assinatura</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Vigência</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(c => (
                  <tr key={c.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text tabular-nums">{c.numeroContrato}/{c.exercicio}</td>
                    <td className="p-3.5 text-admin-text">{c.fornecedor}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(c.dataAssinatura)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(c.dataInicio)} — {formatarData(c.dataTermino)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(c.valorContrato)}</td>
                    <td className="p-3.5"><BadgeStatusLicitacao statusDescricao={c.status} /></td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/licitacoes/contratos/${c.id}?licitacaoId=${licitacaoId}`}
                          aria-label="Ver detalhes"
                          className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </Link>
                        {podeEditar(usuario, 'licitacoes') && (
                          <button
                            onClick={() => abrirEdicao(c)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'licitacoes') && (
                          <button
                            onClick={() => setContratoParaExcluir(c.id)}
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
        aberto={contratoParaExcluir !== null}
        titulo="Excluir contrato?"
        mensagem="Essa ação também remove documentos e aditivos vinculados, e não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setContratoParaExcluir(null)}
      />
    </div>
  )
}

const ORGAO_VAZIO: LicitacaoOrgaoRequest = { unidadeId: 0, ordenador: '', tipo: TipoOrgao.PARTICIPANTE }
type OrgaoFormState = { id: number | null } & LicitacaoOrgaoRequest

function AbaOrgaos({ licitacaoId }: { licitacaoId: number }) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<LicitacaoOrgao[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    licitacaoService
      .listarOrgaos(licitacaoId)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [licitacaoId])

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    unidadesService.listar({ size: 200, sort: 'nome,asc' }).then(p => setUnidades(p.content)).catch(() => {})
  }, [])

  const [form, setForm] = useState<OrgaoFormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [orgaoParaExcluir, setOrgaoParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm({ id: null, ...ORGAO_VAZIO })
  }

  function abrirEdicao(o: LicitacaoOrgao) {
    setErroForm(null)
    setForm({ id: o.id, unidadeId: o.unidadeId, ordenador: o.ordenador, tipo: o.tipo })
  }

  async function confirmarExclusao() {
    if (orgaoParaExcluir === null) return

    setExcluindo(true)
    try {
      await licitacaoService.excluirOrgao(licitacaoId, orgaoParaExcluir)
      setOrgaoParaExcluir(null)
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

    const { id, ...dados } = form

    try {
      if (id) {
        await licitacaoService.atualizarOrgao(licitacaoId, id, dados)
      } else {
        await licitacaoService.criarOrgao(licitacaoId, dados)
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
      <p className="text-sm text-admin-text-muted">
        Órgãos vinculados a esta licitação (padrão PNCP de compra compartilhada) — só um pode
        ser o gerenciador; os demais entram como participantes.
      </p>

      {podeCriar(usuario, 'licitacoes') && !form && (
        <button
          onClick={abrirCriacao}
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          + Vincular órgão
        </button>
      )}

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar vínculo' : 'Novo vínculo'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="unidadeId">Unidade</label>
                <select
                  id="unidadeId"
                  required
                  value={form.unidadeId || ''}
                  onChange={e => setForm({ ...form, unidadeId: Number(e.target.value) })}
                  className={classeInput}
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="ordenador">Ordenador</label>
                <input
                  id="ordenador"
                  required
                  value={form.ordenador}
                  onChange={e => setForm({ ...form, ordenador: e.target.value })}
                  className={classeInput}
                  placeholder="Nome de quem ordenava a despesa nesse órgão"
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  required
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoOrgao })}
                  className={classeInput}
                >
                  {Object.values(TipoOrgao).map(t => (
                    <option key={t} value={t}>{TipoOrgaoDescricao[t]}</option>
                  ))}
                </select>
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
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum órgão vinculado a esta licitação." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Ordenador</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(o => (
                  <tr key={o.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{o.unidadeNome}</td>
                    <td className="p-3.5 text-admin-text-muted">{o.ordenador}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          o.tipo === TipoOrgao.GERENCIADOR ? 'bg-admin-info-light text-admin-info' : 'bg-admin-surface-3 text-admin-text-muted'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`w-1.5 h-1.5 rounded-full ${o.tipo === TipoOrgao.GERENCIADOR ? 'bg-admin-info' : 'bg-admin-text-faint'}`}
                        />
                        {TipoOrgaoDescricao[o.tipo]}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'licitacoes') && (
                          <button
                            onClick={() => abrirEdicao(o)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'licitacoes') && (
                          <button
                            onClick={() => setOrgaoParaExcluir(o.id)}
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
        aberto={orgaoParaExcluir !== null}
        titulo="Excluir vínculo de órgão?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setOrgaoParaExcluir(null)}
      />
    </div>
  )
}
