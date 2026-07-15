'use client'

import { FormEvent, useCallback, useMemo, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { temPapel } from '@/modules/auth/permissoes'
import { ModuloGenericoConfig } from './registry'
import { criarServicoAdminDocumentoGenerico } from './service'
import {
  DocumentoGenericoAdmin,
  DocumentoGenericoComIntervaloAdmin,
  DocumentoGenericoRequest,
  FiltroDocumentoGenericoAdmin
} from './types'

type Registro = DocumentoGenericoAdmin & Partial<Pick<DocumentoGenericoComIntervaloAdmin, 'dataInicio' | 'dataFim'>>

interface FormState {
  id: number | null
  descricao: string
  data: string
  dataInicio: string
  dataFim: string
}

const FORM_VAZIO: FormState = { id: null, descricao: '', data: '', dataInicio: '', dataFim: '' }

export default function GenericCrudPage({ config }: { config: ModuloGenericoConfig }) {
  const { usuario } = useAuth()
  const service = useMemo(() => criarServicoAdminDocumentoGenerico<Registro>(config.basePath), [config.basePath])

  // `versao` força o refetch depois de criar/editar/excluir sem depender de
  // mudança na URL — trocar a referência de fetchFunction é o que dispara o
  // useEffect de usePageableResource.
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroDocumentoGenericoAdmin & { page?: number; size?: number; sort?: string }) => service.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [service, versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Registro,
    FiltroDocumentoGenericoAdmin
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  const podeEditar = temPapel(usuario, config.papelMinimoEdicao)
  const podeCriar = temPapel(usuario, 'ROLE_MANAGER')

  function abrirCriacao() {
    setErroForm(null)
    setArquivo(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(registro: Registro) {
    setErroForm(null)
    setArquivo(null)
    setForm({
      id: registro.id,
      descricao: registro.descricao,
      data: registro.data,
      dataInicio: registro.dataInicio ?? '',
      dataFim: registro.dataFim ?? ''
    })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return

    try {
      await service.excluir(id)
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

    const dados: DocumentoGenericoRequest = {
      descricao: form.descricao,
      data: form.data,
      ...(config.comIntervalo ? { dataInicio: form.dataInicio, dataFim: form.dataFim } : {})
    }

    try {
      // O backend exige a parte "arquivo" também no PUT (testado contra o
      // real: 500 "Required part 'arquivo' is not present" quando omitida),
      // apesar do prompt do admin documentar como opcional na edição.
      if (!arquivo) throw new Error('Selecione um arquivo PDF.')

      if (form.id) {
        await service.atualizar(form.id, dados, arquivo)
      } else {
        await service.criar(dados, arquivo)
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
          <h1 className="text-lg font-bold text-primary">{config.label}</h1>
          <p className="text-sm text-text-secondary/70">{config.categoria}</p>
        </div>

        {podeCriar && (
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
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {config.comIntervalo && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Início</label>
                    <input
                      type="date"
                      required
                      value={form.dataInicio}
                      onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                      className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fim</label>
                    <input
                      type="date"
                      required
                      value={form.dataFim}
                      onChange={e => setForm({ ...form, dataFim: e.target.value })}
                      className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Arquivo PDF {form.id && '(reenvie o arquivo mesmo pra manter o registro — o backend exige essa parte também ao editar)'}
              </label>
              <input
                type="file"
                accept="application/pdf"
                required
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="text-sm"
              />
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
                <th className="p-3">Data</th>
                {config.comIntervalo && <th className="p-3">Vigência</th>}
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(registro => (
                <tr key={registro.id} className="border-t border-border/20">
                  <td className="p-3">{registro.descricao}</td>
                  <td className="p-3">{registro.data}</td>
                  {config.comIntervalo && (
                    <td className="p-3">
                      {registro.dataInicio} — {registro.dataFim}
                    </td>
                  )}
                  <td className="p-3">
                    {registro.caminhoArquivo && (
                      <a href={registro.caminhoArquivo} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        Ver PDF
                      </a>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar && (
                      <button onClick={() => abrirEdicao(registro)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeEditar && (
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

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}
