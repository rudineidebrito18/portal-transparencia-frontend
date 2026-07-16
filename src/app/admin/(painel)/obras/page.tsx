'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Unidade, Fornecedor } from '@/modules/admin/geral/types'
import { obraService } from '@/modules/admin/obras/obra.service'
import { ObraPublica, ObraRequest, TipoObra, TipoObraDescricao, StatusObra, StatusObraDescricao, StatusObraStyle } from '@/modules/admin/obras/types'

interface FormState {
  id: number | null
  numero: number
  dataInicio: string
  dataPrevistaTermino: string
  dataTermino: string
  valorTotal: number
  tipo: TipoObra
  status: StatusObra
  paralisada: boolean
  unidadeId: number
  fornecedorId: number
  fonte: string
  local: string
  objeto: string
}

const FORM_VAZIO: FormState = {
  id: null,
  numero: 1,
  dataInicio: '',
  dataPrevistaTermino: '',
  dataTermino: '',
  valorTotal: 0,
  tipo: TipoObra.CONSTRUCAO,
  status: StatusObra.EM_ANDAMENTO,
  paralisada: false,
  unidadeId: 0,
  fornecedorId: 0,
  fonte: '',
  local: '',
  objeto: ''
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ObrasAdminPage() {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<ObraPublica[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    obraService
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  useEffect(() => {
    unidadesService.listar().then(setUnidades).catch(() => {})
    fornecedoresService.listar().then(setFornecedores).catch(() => {})
  }, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(o: ObraPublica) {
    setErroForm(null)
    setForm({
      id: o.id,
      numero: o.numero,
      dataInicio: o.dataInicio,
      dataPrevistaTermino: o.dataPrevistaTermino,
      dataTermino: o.dataTermino ?? '',
      valorTotal: o.valorTotal,
      tipo: o.tipo,
      status: o.status,
      paralisada: o.paralisada,
      unidadeId: o.unidadeId,
      fornecedorId: o.fornecedorId,
      fonte: o.fonte,
      local: o.local,
      objeto: o.objeto
    })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta obra? Essa ação não pode ser desfeita.')) return

    try {
      await obraService.excluir(id)
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

    const dados: ObraRequest = {
      numero: form.numero,
      dataInicio: form.dataInicio,
      dataPrevistaTermino: form.dataPrevistaTermino,
      dataTermino: form.dataTermino || undefined,
      valorTotal: form.valorTotal,
      tipo: form.tipo,
      status: form.status,
      paralisada: form.paralisada,
      unidadeId: form.unidadeId,
      fornecedorId: form.fornecedorId,
      fonte: form.fonte,
      local: form.local,
      objeto: form.objeto
    }

    try {
      if (form.id) {
        await obraService.atualizar(form.id, dados)
      } else {
        await obraService.criar(dados)
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
        <h1 className="text-lg font-bold text-primary">Obras Públicas</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova obra
          </button>
        )}
      </div>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar obra' : 'Nova obra'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Local</label>
                <input
                  required
                  value={form.local}
                  onChange={e => setForm({ ...form, local: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objeto</label>
              <textarea
                required
                value={form.objeto}
                onChange={e => setForm({ ...form, objeto: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Unidade responsável</label>
                <select
                  required
                  value={form.unidadeId || ''}
                  onChange={e => setForm({ ...form, unidadeId: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor responsável</label>
                <select
                  required
                  value={form.fornecedorId || ''}
                  onChange={e => setForm({ ...form, fornecedorId: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Selecione...</option>
                  {fornecedores.map(f => (
                    <option key={f.id} value={f.id}>{f.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoObra })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(TipoObra).map(t => (
                    <option key={t} value={t}>{TipoObraDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as StatusObra })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(StatusObra).map(s => (
                    <option key={s} value={s}>{StatusObraDescricao[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de início</label>
                <input
                  type="date"
                  required
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Previsão de término</label>
                <input
                  type="date"
                  required
                  value={form.dataPrevistaTermino}
                  onChange={e => setForm({ ...form, dataPrevistaTermino: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Término real (opcional)</label>
                <input
                  type="date"
                  value={form.dataTermino}
                  onChange={e => setForm({ ...form, dataTermino: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Fonte de recursos</label>
                <input
                  required
                  value={form.fonte}
                  onChange={e => setForm({ ...form, fonte: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor total</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorTotal}
                  onChange={e => setForm({ ...form, valorTotal: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.paralisada}
                onChange={e => setForm({ ...form, paralisada: e.target.checked })}
              />
              Obra paralisada
            </label>

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
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhuma obra encontrada." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nº</th>
                <th className="p-3">Objeto / Local</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Status</th>
                <th className="p-3">Valor total</th>
                <th className="p-3">% físico</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(o => (
                <tr key={o.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{o.numero}</td>
                  <td className="p-3">
                    <p>{o.objeto}</p>
                    <p className="text-xs text-text-secondary/60">{o.local}</p>
                  </td>
                  <td className="p-3">{TipoObraDescricao[o.tipo]}</td>
                  <td className="p-3">
                    <Badge className={StatusObraStyle[o.status]}>{StatusObraDescricao[o.status]}</Badge>
                    {o.paralisada && <Badge className="bg-error/10 text-error ml-1">Paralisada</Badge>}
                  </td>
                  <td className="p-3">{formatarMoeda(o.valorTotal)}</td>
                  <td className="p-3">{o.percentualObra?.toFixed(1) ?? 0}%</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/admin/obras/${o.id}`} className="text-primary hover:underline">
                      Detalhes
                    </Link>
                    {podeEditar(usuario, 'obras-repasses') && (
                      <button onClick={() => abrirEdicao(o)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'obras-repasses') && (
                      <button onClick={() => excluir(o.id)} className="text-error hover:underline">
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
