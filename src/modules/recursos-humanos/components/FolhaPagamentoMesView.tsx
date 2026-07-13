'use client'

import { useState } from 'react'
import { MdGroups, MdPayments } from 'react-icons/md'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { formatarMoeda } from '@/utils/currency'
import { nomeMes } from '@/utils/date'
import { useFolhaPorMes } from '../hooks/useFolhaPorMes'

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 6 }, (_, i) => anoAtual - i)

export default function FolhaPagamentoMesView() {
  const [mes, setMes] = useState(new Date().getMonth() + 1)
  const [ano, setAno] = useState(anoAtual)

  const {
    data: folhas,
    totalRegistros,
    totalFolha,
    loading,
    erro,
    pagina,
    totalPaginas,
    setPagina
  } = useFolhaPorMes(mes, ano)

  const inputClass =
    "w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"

  return (
    <div className="space-y-6">

      {/* FILTROS */}
      <div className="bg-white border border-border/30 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <div>
            <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
              Mês
            </label>
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className={inputClass}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{nomeMes(m)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
              Ano
            </label>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className={inputClass}
            >
              {anos.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : (
        <>
          {folhas.length === 0 && !erro ? (
            <EmptyState message={`Nenhum registro de folha de pagamento para ${nomeMes(mes)}/${ano}.`} />
          ) : (
            <>
              {/* RESUMO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Card hoverable={false} className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <MdGroups size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-text-secondary/50">Servidores na Folha</p>
                    <p className="text-xl font-bold text-primary">{totalRegistros}</p>
                  </div>
                </Card>

                <Card hoverable={false} className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 text-accent">
                    <MdPayments size={22} />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase text-text-secondary/50">Total Líquido no Mês</p>
                    <p className="text-xl font-bold text-accent">{formatarMoeda(totalFolha)}</p>
                  </div>
                </Card>
              </div>

              {/* TABELA */}
              <div className="overflow-x-auto rounded-xl border border-border/30 shadow-sm">
                <table className="w-full text-sm bg-white">
                  <thead>
                    <tr className="bg-neutral-light/60 text-text-secondary/60 text-[11px] uppercase">
                      <th className="text-left px-4 py-3 font-semibold">Servidor</th>
                      <th className="text-left px-4 py-3 font-semibold">CPF</th>
                      <th className="text-right px-4 py-3 font-semibold">Salário Bruto</th>
                      <th className="text-right px-4 py-3 font-semibold">Descontos</th>
                      <th className="text-right px-4 py-3 font-semibold">Salário Líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folhas.map(folha => (
                      <tr key={folha.id} className="border-t border-border/20">
                        <td className="px-4 py-3 font-semibold text-text-secondary">{folha.nomeServidor}</td>
                        <td className="px-4 py-3 text-text-secondary/70">{folha.cpfServidor}</td>
                        <td className="px-4 py-3 text-right text-text-secondary">
                          {formatarMoeda(folha.salarioBruto)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          -{formatarMoeda(folha.descontos)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-accent">
                          {formatarMoeda(folha.salarioLiquido)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINAÇÃO */}
              <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
            </>
          )}
        </>
      )}
    </div>
  )
}
