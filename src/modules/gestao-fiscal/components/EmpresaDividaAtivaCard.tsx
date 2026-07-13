import { MdBusiness, MdFileDownload } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { EmpresaDividaAtiva } from '../types'

interface Props {
  empresa: EmpresaDividaAtiva
}

export default function EmpresaDividaAtivaCard({ empresa }: Props) {
  return (
    <Card className="p-5 flex flex-col gap-4">

      <div className="flex justify-between items-start gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <MdBusiness size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-primary leading-tight">{empresa.nome}</h2>
            <p className="text-xs text-text-secondary/60 mt-0.5">{empresa.razaoSocial}</p>
          </div>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{empresa.descricao}</p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">CNPJ</p>
          <p className="font-semibold text-text-secondary">{empresa.cnpj}</p>
        </div>

        <div>
          <p className="text-[11px] uppercase text-text-secondary/50">Data</p>
          <p className="font-semibold text-text-secondary">{formatarData(empresa.data)}</p>
        </div>

        <div className="col-span-2">
          <p className="text-[11px] uppercase text-text-secondary/50">Valor Inscrito</p>
          <p className="font-bold text-accent">{formatarMoeda(empresa.valor)}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-3 border-t border-border/20">
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
