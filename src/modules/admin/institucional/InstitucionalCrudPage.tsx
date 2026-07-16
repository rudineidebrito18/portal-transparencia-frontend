'use client'

import { FormEvent, useCallback, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { Page } from '@/modules/shared/types/Page'
import { ConteudoInstitucional } from '@/modules/institucional/types'
import { ConteudoInstitucionalRequest } from './institucional.service'

type Servico = {
  listar(params: { ativo?: boolean; page?: number; size?: number; sort?: string }): Promise<Page<ConteudoInstitucional>>
  criar(dados: ConteudoInstitucionalRequest): Promise<ConteudoInstitucional>
  atualizar(id: number, dados: ConteudoInstitucionalRequest): Promise<ConteudoInstitucional>
  excluir(id: number): Promise<void>
}

interface FormState {
  id: number | null
  titulo: string
  texto: string
  data: string
  ativo: boolean
}

const FORM_VAZIO: FormState = { id: null, titulo: '', texto: '', data: '', ativo: true }

export default function InstitucionalCrudPage({ label, servico }: { label: string; servico: Servico }) {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: { ativo?: boolean; page?: number; size?: number; sort?: string }) => servico.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [servico, versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    ConteudoInstitucional,
    { ativo?: boolean }
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(item: ConteudoInstitucional) {
    setErroForm(null)
    setForm({ id: item.id, titulo: item.titulo, texto: item.texto, data: item.data, ativo: item.ativo })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return

    try {
      await servico.excluir(id)
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

    const dados: ConteudoInstitucionalRequest = {
      titulo: form.titulo,
      texto: form.texto,
      data: form.data,
      ativo: form.ativo
    }

    try {
      if (form.id) {
        await servico.atualizar(form.id, dados)
      } else {
        await servico.criar(dados)
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
        <h1 className="text-lg font-bold text-primary">{label}</h1>

        {podeCriar(usuario, 'institucional') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo registro
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center" hoverable={false}>
        <label className="text-sm font-medium">Status:</label>
        <select
          value={filtros.ativo === undefined ? '' : String(filtros.ativo)}
          onChange={e =>
            setFiltros({ ativo: e.target.value === '' ? undefined : e.target.value === 'true' })
          }
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar registro' : 'Novo registro'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                required
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Texto</label>
              <textarea
                required
                rows={4}
                value={form.texto}
                onChange={e => setForm({ ...form, texto: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium pb-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                />
                Ativo (visível no portal)
              </label>
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhum registro encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Título</th>
                <th className="p-3">Data</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t border-border/20">
                  <td className="p-3">{item.titulo}</td>
                  <td className="p-3">{item.data}</td>
                  <td className="p-3">
                    <Badge className={item.ativo ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'institucional') && (
                      <button onClick={() => abrirEdicao(item)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'institucional') && (
                      <button onClick={() => excluir(item.id)} className="text-error hover:underline">
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
