'use client'

import { ContratoLicitacao } from '@/interfaces/licitacao/ContratoLicitacao'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import Link from 'next/link'
import { MdAccessTime, MdBusiness, MdVisibility } from 'react-icons/md'

interface Props {
  contratos?: ContratoLicitacao[]
}

export default function LicitacaoContratos({ contratos }: Props) {

  if (!contratos || contratos.length === 0) {
    return (
      <div className="bg-white border border-border/30 rounded-xl p-8 text-center shadow-sm">
        <p className="text-sm text-text-secondary">
          Nenhum contrato associado encontrado.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {contratos.map((contrato) => (

        <div
          key={contrato.id}
          className="bg-white border border-border/30 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
        >

          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-neutral-light/40 rounded-t-xl">
            <h4 className="text-sm font-bold text-primary">
              Contrato {contrato.numeroContrato}/{contrato.exercicio}
            </h4>

            <span className="text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide
              bg-green-100 text-green-700">
              {contrato.status.replace('_', ' ')}
            </span>
          </div>

          {/* BODY */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* FORNECEDOR */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MdBusiness size={18} />
              </div>

              <div className="overflow-hidden">
                <p className="text-[11px] uppercase font-semibold text-text-secondary/50 tracking-wide">
                  Fornecedor
                </p>
                <p className="text-sm font-semibold text-text-secondary truncate">
                  {contrato.fornecedor}
                </p>
              </div>
            </div>

            {/* VIGÊNCIA */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MdAccessTime size={18} />
              </div>

              <div>
                <p className="text-[11px] uppercase font-semibold text-text-secondary/50 tracking-wide">
                  Vigência Final
                </p>
                <p className="text-sm font-semibold text-text-secondary">
                  {formatarData(contrato.dataTermino)}
                </p>
              </div>
            </div>

            {/* VALOR + AÇÃO */}
            <div className="flex items-center justify-between gap-4">

              <div>
                <p className="text-[11px] uppercase font-semibold text-text-secondary/50 tracking-wide">
                  Valor Total
                </p>
                <p className="text-base font-bold text-accent">
                  {formatarMoeda(contrato.valorContrato)}
                </p>
              </div>

              <Link
                href={`/contratos/${contrato.id}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all"
              >
                <MdVisibility size={18} />
                Ver
              </Link>

            </div>

          </div>
        </div>

      ))}

    </div>
  )
}