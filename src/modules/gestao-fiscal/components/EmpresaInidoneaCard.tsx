import { MdFileDownload, MdWarning } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatarData } from '@/utils/date'
import { EmpresaInidonea } from '../types'

interface Props {
  empresa: EmpresaInidonea
}

export default function EmpresaInidoneaCard({ empresa }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-4">

      <div className="flex flex-wrap justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-50 text-red-600">
            <MdWarning size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-primary leading-tight">{empresa.empresa}</h2>
            <p className="text-xs text-text-secondary/60 mt-0.5">CNPJ: {empresa.cnpj}</p>
          </div>
        </div>

        <Badge className="bg-red-100 text-red-700">{empresa.status}</Badge>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{empresa.descricao}</p>

      <div className="flex items-center justify-between pt-3 border-t border-border/20">
        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Data</p>
          <p className="text-sm font-semibold text-text-secondary">{formatarData(empresa.data)}</p>
        </div>

        <a
          href={empresa.caminhoPdf}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdFileDownload size={18} />
          Baixar PDF
        </a>
      </div>

    </Card>
  )
}
