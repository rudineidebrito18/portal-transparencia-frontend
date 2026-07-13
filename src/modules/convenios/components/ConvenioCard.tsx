import { MdDateRange, MdDescription, MdFileDownload } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { ConvenioDocumento } from '../types'

interface Props {
  documento: ConvenioDocumento
}

export default function ConvenioCard({ documento }: Props) {
  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10 text-primary">
          <MdDescription size={22} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">
            {documento.descricao}
          </h2>
          <p className="text-sm text-text-secondary flex items-center gap-1 mt-0.5">
            <MdDateRange size={14} />
            Vigência: {formatarData(documento.dataInicio)} a {formatarData(documento.dataFim)}
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
