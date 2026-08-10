'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeExcluir } from '@/modules/auth/permissoes'
import { publicacaoService } from '@/modules/admin/diario-oficial/publicacao.service'
import {
  LogEtapaProcessamento,
  SolicitacaoPublicacao,
  StatusPublicacaoDiario,
  StatusPublicacaoDiarioDescricao
} from '@/modules/admin/diario-oficial/types'
import { hrefDocumento } from '@/utils/documento'

const ESTADOS_EM_PROCESSAMENTO = new Set<StatusPublicacaoDiario>([
  StatusPublicacaoDiario.RECEBIDO,
  StatusPublicacaoDiario.VALIDANDO,
  StatusPublicacaoDiario.MONTANDO_DOCUMENTO_OFICIAL,
  StatusPublicacaoDiario.ASSINANDO
])

// Mesma paleta semântica usada em publicacoes/page.tsx — duplicada aqui porque são
// arquivos de página independentes (sem um local compartilhado pra esse mapeamento
// ainda).
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

function formatarDataHora(data?: string) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR')
}

export default function PublicacaoDetalheAdminPage() {
  const { usuario } = useAuth()
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const [solicitacao, setSolicitacao] = useState<SolicitacaoPublicacao | null>(null)
  const [logs, setLogs] = useState<LogEtapaProcessamento[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    publicacaoService
      .buscarPorId(id)
      .then(setSolicitacao)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))

    publicacaoService.listarLogs(id).then(setLogs).catch(() => {})
  }

  useEffect(() => {
    setLoading(true)
    setErro(null)
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // Enquanto o pipeline assíncrono está processando (antes de aguardar aprovação humana ou
  // terminar), consulta de novo periodicamente pra refletir o avanço sem o admin precisar
  // atualizar a página na mão.
  useEffect(() => {
    if (!solicitacao || !ESTADOS_EM_PROCESSAMENTO.has(solicitacao.status)) return
    const intervalo = setInterval(carregar, 3000)
    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solicitacao?.status])

  const [motivoRejeicao, setMotivoRejeicao] = useState('')
  const [mostrarRejeicao, setMostrarRejeicao] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<'fila' | 'edicao' | null>(null)

  async function aprovar() {
    setProcessando(true)
    setErroAcao(null)
    try {
      await publicacaoService.aprovar(id)
      carregar()
    } catch (e: unknown) {
      setErroAcao(e instanceof Error ? e.message : 'Erro ao aprovar')
    } finally {
      setProcessando(false)
    }
  }

  async function rejeitar() {
    setProcessando(true)
    setErroAcao(null)
    try {
      await publicacaoService.rejeitar(id, motivoRejeicao || undefined)
      carregar()
      setMostrarRejeicao(false)
      setMotivoRejeicao('')
    } catch (e: unknown) {
      setErroAcao(e instanceof Error ? e.message : 'Erro ao rejeitar')
    } finally {
      setProcessando(false)
    }
  }

  async function retomar() {
    setProcessando(true)
    setErroAcao(null)
    try {
      await publicacaoService.retomar(id)
      carregar()
    } catch (e: unknown) {
      setErroAcao(e instanceof Error ? e.message : 'Erro ao retomar')
    } finally {
      setProcessando(false)
    }
  }

  async function confirmarExclusao() {
    if (!confirmacaoExclusao || !solicitacao) return

    setProcessando(true)
    setErroAcao(null)
    try {
      if (confirmacaoExclusao === 'fila') {
        await publicacaoService.excluir(id)
      } else {
        await publicacaoService.excluirEdicaoPublicada(solicitacao.numeroEdicao)
      }
      router.push('/admin/diario-oficial/publicacoes')
    } catch (e: unknown) {
      setErroAcao(
        e instanceof Error
          ? e.message
          : confirmacaoExclusao === 'fila'
            ? 'Erro ao excluir'
            : 'Erro ao excluir a edição publicada'
      )
      setProcessando(false)
      setConfirmacaoExclusao(null)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  }
  if (erro) return <AdminErrorState message={erro} />
  if (!solicitacao) return null

  const podeAgir = podeCriar(usuario, 'diario-oficial')

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/diario-oficial/publicacoes" className="text-sm text-admin-accent hover:underline">
          &larr; Voltar para Publicações
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-lg font-bold text-admin-text">
            Solicitação nº {solicitacao.id} — Edição {solicitacao.numeroEdicao}
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_ESTILO[solicitacao.status].pill}`}>
            <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${STATUS_ESTILO[solicitacao.status].dot}`} />
            {StatusPublicacaoDiarioDescricao[solicitacao.status]}
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-admin-text-faint text-xs">Tentativas</p>
          <p className="font-semibold text-admin-text">{solicitacao.tentativas}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Criado em</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarDataHora(solicitacao.criadoEm)}</p>
        </div>
        <div>
          <p className="text-admin-text-faint text-xs">Atualizado em</p>
          <p className="font-semibold text-admin-text tabular-nums">{formatarDataHora(solicitacao.atualizadoEm)}</p>
        </div>
        {solicitacao.edicaoDiarioId && (
          <div>
            <p className="text-admin-text-faint text-xs">Edição publicada</p>
            <Link
              href={hrefDocumento(`/api/edicoes/${solicitacao.numeroEdicao}/download`, `Edição Nº ${solicitacao.numeroEdicao}`, { admin: true })}
              className="font-semibold text-admin-accent hover:underline"
            >
              Ver edição publicada
            </Link>
          </div>
        )}
      </div>

      {solicitacao.status === StatusPublicacaoDiario.FALHOU && (
        <div className="rounded-2xl border border-admin-border border-l-4 border-l-admin-error bg-admin-surface p-4">
          <p className="text-sm font-semibold text-admin-error">
            Falhou na etapa: {solicitacao.etapaFalha ? StatusPublicacaoDiarioDescricao[solicitacao.etapaFalha] : '—'}
          </p>
          {solicitacao.motivoFalha && <p className="text-sm text-admin-text-muted mt-1">{solicitacao.motivoFalha}</p>}
        </div>
      )}

      {ESTADOS_EM_PROCESSAMENTO.has(solicitacao.status) && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex items-center gap-3">
          <div className="h-4 w-4 rounded-full bg-admin-text-faint animate-pulse" aria-hidden="true" />
          <p className="text-sm text-admin-text-muted">
            Processando automaticamente — esta página atualiza sozinha a cada poucos segundos.
          </p>
        </div>
      )}

      {podeAgir && solicitacao.status === StatusPublicacaoDiario.AGUARDANDO_APROVACAO && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md space-y-3">
          <p className="text-sm font-semibold text-admin-text">Documento composto, aguardando revisão humana</p>
          <p className="text-xs text-admin-text-faint">
            Aprovar dispara a assinatura digital (certificado ICP-Brasil do servidor) e a publicação — não pode ser desfeito.
          </p>

          <div className="flex gap-2">
            <button
              onClick={aprovar}
              disabled={processando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {processando ? 'Processando...' : 'Aprovar e assinar'}
            </button>
            <button
              onClick={() => setMostrarRejeicao(v => !v)}
              disabled={processando}
              className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all disabled:opacity-60"
            >
              Rejeitar
            </button>
          </div>

          {mostrarRejeicao && (
            <div className="space-y-2">
              <textarea
                placeholder="Motivo da rejeição (opcional)"
                value={motivoRejeicao}
                onChange={e => setMotivoRejeicao(e.target.value)}
                rows={2}
                className={classeInput}
              />
              <button
                onClick={rejeitar}
                disabled={processando}
                className="px-4 py-2 rounded-lg bg-admin-error text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
              >
                {processando ? 'Processando...' : 'Confirmar rejeição'}
              </button>
            </div>
          )}

          {erroAcao && <AdminErrorState message={erroAcao} />}
        </div>
      )}

      {podeAgir && solicitacao.status === StatusPublicacaoDiario.FALHOU && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 space-y-3">
          <button
            onClick={retomar}
            disabled={processando}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
          >
            {processando ? 'Processando...' : 'Retomar processamento'}
          </button>
          {erroAcao && <AdminErrorState message={erroAcao} />}
        </div>
      )}

      {podeExcluir(usuario, 'diario-oficial') &&
        (solicitacao.status === StatusPublicacaoDiario.FALHOU || solicitacao.status === StatusPublicacaoDiario.PUBLICADO) && (
        <div className="rounded-2xl border border-admin-border border-l-4 border-l-admin-error bg-admin-surface p-4 space-y-3">
          <p className="text-sm font-semibold text-admin-text">Excluir (admin)</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setConfirmacaoExclusao('fila')}
              disabled={processando}
              className="px-4 py-2 rounded-lg border border-admin-error text-admin-error text-sm font-semibold hover:bg-admin-error-light transition-all disabled:opacity-60"
            >
              Excluir da fila
            </button>
            {solicitacao.status === StatusPublicacaoDiario.PUBLICADO && (
              <button
                onClick={() => setConfirmacaoExclusao('edicao')}
                disabled={processando}
                className="px-4 py-2 rounded-lg bg-admin-error text-white text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-60"
              >
                Excluir edição publicada
              </button>
            )}
          </div>
          <p className="text-xs text-admin-text-faint">
            &quot;Excluir da fila&quot; só remove essa solicitação da lista de processamento.
            &quot;Excluir edição publicada&quot; apaga o PDF e o registro de verdade — não pode ser desfeito.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-admin-text mb-2">Histórico de processamento</h2>
        {logs.length === 0 && <AdminEmptyState message="Nenhum log registrado ainda." />}
        {logs.length > 0 && (
          <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-admin-border text-left">
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Etapa</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Resultado</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Mensagem</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Duração</th>
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                      <td className="p-3.5 text-admin-text">{StatusPublicacaoDiarioDescricao[log.etapa]}</td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            log.sucesso ? 'bg-admin-success-light text-admin-success' : 'bg-admin-error-light text-admin-error'
                          }`}
                        >
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${log.sucesso ? 'bg-admin-success' : 'bg-admin-error'}`} />
                          {log.sucesso ? 'Sucesso' : 'Falha'}
                        </span>
                      </td>
                      <td className="p-3.5 text-admin-text-muted">{log.mensagem ?? '—'}</td>
                      <td className="p-3.5 text-admin-text-muted tabular-nums">{log.duracaoMs}ms</td>
                      <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarDataHora(log.criadoEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        aberto={confirmacaoExclusao !== null}
        titulo={confirmacaoExclusao === 'edicao' ? `Excluir a Edição ${solicitacao.numeroEdicao} publicada?` : 'Excluir da fila?'}
        mensagem={
          confirmacaoExclusao === 'edicao'
            ? 'Isso apaga o PDF e o registro de verdade — diferente de excluir da fila. Essa ação não pode ser desfeita.'
            : 'Essa solicitação será removida da fila de processamento. Essa ação não pode ser desfeita.'
        }
        confirmarLabel="Excluir"
        perigoso
        carregando={processando}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setConfirmacaoExclusao(null)}
      />
    </div>
  )
}
