import Link from 'next/link'
import { MdNewReleases, MdVisibility } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import { diarioOficialService, urlDownloadEdicao } from '../diario-oficial.service'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao, TipoEdicaoDiarioStyle } from '../enums'

// Fase 4: Server Component — ver comentário em QuemSomosDiarioOficial.tsx (mesmo motivo/padrão).
// Sempre a edição mais recente publicada, independente de qualquer filtro aplicado na listagem
// abaixo — por isso busca separada, não reaproveita o resultado de EdicoesListView.
export default async function UltimaEdicaoDestaque() {
  const pagina = await diarioOficialService.listarServidor({ page: 0, size: 1, sort: 'dataPublicacao,desc' })
  const edicao = pagina.content[0] ?? null

  if (!edicao) return null

  const tipoKey = edicao.tipo as TipoEdicaoDiario
  const tipoLabel = TipoEdicaoDiarioDescricao[tipoKey] ?? edicao.tipo
  const tipoStyle = TipoEdicaoDiarioStyle[tipoKey] ?? 'bg-gray-100 text-gray-600'

  return (
    <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary text-white shrink-0">
            <MdNewReleases size={24} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wide text-primary/70">
              Última Edição Publicada
            </span>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <h2 className="text-xl font-extrabold text-primary">
                Edição Nº {edicao.numeroEdicao}
              </h2>
              <Badge className={tipoStyle}>{tipoLabel}</Badge>
            </div>

            <p className="text-sm text-text-secondary mt-1">
              Publicado em {formatarData(edicao.dataPublicacao)}
            </p>
          </div>
        </div>

        <Link
          href={hrefDocumento(urlDownloadEdicao(edicao.numeroEdicao), `Edição Nº ${edicao.numeroEdicao}`, { origemLabel: 'Diário Oficial', origemHref: '/diario-oficial' })}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm whitespace-nowrap shrink-0"
        >
          <MdVisibility size={18} />
          Ver edição
        </Link>

      </div>
    </div>
  )
}
