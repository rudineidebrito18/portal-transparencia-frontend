'use client'

import { FormEvent, useCallback, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { diariaService } from '@/modules/admin/rh/diaria.service'
import { Diaria, DiariaRequest, FiltroDiaria } from '@/modules/admin/rh/types'

interface FormState {
  id: number | null
  dataInicio: string
  dataTermino: string
  beneficiario: string
  cargo: string
  destino: string
  motivo: string
  quantDiarias: number
  valorConcedido: number
}

const FORM_VAZIO: FormState = {
  id: null,
  dataInicio: '',
  dataTermino: '',
  beneficiario: '',
  cargo: '',
  destino: '',
  motivo: '',
  quantDiarias: 1,
  valorConcedido: 0
}

export default function DiariasAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroDiaria & { page?: number; size?: number; sort?: string }) => diariaService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Diaria,
    FiltroDiaria
  >({ fetchFunction, initialSort: 'dataInicio,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(d: Diaria) {
    setErroForm(null)
    setForm({ ...d })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta diária? Essa ação não pode ser desfeita.')) return

    try {
      await diariaService.excluir(id)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    setSalvando(true)
    setErroForm(null)

    const { id, ...dados } = form
    const request: DiariaRequest = dados

    try {
      if (id) {
        await diariaService.atualizar(id, request)
      } else {
        await diariaService.criar(request)
      }

      setForm(null)
      recarregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Diárias</h1>

        {podeCriar(usuario, 'rh') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova diária
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <input
          placeholder="Beneficiário..."
          defaultValue={filtros.beneficiario ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, beneficiario: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Cargo..."
          defaultValue={filtros.cargo ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cargo: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Destino..."
          defaultValue={filtros.destino ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, destino: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">Início:</span>
          <input
            type="date"
            value={filtros.dataInicio ?? ''}
            onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">Término:</span>
          <input
            type="date"
            value={filtros.dataTermino ?? ''}
            onChange={e => setFiltros({ ...filtros, dataTermino: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar diária' : 'Nova diária'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Beneficiário</label>
                <input
                  required
                  value={form.beneficiario}
                  onChange={e => setForm({ ...form, beneficiario: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <label className="block text-sm font-medium mb-1">Data de término</label>
                <input
                  type="date"
                  required
                  value={form.dataTermino}
                  onChange={e => setForm({ ...form, dataTermino: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Destino</label>
              <input
                required
                value={form.destino}
                onChange={e => setForm({ ...form, destino: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Motivo</label>
              <textarea
                required
                value={form.motivo}
                onChange={e => setForm({ ...form, motivo: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Quantidade de diárias</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.quantDiarias}
                  onChange={e => setForm({ ...form, quantDiarias: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor concedido</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorConcedido}
                  onChange={e => setForm({ ...form, valorConcedido: Number(e.target.value) })}
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma diária encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Beneficiário</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Destino</th>
                <th className="p-3">Período</th>
                <th className="p-3">Qtd.</th>
                <th className="p-3">Valor</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => (
                <tr key={d.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{d.beneficiario}</td>
                  <td className="p-3">{d.cargo}</td>
                  <td className="p-3">{d.destino}</td>
                  <td className="p-3">{d.dataInicio} a {d.dataTermino}</td>
                  <td className="p-3">{d.quantDiarias}</td>
                  <td className="p-3">{d.valorConcedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'rh') && (
                      <button onClick={() => abrirEdicao(d)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'rh') && (
                      <button onClick={() => excluir(d.id)} className="text-error hover:underline">
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

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}
