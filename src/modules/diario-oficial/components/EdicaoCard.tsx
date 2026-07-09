import { MdDescription, MdFileDownload } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { urlDownloadEdicao } from '../diario-oficial.service'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao, TipoEdicaoDiarioStyle } from '../enums'
import { EdicaoDiario } from '../types'

interface Props {
  edicao: EdicaoDiario
}

export default function EdicaoCard({ edicao }: Props) {
  const tipoKey = edicao.tipo as TipoEdicaoDiario
  const tipoLabel = TipoEdicaoDiarioDescricao[tipoKey] ?? edicao.tipo
  const tipoStyle = TipoEdicaoDiarioStyle[tipoKey] ?? 'bg-gray-100 text-gray-600'

  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <MdDescription size={22} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-base font-bold text-primary">
              Edição Nº {edicao.numeroEdicao}
            </h2>
            <Badge className={tipoStyle}>{tipoLabel}</Badge>
          </div>
          <p className="text-sm text-text-secondary">
            Publicado em {formatarData(edicao.dataPublicacao)}
          </p>
        </div>
      </div>

      <a
        href={urlDownloadEdicao(edicao.numeroEdicao)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
      >
        <MdFileDownload size={18} />
        Baixar PDF
      </a>

    </Card>
  )
}
