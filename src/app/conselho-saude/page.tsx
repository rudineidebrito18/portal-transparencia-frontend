import { MdGroup, MdPerson } from 'react-icons/md'

import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { conselhoSaudeService } from '@/modules/conselho-saude/conselhoSaude.service'
import { MembroConselho, TitularOuSuplente, TitularOuSuplenteDescricao } from '@/modules/conselho-saude/types'
import { formatarData } from '@/utils/date'

function MandatoTexto({ inicio, fim }: { inicio: string | null; fim: string | null }) {
  if (!inicio && !fim) return null
  return (
    <p className="text-sm text-text-secondary">
      <strong>Mandato:</strong> {inicio ? formatarData(inicio) : '—'} a {fim ? formatarData(fim) : '—'}
    </p>
  )
}

function MembroItem({ membro }: { membro: MembroConselho }) {
  const titular = membro.titularOuSuplente === TitularOuSuplente.TITULAR
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/30 bg-white px-4 py-3">
      <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary shrink-0">
        <MdPerson size={18} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-secondary truncate">{membro.nome}</p>
        {(membro.segmento || membro.funcao) && (
          <p className="text-xs text-text-secondary truncate">
            {[membro.segmento, membro.funcao].filter(Boolean).join(' — ')}
          </p>
        )}
      </div>
      <Badge className={titular ? 'bg-primary/10 text-primary' : 'bg-neutral-light text-text-secondary'}>
        {TitularOuSuplenteDescricao[membro.titularOuSuplente]}
      </Badge>
    </div>
  )
}

export default async function ConselhoSaude() {
  const conselhos = await conselhoSaudeService.listar().catch(() => [])

  return (
    <div className="max-w-5xl mx-auto p-2 space-y-8">
      <PageHeader title="Conselho Municipal de Saúde" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Conselho Municipal de Saúde' }
        ]} />

      {conselhos.length === 0 && (
        <p className="text-sm text-text-secondary/70">Nenhuma composição do Conselho cadastrada até o momento.</p>
      )}

      {conselhos.map(conselho => (
        <Card key={conselho.id} hoverable={false} className="p-6 space-y-4">
          {conselho.descricao && (
            <p className="text-sm text-text-secondary leading-relaxed">{conselho.descricao}</p>
          )}
          <MandatoTexto inicio={conselho.mandatoInicio} fim={conselho.mandatoFim} />

          {conselho.membros.length > 0 ? (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-text-secondary/50">
                <MdGroup size={16} />
                Membros ({conselho.membros.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conselho.membros.map(membro => (
                  <MembroItem key={membro.id} membro={membro} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-secondary/50">Nenhum membro cadastrado para esta composição.</p>
          )}
        </Card>
      ))}
    </div>
  )
}
