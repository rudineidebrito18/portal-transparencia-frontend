import Link from 'next/link'
import { MdAssignment, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import { Aditivo } from '../types'

interface Props {
  aditivo: Aditivo
}

export default function AditivoGlobalCard({ aditivo }: Props) {
  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <MdAssignment size={22} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            {aditivo.objeto}
          </h2>
          <p className="text-sm text-text-secondary">
            {aditivo.fornecedorNome ?? 'Fornecedor não informado'} · Assinado em {formatarData(aditivo.dataAssinatura)}
          </p>
          <Link
            href={`/contratos/${aditivo.contratoLicitacaoId}`}
            className="text-xs text-primary hover:underline"
          >
            Ver contrato
          </Link>
        </div>
      </div>

      <Link
        href={hrefDocumento(aditivo.caminhoPdf, aditivo.objeto, { origemLabel: 'Aditivos de Contratos', origemHref: '/aditivos-contratos' })}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
      >
        <MdVisibility size={18} />
        Ver documento
      </Link>

    </Card>
  )
}
