'use client'

import {
  MdAccountBalance,
  MdBadge,
  MdCalendarToday,
  MdFingerprint,
  MdPayments,
  MdSchedule
} from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import InfoBlock from '@/components/ui/InfoBlock'
import Skeleton from '@/components/ui/Skeleton'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, nomeMes } from '@/utils/date'
import { useFolhaServidor } from '../hooks/useFolhaServidor'
import { Servidor } from '../types'

interface Props {
  servidor: Servidor
}

export default function ServidorDetalhe({ servidor }: Props) {
  const { data: folhas, loading, erro } = useFolhaServidor(servidor.id)

  return (
    <div className="bg-light border border-border/30 rounded-2xl shadow-md overflow-hidden mb-10">

      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/20">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-full bg-primary text-white">
            <MdBadge size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">
              {servidor.name}
            </h1>
            <p className="text-sm text-text-secondary font-semibold">{servidor.cargo}</p>
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* GRID INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <InfoBlock label="CPF" value={servidor.cpf} icon={MdFingerprint} />
          <InfoBlock label="Unidade" value={servidor.unidade?.nome} icon={MdAccountBalance} />
          <InfoBlock label="Admissão" value={formatarData(servidor.dataAdmissao)} icon={MdCalendarToday} />
          <InfoBlock label="Carga Horária" value={`${servidor.cargaHoraria}h/semana`} icon={MdSchedule} />
        </div>

        {/* FOLHA DE PAGAMENTO */}
        <div className="pt-6 border-t border-border/20">
          <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
            <MdPayments /> Histórico de Folha de Pagamento
          </h3>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          )}

          {!loading && erro && <ErrorState message={erro} />}

          {!loading && !erro && folhas.length === 0 && (
            <EmptyState message="Nenhum registro de folha de pagamento encontrado." />
          )}

          {!loading && !erro && folhas.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-border/30 shadow-sm">
              <table className="w-full text-sm bg-white">
                <thead>
                  <tr className="bg-neutral-light/60 text-text-secondary/60 text-[11px] uppercase">
                    <th className="text-left px-4 py-3 font-semibold">Referência</th>
                    <th className="text-right px-4 py-3 font-semibold">Salário Bruto</th>
                    <th className="text-right px-4 py-3 font-semibold">Descontos</th>
                    <th className="text-right px-4 py-3 font-semibold">Salário Líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {folhas.map(folha => (
                    <tr key={folha.id} className="border-t border-border/20">
                      <td className="px-4 py-3 font-semibold text-text-secondary">
                        {nomeMes(folha.mes)}/{folha.ano}
                      </td>
                      <td className="px-4 py-3 text-right text-text-secondary">
                        {formatarMoeda(folha.salarioBruto)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -{formatarMoeda(folha.desconto)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-accent">
                        {formatarMoeda(folha.salarioLiquido)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
