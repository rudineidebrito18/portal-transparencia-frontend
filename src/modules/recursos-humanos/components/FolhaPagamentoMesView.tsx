'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MdGroups, MdPayments, MdRestartAlt } from 'react-icons/md'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import FiltroCard from '@/components/ui/FiltroCard'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { formatarMoeda } from '@/utils/currency'
import { nomeMes } from '@/utils/date'
import { useFolhaPorMes } from '../hooks/useFolhaPorMes'

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 6 }, (_, i) => anoAtual - i)
const mesAtual = new Date().getMonth() + 1

export default function FolhaPagamentoMesView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const mes = Number(searchParams.get('mes') ?? mesAtual)
  const ano = Number(searchParams.get('ano') ?? anoAtual)
  const pagina = Number(searchParams.get('page') ?? 0)

  function atualizarUrl(alteracoes: Record<string, string | number | undefined>) {
    const novosParams = new URLSearchParams(searchParams.toString())

    for (const [chave, valor] of Object.entries(alteracoes)) {
      if (valor === undefined) {
        novosParams.delete(chave)
      } else {
        novosParams.set(chave, String(valor))
      }
    }

    const query = novosParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const {
    data: folhas,
    totalRegistros,
    totalFolha,
    loading,
    erro,
    totalPaginas
  } = useFolhaPorMes(mes, ano, pagina)

  const filtrosAtivosCount = mes !== mesAtual || ano !== anoAtual ? 1 : 0

  return (
    <div className="space-y-6">

      {/* FILTROS */}
      <FiltroCard subtituloPadrao={`Exibindo ${nomeMes(mesAtual)} de ${anoAtual}`} filtrosAtivosCount={filtrosAtivosCount}>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

          <div>
            <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="mes">
              Mês
            </label>
            <Select
              id="mes"
              value={mes}
              onChange={(e) => atualizarUrl({ mes: Number(e.target.value), page: undefined })}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{nomeMes(m)}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="ano">
              Ano
            </label>
            <Select
              id="ano"
              value={ano}
              onChange={(e) => atualizarUrl({ ano: Number(e.target.value), page: undefined })}
            >
              {anos.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </Select>
          </div>

        </div>

        <div className="flex items-center justify-end mt-6 pt-4 border-t border-border/20">
          <Button onClick={() => atualizarUrl({ mes: undefined, ano: undefined, page: undefined })} variant="ghost">
            <MdRestartAlt />
            Voltar pro mês atual
          </Button>
        </div>

      </FiltroCard>

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
                    <p className="text-xs uppercase text-text-muted">Servidores na Folha</p>
                    <p className="text-xl font-bold text-primary">{totalRegistros}</p>
                  </div>
                </Card>

                <Card hoverable={false} className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent/10 text-accent">
                    <MdPayments size={22} />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-text-muted">Total Líquido no Mês</p>
                    <p className="text-xl font-bold text-accent">{formatarMoeda(totalFolha)}</p>
                  </div>
                </Card>
              </div>

              {/* TABELA */}
              <div className="overflow-x-auto rounded-xl border border-border/30 shadow-sm">
                <table className="w-full text-sm bg-white">
                  <thead>
                    <tr className="bg-neutral-light/60 text-text-muted text-xs uppercase">
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
                        <td className="px-4 py-3 text-right text-error">
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
              <Pagination
                pagina={pagina}
                totalPaginas={totalPaginas}
                onChange={(novaPagina) => atualizarUrl({ page: novaPagina || undefined })}
              />
            </>
          )}
        </>
      )}
    </div>
  )
}
