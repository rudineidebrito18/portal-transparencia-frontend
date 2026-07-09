'use client'

import { MdAccessTime, MdBusiness } from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
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
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (erro) {
    return <ErrorState message={erro} />
  }

  if (contratos.length === 0) {
    return <EmptyState message="Nenhum contrato associado encontrado." />
  }

  return (
    <div className="space-y-4">

      {contratos.map((contrato) => (

        <Card key={contrato.id}>

          {/* HEADER */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border/20 bg-neutral-light/40 rounded-t-xl">
            <h4 className="text-sm font-bold text-primary">
              Contrato {contrato.numeroContrato}/{contrato.exercicio}
            </h4>

            <Badge className="bg-green-100 text-green-700">
              {contrato.status.replace('_', ' ')}
            </Badge>
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
        </Card>

      ))}

      {/* PAGINAÇÃO */}
      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

    </div>
  )
}
