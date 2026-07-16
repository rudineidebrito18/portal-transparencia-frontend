'use client'

import { FormEvent, useEffect, useState } from 'react'

import { useUrlState } from '@/hooks/useUrlState'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar } from '@/modules/auth/permissoes'
import { servidorService } from '@/modules/admin/rh/servidor.service'
import { folhaService } from '@/modules/admin/rh/folha.service'
import { FolhaPagamento, FolhaPagamentoServidor, Servidor } from '@/modules/admin/rh/types'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

function AbaPorServidor() {
  const { usuario } = useAuth()

  const [servidores, setServidores] = useState<Servidor[]>([])
  useEffect(() => {
    servidorService.listar({ size: 200, sort: 'name,asc' }).then(p => setServidores(p.content)).catch(() => {})
  }, [])

  const [servidorId, setServidorId] = useState<number | ''>('')
  const [folhas, setFolhas] = useState<FolhaPagamento[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function carregarFolhas(id: number) {
    setLoading(true)
    setErro(null)
    folhaService
      .listarPorServidor(id)
      .then(setFolhas)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (servidorId) carregarFolhas(servidorId)
    else setFolhas([])
  }, [servidorId])

  const hoje = new Date()
  const [novaFolha, setNovaFolha] = useState({ mes: hoje.getMonth() + 1, ano: hoje.getFullYear(), salarioBruto: 0, desconto: 0 })
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!servidorId) return

    setSalvando(true)
    setErroForm(null)

    try {
      await folhaService.criar(servidorId, {
        mes: novaFolha.mes,
        ano: novaFolha.ano,
        salarioBruto: novaFolha.salarioBruto,
        desconto: novaFolha.desconto,
        salarioLiquido: novaFolha.salarioBruto - novaFolha.desconto
      })
      carregarFolhas(servidorId)
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-4" hoverable={false}>
        <label className="block text-sm font-medium mb-1">Servidor</label>
        <select
          value={servidorId}
          onChange={e => setServidorId(e.target.value ? Number(e.target.value) : '')}
          className="w-full md:w-96 border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Selecione um servidor...</option>
          {servidores.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.cpf}</option>
          ))}
        </select>
      </Card>

      {servidorId && podeCriar(usuario, 'rh') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Lançar folha</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Mês</label>
                <select
                  value={novaFolha.mes}
                  onChange={e => setNovaFolha({ ...novaFolha, mes: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ano</label>
                <input
                  type="number"
                  required
                  value={novaFolha.ano}
                  onChange={e => setNovaFolha({ ...novaFolha, ano: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salário bruto</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={novaFolha.salarioBruto}
                  onChange={e => setNovaFolha({ ...novaFolha, salarioBruto: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Desconto</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={novaFolha.desconto}
                  onChange={e => setNovaFolha({ ...novaFolha, desconto: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <p className="text-sm text-text-secondary/70">
              Salário líquido calculado: <strong>{formatarMoeda(novaFolha.salarioBruto - novaFolha.desconto)}</strong>
            </p>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Lançar folha'}
            </button>
          </form>
        </Card>
      )}

      {servidorId && (
        <>
          {loading && <Skeleton className="h-40" />}
          {erro && <ErrorState message={erro} />}
          {!loading && !erro && folhas.length === 0 && <EmptyState message="Nenhuma folha lançada para este servidor." />}

          {!loading && !erro && folhas.length > 0 && (
            <Card className="overflow-x-auto" hoverable={false}>
              <table className="w-full text-sm">
                <thead className="bg-neutral-light text-left">
                  <tr>
                    <th className="p-3">Mês/Ano</th>
                    <th className="p-3">Salário bruto</th>
                    <th className="p-3">Desconto</th>
                    <th className="p-3">Salário líquido</th>
                  </tr>
                </thead>
                <tbody>
                  {folhas.map(f => (
                    <tr key={f.id} className="border-t border-border/20">
                      <td className="p-3 font-semibold">{MESES[f.mes - 1]}/{f.ano}</td>
                      <td className="p-3">{formatarMoeda(f.salarioBruto)}</td>
                      <td className="p-3">{formatarMoeda(f.desconto)}</td>
                      <td className="p-3">{formatarMoeda(f.salarioLiquido)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function AbaPorMes() {
  const hoje = new Date()
  const [mes, setMes] = useState(hoje.getMonth() + 1)
  const [ano, setAno] = useState(hoje.getFullYear())
  const [lista, setLista] = useState<FolhaPagamentoServidor[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [buscou, setBuscou] = useState(false)

  function buscar() {
    setLoading(true)
    setErro(null)
    setBuscou(true)
    folhaService
      .listarPorMes(mes, ano)
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 flex flex-wrap items-end gap-3" hoverable={false}>
        <div>
          <label className="block text-sm font-medium mb-1">Mês</label>
          <select
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ano</label>
          <input
            type="number"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={buscar}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
        >
          Buscar
        </button>
      </Card>

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {buscou && !loading && !erro && lista.length === 0 && <EmptyState message="Nenhuma folha encontrada nesse mês." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Servidor</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Salário bruto</th>
                <th className="p-3">Desconto</th>
                <th className="p-3">Salário líquido</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(f => (
                <tr key={f.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{f.nomeServidor}</td>
                  <td className="p-3">{f.cpfServidor}</td>
                  <td className="p-3">{formatarMoeda(f.salarioBruto)}</td>
                  <td className="p-3">{formatarMoeda(f.descontos)}</td>
                  <td className="p-3">{formatarMoeda(f.salarioLiquido)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

export default function FolhaPagamentoAdminPage() {
  const [aba, setAba] = useUrlState<'servidor' | 'mes'>('categoria', 'servidor')

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">Folha de Pagamento</h1>
      <p className="text-sm text-text-secondary/70">
        Sem edição/exclusão no backend — cada lançamento é definitivo, só é possível consultar e criar novos.
      </p>

      <div className="flex gap-2 border-b border-border/20">
        <button
          onClick={() => setAba('servidor')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${aba === 'servidor' ? 'border-primary text-primary' : 'border-transparent text-text-secondary/60'}`}
        >
          Por servidor
        </button>
        <button
          onClick={() => setAba('mes')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${aba === 'mes' ? 'border-primary text-primary' : 'border-transparent text-text-secondary/60'}`}
        >
          Por mês
        </button>
      </div>

      {aba === 'servidor' ? <AbaPorServidor /> : <AbaPorMes />}
    </div>
  )
}
