'use client'

import { ContratoLicitacao } from '@/interfaces/licitacao/ContratoLicitacao';
import { formatarMoeda } from '@/utils/currency';
import { formatarData } from '@/utils/date';
import Link from 'next/link';
import { MdAccessTime, MdBusiness, MdVisibility } from 'react-icons/md';

interface Props {
  contratos?: ContratoLicitacao[]
}

export default function LicitacaoContratos({ contratos }: Props) {
  if (!contratos || contratos.length === 0) {
    return (
      <div className="text-center py-12 bg-neutral-light rounded-lg border-2 border-dashed border-border/50">
        <p className="text-text-secondary font-medium">Nenhum contrato associado encontrado.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contratos.map((contrato) => (
        <div key={contrato.id} className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          
          <div className="bg-neutral-light/50 px-6 py-3 border-b border-border flex justify-between items-center">
            <h4 className="text-primary font-bold">Contrato {contrato.numeroContrato}/{contrato.exercicio}</h4>
            <span className="text-[10px] bg-success-light text-success font-bold px-2 py-1 rounded uppercase">
              {contrato.status.replace('_', ' ')}
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <MdBusiness className="text-secondary" size={20} />
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-text-secondary/50">Fornecedor</p>
                <p className="text-xs font-bold text-text-secondary truncate uppercase">{contrato.fornecedor}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MdAccessTime className="text-primary" size={20} />
              <div>
                <p className="text-[10px] uppercase font-bold text-text-secondary/50">Vigência Final</p>
                <p className="text-xs font-bold text-text-secondary">{formatarData(contrato.dataTermino)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-text-secondary/50">Valor Total</p>
                <p className="text-sm font-bold text-accent">{formatarMoeda(contrato.valorContrato)}</p>
              </div>
              
              <Link 
                href={`/contratos/${contrato.id}`}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-text-primary px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-md"
              >
                <MdVisibility size={16} />
                DETALHAR
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}