'use client'

import Link from 'next/link'
import { MdDescription, MdVerifiedUser } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao, TipoEdicaoDiarioStyle } from '../enums'
import { ResultadoBuscaEdicaoDiario } from '../types'

// O trecho vem do Meilisearch já com <em>...</em> marcando o termo encontrado. Antes de
// injetar no DOM (dangerouslySetInnerHTML), todo o resto do HTML do conteúdo indexado é
// escapado e só a marcação <em> é restaurada — qualquer outra tag vira texto puro.
function snippetSeguro(trecho: string): string {
  return trecho
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;em&gt;/g, '<em>')
    .replace(/&lt;\/em&gt;/g, '</em>')
}

interface Props {
  item: ResultadoBuscaEdicaoDiario
}

export default function BuscaResultadoCard({ item }: Props) {
  const tipoKey = item.tipo as TipoEdicaoDiario
  const tipoLabel = TipoEdicaoDiarioDescricao[tipoKey] ?? item.tipo
  const tipoStyle = TipoEdicaoDiarioStyle[tipoKey] ?? 'bg-gray-100 text-gray-600'

  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4 min-w-0">
        <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
          <MdDescription size={22} />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-bold text-primary">
              Edição Nº {item.numeroEdicao}
            </h3>
            <Badge className={tipoStyle}>{tipoLabel}</Badge>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            Data de Publicação: {formatarData(item.dataPublicacao)}
          </p>

          {/* snippet com o termo em destaque; HTML escapado exceto <em> (ver snippetSeguro) */}
          <p
            className="text-sm text-text-secondary/90 leading-relaxed [&>em]:bg-primary/10 [&>em]:text-primary [&>em]:font-semibold [&>em]:not-italic"
            dangerouslySetInnerHTML={{ __html: snippetSeguro(item.trechoDestaque) }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Link
          href={`/diario/validar/${item.numeroEdicao}`}
          className="flex items-center gap-1.5 text-sm text-text-secondary font-semibold hover:text-primary transition-colors"
        >
          <MdVerifiedUser size={18} />
          Verificar autenticidade
        </Link>
        <Link
          href={hrefDocumento(`/api/edicoes/${item.numeroEdicao}/download`, `Edição Nº ${item.numeroEdicao}`, { origemLabel: 'Diário Oficial', origemHref: '/diario-oficial' })}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
        >
          <MdDescription size={18} />
          Ver edição
        </Link>
      </div>
    </Card>
  )
}
