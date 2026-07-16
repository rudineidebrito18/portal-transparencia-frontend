'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'

interface Campo<T> {
  chave: keyof T & string
  label: string
}

interface Servico<T, Req> {
  listar(): Promise<T[]>
  criar(dados: Req): Promise<T>
  atualizar(id: number, dados: Req): Promise<T>
  excluir(id: number): Promise<void>
}

function formVazio<T>(campos: Campo<T>[]): Record<string, string> {
  return Object.fromEntries(campos.map(c => [c.chave, '']))
}

// Fornecedores e Unidades (seção 6.9 do prompt do admin) — JSON puro, sem
// paginação, todos os campos são texto simples. Mesmo padrão bespoke de
// /admin/usuarios, generalizado pros campos configuráveis por recurso.
// Req internamente vira um `Record<string, string>` (mesma forma dos campos)
// e só é convertido de volta pro tipo real do request na hora de chamar o
// serviço — os DTOs reais (`FornecedorRequest`, `UnidadeRequest`) não têm
// index signature, então não dá pra tipar o form state direto como `Req`.
export default function GeralSimplesCrudPage<T extends { id: number }, Req extends object>({
  label,
  servico,
  campos
}: {
  label: string
  servico: Servico<T, Req>
  campos: Campo<T>[]
}) {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [form, setForm] = useState<Record<string, string>>(formVazio(campos))
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    servico
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, []) // eslint-disable-line react-hooks/exhaustive-deps

  function abrirEdicao(registro: T) {
    setErroForm(null)
    setEditandoId(registro.id)
    setForm(Object.fromEntries(campos.map(c => [c.chave, String(registro[c.chave] ?? '')])))
  }

  function cancelar() {
    setEditandoId(null)
    setForm(formVazio(campos))
    setErroForm(null)
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return

    try {
      await servico.excluir(id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setSalvando(true)
    setErroForm(null)

    try {
      if (editandoId) {
        await servico.atualizar(editandoId, form as unknown as Req)
      } else {
        await servico.criar(form as unknown as Req)
      }

      cancelar()
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">{label}</h1>

      {(podeCriar(usuario, 'geral') || editandoId) && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <h2 className="w-full font-semibold text-sm">{editandoId ? 'Editar registro' : 'Novo registro'}</h2>

            {campos.map(campo => (
              <div key={campo.chave}>
                <label className="block text-sm font-medium mb-1">{campo.label}</label>
                <input
                  required
                  value={form[campo.chave] ?? ''}
                  onChange={e => setForm({ ...form, [campo.chave]: e.target.value })}
                  className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : editandoId ? 'Salvar edição' : 'Criar'}
            </button>
            {editandoId && (
              <button
                type="button"
                onClick={cancelar}
                className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
              >
                Cancelar
              </button>
            )}
          </form>
          {erroForm && <ErrorState message={erroForm} className="mt-3 p-3" />}
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum registro encontrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                {campos.map(campo => (
                  <th key={campo.chave} className="p-3">{campo.label}</th>
                ))}
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(registro => (
                <tr key={registro.id} className="border-t border-border/20">
                  {campos.map(campo => (
                    <td key={campo.chave} className="p-3">{String(registro[campo.chave])}</td>
                  ))}
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'geral') && (
                      <button onClick={() => abrirEdicao(registro)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'geral') && (
                      <button onClick={() => excluir(registro.id)} className="text-error hover:underline">
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
