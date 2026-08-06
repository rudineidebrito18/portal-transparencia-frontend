'use client'

import { FormEvent, useCallback, useState } from 'react'

import Link from 'next/link'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { edicaoNaoEletronicaAdminService } from '@/modules/admin/diario-oficial/edicaoNaoEletronica.service'
import {
  EdicaoNaoEletronica,
  EdicaoNaoEletronicaRequest,
  FiltroEdicaoNaoEletronica,
  TipoEdicaoDiario,
  TipoEdicaoDiarioDescricao
} from '@/modules/admin/diario-oficial/types'
import { hrefDocumento } from '@/utils/documento'

interface FormState {
  id: number | null
  volume: string
  descricao: string
  data: string
  tipo: string
}

const FORM_VAZIO: FormState = { id: null, volume: '', descricao: '', data: '', tipo: TipoEdicaoDiario.EXECUTIVO }

export default function EdicoesNaoEletronicasAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroEdicaoNaoEletronica & { page?: number; size?: number; sort?: string }) => edicaoNaoEletronicaAdminService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    EdicaoNaoEletronica,
    FiltroEdicaoNaoEletronica
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

  function abrirEdicao(item: EdicaoNaoEletronica) {
    setErroForm(null)
    setArquivo(null)
    setForm({ id: item.id, volume: item.volume, descricao: item.descricao, data: item.data, tipo: item.tipo })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return

    try {
      await edicaoNaoEletronicaAdminService.excluir(id)
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

    const dados: EdicaoNaoEletronicaRequest = { volume: form.volume, descricao: form.descricao, data: form.data, tipo: form.tipo }

    try {
      if (form.id) {
        await edicaoNaoEletronicaAdminService.atualizar(form.id, dados, arquivo)
      } else {
        if (!arquivo) throw new Error('Selecione um arquivo PDF.')
        await edicaoNaoEletronicaAdminService.criar(dados, arquivo)
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
        <div>
          <h1 className="text-lg font-bold text-primary">Diário Oficial — Edições Não Eletrônicas</h1>
          <p className="text-sm text-text-secondary/70">Publicações físicas anteriores ao sistema eletrônico.</p>
        </div>

        {podeCriar(usuario, 'diario-oficial') && (
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
          value={filtros.tipo ?? ''}
          onChange={e => setFiltros({ ...filtros, tipo: e.target.value || undefined })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {Object.values(TipoEdicaoDiario).map(t => (
            <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
          ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Volume</label>
                <input
                  required
                  placeholder="Ex: Vol. 2 - Nº 93 / 2021"
                  value={form.volume}
                  onChange={e => setForm({ ...form, volume: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  required
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                  className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(TipoEdicaoDiario).map(t => (
                    <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
                  ))}
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
                <th className="p-3">Volume</th>
                <th className="p-3">Descrição</th>
                <th className="p-3">Data</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t border-border/20">
                  <td className="p-3 whitespace-nowrap">{item.volume}</td>
                  <td className="p-3">{item.descricao}</td>
                  <td className="p-3 whitespace-nowrap">{item.data}</td>
                  <td className="p-3">
                    <Badge className="bg-primary/10 text-primary">
                      {TipoEdicaoDiarioDescricao[item.tipo as TipoEdicaoDiario] ?? item.tipo}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Link href={hrefDocumento(item.caminhoArquivo, item.descricao, { admin: true })} className="text-accent hover:underline">
                      Ver documento
                    </Link>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'diario-oficial') && (
                      <button onClick={() => abrirEdicao(item)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'diario-oficial') && (
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
