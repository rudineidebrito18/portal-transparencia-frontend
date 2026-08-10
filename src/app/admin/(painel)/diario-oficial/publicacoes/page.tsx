'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import { podeCriar } from '@/modules/auth/permissoes'
import { useAuth } from '@/modules/auth/AuthContext'
import { publicacaoService } from '@/modules/admin/diario-oficial/publicacao.service'
import {
  FiltroSolicitacaoPublicacao,
  SolicitacaoPublicacao,
  SolicitacaoPublicacaoRequest,
  StatusPublicacaoDiario,
  StatusPublicacaoDiarioDescricao,
  TipoEdicaoDiario,
  TipoEdicaoDiarioDescricao
} from '@/modules/admin/diario-oficial/types'

const FORM_VAZIO: SolicitacaoPublicacaoRequest = {
  numeroEdicao: 0,
  dataPublicacao: '',
  tipo: TipoEdicaoDiario.EXECUTIVO,
  volume: undefined,
  descricao: ''
}

// Style map do site público (StatusPublicacaoDiarioStyle em types.ts) usa cores
// claras fixas (bg-gray-100 etc) que não fazem sentido no shell escuro do admin —
// por isso o pill usa uma paleta semântica própria em tokens admin-*, mapeando o
// mesmo enum de status.
const STATUS_ESTILO: Record<StatusPublicacaoDiario, { pill: string; dot: string }> = {
  [StatusPublicacaoDiario.RECEBIDO]: { pill: 'bg-admin-surface-3 text-admin-text-muted', dot: 'bg-admin-text-faint' },
  [StatusPublicacaoDiario.VALIDANDO]: { pill: 'bg-admin-info-light text-admin-info', dot: 'bg-admin-info' },
  [StatusPublicacaoDiario.MONTANDO_DOCUMENTO_OFICIAL]: { pill: 'bg-admin-info-light text-admin-info', dot: 'bg-admin-info' },
  [StatusPublicacaoDiario.AGUARDANDO_APROVACAO]: { pill: 'bg-admin-warning-light text-admin-warning', dot: 'bg-admin-warning' },
  [StatusPublicacaoDiario.ASSINANDO]: { pill: 'bg-admin-info-light text-admin-info', dot: 'bg-admin-info' },
  [StatusPublicacaoDiario.PUBLICADO]: { pill: 'bg-admin-success-light text-admin-success', dot: 'bg-admin-success' },
  [StatusPublicacaoDiario.FALHOU]: { pill: 'bg-admin-error-light text-admin-error', dot: 'bg-admin-error' }
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarDataHora(data?: string) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR')
}

export default function PublicacoesDiarioAdminPage() {
  const { usuario } = useAuth()
  const router = useRouter()

  const fetchFunction = useCallback(
    (params: FiltroSolicitacaoPublicacao & { page?: number; size?: number; sort?: string }) => publicacaoService.listar(params),
    []
  )

  const { data, loading, erro, pagina, totalPaginas, filtros, setFiltros, setPagina } = usePageableResource<
    SolicitacaoPublicacao,
    FiltroSolicitacaoPublicacao
  >({ fetchFunction, initialSort: 'criadoEm,desc' })

  const [buscaId, setBuscaId] = useState('')

  function buscarPorId(e: FormEvent) {
    e.preventDefault()
    if (buscaId) router.push(`/admin/diario-oficial/publicacoes/${buscaId}`)
  }

  const [form, setForm] = useState<SolicitacaoPublicacaoRequest | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form || !arquivo) return

    setEnviando(true)
    setErroForm(null)

    try {
      const solicitacao = await publicacaoService.criar(form, arquivo)
      router.push(`/admin/diario-oficial/publicacoes/${solicitacao.id}`)
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">Diário Oficial — Publicações</h1>

        {podeCriar(usuario, 'diario-oficial') && !form && (
          <button
            onClick={() => { setErroForm(null); setForm(FORM_VAZIO) }}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova solicitação
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className={classeLabel} htmlFor="status">Status</label>
          <select
            id="status"
            value={filtros.status ?? ''}
            onChange={e => setFiltros({ ...filtros, status: (e.target.value || undefined) as StatusPublicacaoDiario | undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="">Todos os status</option>
            {Object.values(StatusPublicacaoDiario).map(s => (
              <option key={s} value={s}>{StatusPublicacaoDiarioDescricao[s]}</option>
            ))}
          </select>
        </div>

        <form onSubmit={buscarPorId} className="flex items-end gap-2 ml-auto">
          <div>
            <label className={classeLabel} htmlFor="buscaId">Ir direto pro ID</label>
            <input
              id="buscaId"
              type="number"
              placeholder="Ex: 12"
              value={buscaId}
              onChange={e => setBuscaId(e.target.value)}
              className={`${classeInput} w-28`}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
          >
            Ir
          </button>
        </form>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Nova solicitação de publicação</h2>
            <p className="text-xs text-admin-text-faint">
              O PDF já deve vir pronto (elaborado externamente) — o pipeline valida, monta a
              versão oficial com cabeçalho/rodapé/QR code, aguarda aprovação e só então assina
              digitalmente e publica.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numeroEdicao">Nº da edição</label>
                <input
                  id="numeroEdicao"
                  type="number"
                  required
                  value={form.numeroEdicao || ''}
                  onChange={e => setForm({ ...form, numeroEdicao: Number(e.target.value) })}
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
                <label className={classeLabel} htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  required
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className={classeInput}
                >
                  {Object.values(TipoEdicaoDiario).map(t => (
                    <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="volume">Volume (opcional)</label>
                <input
                  id="volume"
                  type="number"
                  value={form.volume ?? ''}
                  onChange={e => setForm({ ...form, volume: e.target.value ? Number(e.target.value) : undefined })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="descricao">Descrição (opcional)</label>
                <input
                  id="descricao"
                  value={form.descricao ?? ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="arquivo">Arquivo (PDF pronto da edição)</label>
              <input
                id="arquivo"
                type="file"
                accept="application/pdf"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-admin-text-muted
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:text-white
                  file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark"
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={enviando}
                className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : 'Enviar pra processamento'}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma solicitação encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">ID</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº edição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tentativas</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Atualizado em</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(s => (
                  <tr key={s.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text tabular-nums">{s.id}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{s.numeroEdicao}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_ESTILO[s.status].pill}`}>
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${STATUS_ESTILO[s.status].dot}`} />
                        {StatusPublicacaoDiarioDescricao[s.status]}
                      </span>
                    </td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{s.tentativas}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarDataHora(s.atualizadoEm)}</td>
                    <td className="p-3.5 text-right">
                      <Link
                        href={`/admin/diario-oficial/publicacoes/${s.id}`}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}
