import { MdFileDownload, MdListAlt } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { TabelaValores, TipoViagemDescricao } from '../types'

interface Props {
  documento: TabelaValores
}

export default function TabelaValoresCard({ documento }: Props) {
  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <MdListAlt size={22} />
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-primary leading-tight">
              {documento.descricao}
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary whitespace-nowrap">
              {TipoViagemDescricao[documento.tipo]}
            </span>
          </div>
          <p className="text-sm text-text-secondary">
            Referência de {formatarData(documento.data)}
          </p>
        </div>
      </div>

      <a
        href={documento.caminhoArquivo}
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
