import { MdGroup, MdPerson } from 'react-icons/md'

import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { conselhoMunicipalService } from '@/modules/conselho-municipal/conselhoMunicipal.service'
import { MembroConselho, TipoConselho, TitularOuSuplente, TitularOuSuplenteDescricao } from '@/modules/conselho-municipal/types'
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

interface Props {
  tipo: TipoConselho
  titulo: string
}

// Componente compartilhado pelos 3 conselhos (Saúde, Educação, Assistência Social) —
// mesmo formato de dados no backend, só o tipo muda. Cada um continua com sua própria
// rota/página (não aparecem juntos em lugar nenhum), só a implementação é reaproveitada.
export default async function ConselhoMunicipalView({ tipo, titulo }: Props) {
  const conselhos = await conselhoMunicipalService.listar(tipo).catch(() => [])

  return (
    <div className="max-w-5xl mx-auto p-2 space-y-8">
      <PageHeader title={titulo} breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: titulo }
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
