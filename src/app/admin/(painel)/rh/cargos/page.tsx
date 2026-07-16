'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { cargoService } from '@/modules/admin/rh/cargo.service'
import { Cargo, CargoRequest } from '@/modules/admin/rh/types'

interface FormState {
  id: number | null
  cargo: string
  quantidade: number
  valorBruto: number
  valorDesconto: number
}

const FORM_VAZIO: FormState = { id: null, cargo: '', quantidade: 1, valorBruto: 0, valorDesconto: 0 }

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CargosAdminPage() {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Cargo[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    cargoService
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(c: Cargo) {
    setErroForm(null)
    setForm({ id: c.id, cargo: c.cargo, quantidade: c.quantidade, valorBruto: c.valorBruto, valorDesconto: c.valorDesconto })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este cargo? Essa ação não pode ser desfeita.')) return

    try {
      await cargoService.excluir(id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const dados: CargoRequest = {
      cargo: form.cargo,
      quantidade: form.quantidade,
      valorBruto: form.valorBruto,
      valorDesconto: form.valorDesconto
    }

    try {
      if (form.id) {
        await cargoService.atualizar(form.id, dados)
      } else {
        await cargoService.criar(dados)
      }

      setForm(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Tabela de Cargos</h1>

        {podeCriar(usuario, 'rh') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo cargo
          </button>
        )}
      </div>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar cargo' : 'Novo cargo'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Cargo</label>
              <input
                required
                value={form.cargo}
                onChange={e => setForm({ ...form, cargo: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor bruto</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorBruto}
                  onChange={e => setForm({ ...form, valorBruto: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor de desconto</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorDesconto}
                  onChange={e => setForm({ ...form, valorDesconto: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum cargo encontrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Cargo</th>
                <th className="p-3">Quantidade</th>
                <th className="p-3">Valor bruto</th>
                <th className="p-3">Desconto</th>
                <th className="p-3">Valor líquido</th>
                <th className="p-3">Média</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(c => (
                <tr key={c.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{c.cargo}</td>
                  <td className="p-3">{c.quantidade}</td>
                  <td className="p-3">{formatarMoeda(c.valorBruto)}</td>
                  <td className="p-3">{formatarMoeda(c.valorDesconto)}</td>
                  <td className="p-3">{formatarMoeda(c.valorLiquido)}</td>
                  <td className="p-3">{formatarMoeda(c.media)}</td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'rh') && (
                      <button onClick={() => abrirEdicao(c)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'rh') && (
                      <button onClick={() => excluir(c.id)} className="text-error hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
