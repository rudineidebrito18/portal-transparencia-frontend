'use client'

import { MdCheckCircle, MdHourglassEmpty } from 'react-icons/md'

import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAsyncData } from '@/hooks/useAsyncData'
import { esicService } from '../esic.service'
import { FormularioEsicPublico, LABELS_STATUS_ESIC } from '../types'
import { formatarDataHora } from '@/utils/date'
import DeclaracaoSolicitacoesEsicListView from './DeclaracaoSolicitacoesEsicListView'

export default function SolicitacoesPublicasTab() {
  const { data: pagina, loading, erro } = useAsyncData(
    () => esicService.listarPublicas({ size: 50 }),
    [],
    null as Awaited<ReturnType<typeof esicService.listarPublicas>> | null
  )
  const solicitacoes: FormularioEsicPublico[] = pagina?.content ?? []

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary/60 mb-4">
          Declaração de Solicitações
        </h2>
        <DeclaracaoSolicitacoesEsicListView />
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary/60 mb-4">
          Solicitações respondidas (LAI)
        </h2>

        {loading && (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        )}

        {!loading && erro && <ErrorState message={erro} />}

        {!loading && !erro && solicitacoes.length === 0 && (
          <p className="text-sm text-text-secondary/70">Nenhuma solicitação pública registrada até o momento.</p>
        )}

        {!loading && !erro && (
          <div className="space-y-4">
            {solicitacoes.map(s => (
              <Card key={s.protocolo} hoverable={false} className="p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono text-text-muted">{s.protocolo}</span>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-neutral-light text-text-secondary">{formatarDataHora(s.criadoEm)}</Badge>
                    <Badge className={s.status === 'RESPONDIDA' ? 'bg-primary/10 text-primary' : 'bg-neutral-light text-text-secondary'}>
                      {s.status === 'RESPONDIDA' ? <MdCheckCircle size={14} /> : <MdHourglassEmpty size={14} />}
                      {LABELS_STATUS_ESIC[s.status]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase mb-1">Solicitação</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{s.solicitacao}</p>
                </div>

                {s.resposta && (
                  <div className="border-t border-border/20 pt-3">
                    <p className="text-xs font-semibold text-text-muted uppercase mb-1">Resposta</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{s.resposta}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
