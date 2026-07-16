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
import { tabelaValoresService } from '@/modules/admin/tabela-valores/tabela-valores.service'
import { FiltroTabelaValores, TabelaValores, TabelaValoresRequest, TipoViagem } from '@/modules/admin/tabela-valores/types'

interface FormState {
  id: number | null
  tipo: TipoViagem
  descricao: string
  data: string
}

const FORM_VAZIO: FormState = { id: null, tipo: 'NACIONAL', descricao: '', data: '' }

export default function TabelaValoresAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroTabelaValores & { page?: number; size?: number; sort?: string }) => tabelaValoresService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    TabelaValores,
    FiltroTabelaValores
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setArquivo(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(item: TabelaValores) {
    setErroForm(null)
    setArquivo(null)
    setForm({ id: item.id, tipo: item.tipo, descricao: item.descricao, data: item.data })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return

    try {
      await tabelaValoresService.excluir(id)
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

    const dados: TabelaValoresRequest = { tipo: form.tipo, descricao: form.descricao, data: form.data }

    try {
      if (form.id) {
        await tabelaValoresService.atualizar(form.id, dados, arquivo)
      } else {
        if (!arquivo) throw new Error('Selecione um arquivo PDF.')
        await tabelaValoresService.criar(dados, arquivo)
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
        <h1 className="text-lg font-bold text-primary">Tabela de Valores de Diária</h1>

        {podeCriar(usuario, 'geral') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo registro
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <input
          placeholder="Buscar por descrição..."
          defaultValue={filtros.descricao ?? ''}
          onKeyDown={e => {
            if (e.key === 'Enter') setFiltros({ ...filtros, descricao: (e.target as HTMLInputElement).value })
          }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select
          value={filtros.tipoViagem ?? ''}
          onChange={e => setFiltros({ ...filtros, tipoViagem: (e.target.value || undefined) as TipoViagem | undefined })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          <option value="NACIONAL">Nacional</option>
          <option value="INTERNACIONAL">Internacional</option>
        </select>
        <input
          type="date"
          value={filtros.dataInicial ?? ''}
          onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={filtros.dataFinal ?? ''}
          onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar registro' : 'Novo registro'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <input
                required
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoViagem })}
                  className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="NACIONAL">Nacional</option>
                  <option value="INTERNACIONAL">Internacional</option>
                </select>
              </div>

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
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Arquivo PDF {form.id && '(opcional — mantém o atual se vazio)'}
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-text-secondary/70
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-primary file:text-white
                  hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
              />
              {arquivo && <p className="text-xs text-text-secondary/70 mt-1">Selecionado: {arquivo.name}</p>}
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
                <th className="p-3">Descrição</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Data</th>
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t border-border/20">
                  <td className="p-3">{item.descricao}</td>
                  <td className="p-3">
                    <Badge className="bg-primary/10 text-primary">
                      {item.tipo === 'NACIONAL' ? 'Nacional' : 'Internacional'}
                    </Badge>
                  </td>
                  <td className="p-3">{item.data}</td>
                  <td className="p-3">
                    {item.caminhoArquivo && (
                      <a href={item.caminhoArquivo} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        Ver PDF
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'geral') && (
                      <button onClick={() => abrirEdicao(item)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'geral') && (
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
