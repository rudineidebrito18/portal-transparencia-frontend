'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { podeCriar } from '@/modules/auth/permissoes'
import { useAuth } from '@/modules/auth/AuthContext'
import { publicacaoService } from '@/modules/admin/diario-oficial/publicacao.service'
import {
  FiltroSolicitacaoPublicacao,
  SolicitacaoPublicacao,
  SolicitacaoPublicacaoRequest,
  StatusPublicacaoDiario,
  StatusPublicacaoDiarioDescricao,
  StatusPublicacaoDiarioStyle,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Diário Oficial — Publicações</h1>

        {podeCriar(usuario, 'diario-oficial') && !form && (
          <button
            onClick={() => { setErroForm(null); setForm(FORM_VAZIO) }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova solicitação
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap items-end gap-3" hoverable={false}>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={filtros.status ?? ''}
            onChange={e => setFiltros({ ...filtros, status: (e.target.value || undefined) as StatusPublicacaoDiario | undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            {Object.values(StatusPublicacaoDiario).map(s => (
              <option key={s} value={s}>{StatusPublicacaoDiarioDescricao[s]}</option>
            ))}
          </select>
        </div>

        <form onSubmit={buscarPorId} className="flex items-end gap-2 ml-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Ir direto pro ID</label>
            <input
              type="number"
              placeholder="Ex: 12"
              value={buscaId}
              onChange={e => setBuscaId(e.target.value)}
              className="border border-border/30 rounded-lg px-3 py-2 text-sm w-28"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
          >
            Ir
          </button>
        </form>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Nova solicitação de publicação</h2>
            <p className="text-xs text-text-secondary/60">
              O PDF já deve vir pronto (elaborado externamente) — o pipeline valida, monta a
              versão oficial com cabeçalho/rodapé/QR code, aguarda aprovação e só então assina
              digitalmente e publica.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nº da edição</label>
                <input
                  type="number"
                  required
                  value={form.numeroEdicao || ''}
                  onChange={e => setForm({ ...form, numeroEdicao: Number(e.target.value) })}
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
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  required
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(TipoEdicaoDiario).map(t => (
                    <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Volume (opcional)</label>
                <input
                  type="number"
                  value={form.volume ?? ''}
                  onChange={e => setForm({ ...form, volume: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <input
                  value={form.descricao ?? ''}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arquivo (PDF pronto da edição)</label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-semibold"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={enviando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : 'Enviar pra processamento'}
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma solicitação encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Nº edição</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tentativas</th>
                <th className="p-3">Atualizado em</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{s.id}</td>
                  <td className="p-3">{s.numeroEdicao}</td>
                  <td className="p-3">
                    <Badge className={StatusPublicacaoDiarioStyle[s.status]}>
                      {StatusPublicacaoDiarioDescricao[s.status]}
                    </Badge>
                  </td>
                  <td className="p-3">{s.tentativas}</td>
                  <td className="p-3">{formatarDataHora(s.atualizadoEm)}</td>
                  <td className="p-3 text-right">
                    <Link href={`/admin/diario-oficial/publicacoes/${s.id}`} className="text-primary hover:underline">
                      Ver
                    </Link>
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
