'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar } from '@/modules/auth/permissoes'
import EmptyState from '@/components/ui/EmptyState'
import { publicacaoService } from '@/modules/admin/diario-oficial/publicacao.service'
import {
  LogEtapaProcessamento,
  SolicitacaoPublicacao,
  StatusPublicacaoDiario,
  StatusPublicacaoDiarioDescricao,
  StatusPublicacaoDiarioStyle
} from '@/modules/admin/diario-oficial/types'

const ESTADOS_EM_PROCESSAMENTO = new Set<StatusPublicacaoDiario>([
  StatusPublicacaoDiario.RECEBIDO,
  StatusPublicacaoDiario.VALIDANDO,
  StatusPublicacaoDiario.MONTANDO_DOCUMENTO_OFICIAL,
  StatusPublicacaoDiario.ASSINANDO
])

function formatarDataHora(data?: string) {
  if (!data) return '—'
  return new Date(data).toLocaleString('pt-BR')
}

export default function PublicacaoDetalheAdminPage() {
  const { usuario } = useAuth()
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

  if (loading) return <Skeleton className="h-64" />
  if (erro) return <ErrorState message={erro} />
  if (!solicitacao) return null

  const podeAgir = podeCriar(usuario, 'diario-oficial')

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/diario-oficial/publicacoes" className="text-sm text-primary hover:underline">
          &larr; Voltar para Publicações
        </Link>
        <div className="flex items-center justify-between mt-1">
          <h1 className="text-lg font-bold text-primary">
            Solicitação nº {solicitacao.id} — Edição {solicitacao.numeroEdicao}
          </h1>
          <Badge className={StatusPublicacaoDiarioStyle[solicitacao.status]}>
            {StatusPublicacaoDiarioDescricao[solicitacao.status]}
          </Badge>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" hoverable={false}>
        <div>
          <p className="text-text-secondary/60 text-xs">Tentativas</p>
          <p className="font-semibold">{solicitacao.tentativas}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Criado em</p>
          <p className="font-semibold">{formatarDataHora(solicitacao.criadoEm)}</p>
        </div>
        <div>
          <p className="text-text-secondary/60 text-xs">Atualizado em</p>
          <p className="font-semibold">{formatarDataHora(solicitacao.atualizadoEm)}</p>
        </div>
        {solicitacao.edicaoDiarioId && (
          <div>
            <p className="text-text-secondary/60 text-xs">Edição publicada</p>
            <a
              href={`/api/edicoes/${solicitacao.numeroEdicao}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Abrir PDF
            </a>
          </div>
        )}
      </Card>

      {solicitacao.status === StatusPublicacaoDiario.FALHOU && (
        <Card className="p-4 border-l-4 border-error" hoverable={false}>
          <p className="text-sm font-semibold text-error">
            Falhou na etapa: {solicitacao.etapaFalha ? StatusPublicacaoDiarioDescricao[solicitacao.etapaFalha] : '—'}
          </p>
          {solicitacao.motivoFalha && <p className="text-sm text-text-secondary/70 mt-1">{solicitacao.motivoFalha}</p>}
        </Card>
      )}

      {ESTADOS_EM_PROCESSAMENTO.has(solicitacao.status) && (
        <Card className="p-4 flex items-center gap-3" hoverable={false}>
          <Skeleton className="h-4 w-4 rounded-full" />
          <p className="text-sm text-text-secondary/70">
            Processando automaticamente — esta página atualiza sozinha a cada poucos segundos.
          </p>
        </Card>
      )}

      {podeAgir && solicitacao.status === StatusPublicacaoDiario.AGUARDANDO_APROVACAO && (
        <Card className="p-4 space-y-3" hoverable={false}>
          <p className="text-sm font-semibold">Documento composto, aguardando revisão humana</p>
          <p className="text-xs text-text-secondary/60">
            Aprovar dispara a assinatura digital (certificado ICP-Brasil do servidor) e a publicação — não pode ser desfeito.
          </p>

          <div className="flex gap-2">
            <button
              onClick={aprovar}
              disabled={processando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {processando ? 'Processando...' : 'Aprovar e assinar'}
            </button>
            <button
              onClick={() => setMostrarRejeicao(v => !v)}
              disabled={processando}
              className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all disabled:opacity-60"
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
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={rejeitar}
                disabled={processando}
                className="px-4 py-2 rounded-lg bg-error text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
              >
                {processando ? 'Processando...' : 'Confirmar rejeição'}
              </button>
            </div>
          )}

          {erroAcao && <ErrorState message={erroAcao} />}
        </Card>
      )}

      {podeAgir && solicitacao.status === StatusPublicacaoDiario.FALHOU && (
        <Card className="p-4 space-y-3" hoverable={false}>
          <button
            onClick={retomar}
            disabled={processando}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
          >
            {processando ? 'Processando...' : 'Retomar processamento'}
          </button>
          {erroAcao && <ErrorState message={erroAcao} />}
        </Card>
      )}

      <div>
        <h2 className="text-sm font-semibold mb-2">Histórico de processamento</h2>
        {logs.length === 0 && <EmptyState message="Nenhum log registrado ainda." />}
        {logs.length > 0 && (
          <Card className="overflow-x-auto" hoverable={false}>
            <table className="w-full text-sm">
              <thead className="bg-neutral-light text-left">
                <tr>
                  <th className="p-3">Etapa</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Mensagem</th>
                  <th className="p-3">Duração</th>
                  <th className="p-3">Quando</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-t border-border/20">
                    <td className="p-3">{StatusPublicacaoDiarioDescricao[log.etapa]}</td>
                    <td className="p-3">
                      <Badge className={log.sucesso ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {log.sucesso ? 'Sucesso' : 'Falha'}
                      </Badge>
                    </td>
                    <td className="p-3 text-text-secondary/70">{log.mensagem ?? '—'}</td>
                    <td className="p-3">{log.duracaoMs}ms</td>
                    <td className="p-3">{formatarDataHora(log.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  )
}
