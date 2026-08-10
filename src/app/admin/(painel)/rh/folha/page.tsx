'use client'

import { FormEvent, useEffect, useState } from 'react'

import { useUrlState } from '@/hooks/useUrlState'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar } from '@/modules/auth/permissoes'
import { servidorService } from '@/modules/admin/rh/servidor.service'
import { folhaService } from '@/modules/admin/rh/folha.service'
import { FolhaPagamento, FolhaPagamentoServidor, Servidor } from '@/modules/admin/rh/types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

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
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4">
        <label className={classeLabel} htmlFor="servidor">Servidor</label>
        <select
          id="servidor"
          value={servidorId}
          onChange={e => setServidorId(e.target.value ? Number(e.target.value) : '')}
          className={`${classeInput} md:w-96`}
        >
          <option value="">Selecione um servidor...</option>
          {servidores.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.cpf}</option>
          ))}
        </select>
      </div>

      {servidorId && podeCriar(usuario, 'rh') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Lançar folha</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={classeLabel} htmlFor="mes">Mês</label>
                <select
                  id="mes"
                  value={novaFolha.mes}
                  onChange={e => setNovaFolha({ ...novaFolha, mes: Number(e.target.value) })}
                  className={classeInput}
                >
                  {MESES.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  required
                  value={novaFolha.ano}
                  onChange={e => setNovaFolha({ ...novaFolha, ano: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="salarioBruto">Salário bruto</label>
                <input
                  id="salarioBruto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={novaFolha.salarioBruto}
                  onChange={e => setNovaFolha({ ...novaFolha, salarioBruto: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="desconto">Desconto</label>
                <input
                  id="desconto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={novaFolha.desconto}
                  onChange={e => setNovaFolha({ ...novaFolha, desconto: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <p className="text-sm text-admin-text-muted">
              Salário líquido calculado: <strong className="text-admin-text">{formatarMoeda(novaFolha.salarioBruto - novaFolha.desconto)}</strong>
            </p>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Lançar folha'}
            </button>
          </form>
        </div>
      )}

      {servidorId && (
        <>
          {loading && (
            <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
          )}
          {erro && <AdminErrorState message={erro} />}
          {!loading && !erro && folhas.length === 0 && <AdminEmptyState message="Nenhuma folha lançada para este servidor." />}

          {!loading && !erro && folhas.length > 0 && (
            <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-admin-border text-left">
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Mês/Ano</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário bruto</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Desconto</th>
                      <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário líquido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {folhas.map(f => (
                      <tr key={f.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                        <td className="p-3.5 font-semibold text-admin-text">{MESES[f.mes - 1]}/{f.ano}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioBruto)}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.desconto)}</td>
                        <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioLiquido)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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
      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className={classeLabel} htmlFor="mes">Mês</label>
          <select
            id="mes"
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className={`${classeInput} w-auto`}
          >
            {MESES.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={classeLabel} htmlFor="ano">Ano</label>
          <input
            id="ano"
            type="number"
            value={ano}
            onChange={e => setAno(Number(e.target.value))}
            className={`${classeInput} w-auto`}
          />
        </div>
        <button
          onClick={buscar}
          className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
        >
          Buscar
        </button>
      </div>

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {buscou && !loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhuma folha encontrada nesse mês." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Servidor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CPF</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário bruto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Desconto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Salário líquido</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(f => (
                  <tr key={f.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{f.nomeServidor}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{f.cpfServidor}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioBruto)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.descontos)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(f.salarioLiquido)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FolhaPagamentoAdminPage() {
  const [aba, setAba] = useUrlState<'servidor' | 'mes'>('categoria', 'servidor')

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">Folha de Pagamento</h1>
      <p className="text-sm text-admin-text-faint">
        Sem edição/exclusão no backend — cada lançamento é definitivo, só é possível consultar e criar novos.
      </p>

      <div className="flex gap-2 border-b border-admin-border">
        <button
          onClick={() => setAba('servidor')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${aba === 'servidor' ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-faint'}`}
        >
          Por servidor
        </button>
        <button
          onClick={() => setAba('mes')}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition ${aba === 'mes' ? 'border-admin-accent text-admin-accent' : 'border-transparent text-admin-text-faint'}`}
        >
          Por mês
        </button>
      </div>

      {aba === 'servidor' ? <AbaPorServidor /> : <AbaPorMes />}
    </div>
  )
}
