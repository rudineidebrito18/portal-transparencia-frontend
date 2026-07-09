'use client'

import { MdAccessTime, MdBusiness } from 'react-icons/md'

import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { useContratosDaLicitacao } from '../hooks/useContratosDaLicitacao'

interface Props {
  licitacaoId: number
}

export default function LicitacaoContratos({ licitacaoId }: Props) {
  const {
    data: contratos,
    loading,
    erro,
    pagina,
    totalPaginas,
    setPagina
  } = useContratosDaLicitacao(licitacaoId)

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-32 bg-neutral-light animate-pulse rounded-xl border border-border/30" />
        ))}
      </div>
    )
  }

  if (erro) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl">
        {erro}
      </div>
    )
  }

  if (contratos.length === 0) {
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

            <span className="text-[11px] px-3 py-1 rounded-full font-semibold uppercase tracking-wide bg-green-100 text-green-700">
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

            {/* VALOR */}
            <div>
              <p className="text-[11px] uppercase font-semibold text-text-secondary/50 tracking-wide">
                Valor Total
              </p>
              <p className="text-base font-bold text-accent">
                {formatarMoeda(contrato.valorContrato)}
              </p>
            </div>

          </div>
        </div>

      ))}

      {/* PAGINAÇÃO */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <button
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina === 0}
            className="px-3 py-2 rounded-lg border border-border/30 text-sm font-medium hover:bg-neutral-light disabled:opacity-40 transition"
          >
            Anterior
          </button>

          <span className="text-sm text-text-secondary">
            Página <strong>{pagina + 1}</strong> de <strong>{totalPaginas}</strong>
          </span>

          <button
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina + 1 >= totalPaginas}
            className="px-3 py-2 rounded-lg border border-border/30 text-sm font-medium hover:bg-neutral-light disabled:opacity-40 transition"
          >
            Próxima
          </button>
        </div>
      )}

    </div>
  )
}
