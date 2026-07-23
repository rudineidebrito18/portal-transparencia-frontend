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
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { FiltroFornecedor, Fornecedor, FornecedorRequest } from '@/modules/admin/geral/types'

interface FormState {
  id: number | null
  nome: string
  cnpj: string
}

const FORM_VAZIO: FormState = { id: null, nome: '', cnpj: '' }

export default function FornecedoresAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroFornecedor & { page?: number; size?: number; sort?: string }) => fornecedoresService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Fornecedor,
    FiltroFornecedor
  >({ fetchFunction, initialSort: 'nome,asc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirEdicao(f: Fornecedor) {
    setErroForm(null)
    setForm({ id: f.id, nome: f.nome, cnpj: f.cnpj })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este fornecedor? Essa ação não pode ser desfeita.')) return

    try {
      await fornecedoresService.excluir(id)
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
    const request: FornecedorRequest = dados

    try {
      if (id) {
        await fornecedoresService.atualizar(id, request)
      } else {
        await fornecedoresService.criar(request)
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
        <h1 className="text-lg font-bold text-primary">Fornecedores</h1>

        {podeCriar(usuario, 'geral') && !form && (
          <button
            onClick={() => { setErroForm(null); setForm(FORM_VAZIO) }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo fornecedor
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <input
          placeholder="Nome..."
          defaultValue={filtros.nome ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, nome: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="CNPJ..."
          defaultValue={filtros.cnpj ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cnpj: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <h2 className="w-full font-semibold text-sm">{form.id ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <input
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className="border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ</label>
              <input
                required
                value={form.cnpj}
                onChange={e => setForm({ ...form, cnpj: e.target.value })}
                className="border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : form.id ? 'Salvar edição' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
            >
              Cancelar
            </button>
          </form>
          {erroForm && <ErrorState message={erroForm} className="mt-3 p-3" />}
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhum fornecedor encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">CNPJ</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(f => (
                <tr key={f.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{f.nome}</td>
                  <td className="p-3">{f.cnpj}</td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'geral') && (
                      <button onClick={() => abrirEdicao(f)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'geral') && (
                      <button onClick={() => excluir(f.id)} className="text-error hover:underline">
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
