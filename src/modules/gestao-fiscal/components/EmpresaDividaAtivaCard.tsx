import Link from 'next/link'
import { MdBusiness, MdVisibility } from 'react-icons/md'

import Card from '@/components/ui/Card'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import { gestaoFiscalService } from '../gestaoFiscal.service'
import { EmpresaDividaAtiva } from '../types'

interface Props {
  empresa: EmpresaDividaAtiva
}

export default function EmpresaDividaAtivaCard({ empresa }: Props) {
  return (
    <Card className="p-4 flex flex-col gap-2.5">

      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <MdBusiness size={20} />
        </div>

        <div>
          <h2 className="text-base font-bold text-primary leading-tight">Nome: {empresa.nome}</h2>
          <p className="text-xs text-text-muted mt-0.5">Razão Social: {empresa.razaoSocial}</p>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-snug">
        <span className="font-semibold text-text-muted">Descrição: </span>
        {empresa.descricao}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-sm">
        <div>
          <p className="text-xs uppercase text-text-muted">CNPJ</p>
          <p className="font-semibold text-text-secondary">{empresa.cnpj}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Data</p>
          <p className="font-semibold text-text-secondary">{formatarData(empresa.data)}</p>
        </div>

        <div>
          <p className="text-xs uppercase text-text-muted">Valor Inscrito</p>
          <p className="font-bold text-accent">{formatarMoeda(empresa.valor)}</p>
        </div>
      </div>

      <div className="flex items-center justify-end pt-2 border-t border-border/20">
        <Link
          href={hrefDocumento(gestaoFiscalService.urlArquivoEmpresaDividaAtiva(empresa.id), empresa.nome, { origemLabel: 'Empresas em Dívida Ativa', origemHref: '/divida-ativa' })}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
        >
          <MdVisibility size={18} />
          Ver documento
        </Link>
      </div>

    </Card>
  )
}
