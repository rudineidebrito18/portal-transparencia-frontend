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
import { TipoEmenda, TipoEmendaDescricao, FormaRepasseEmenda, FormaRepasseEmendaDescricao } from '@/modules/emendas-parlamentares/enums'
import { emendaParlamentarService } from '@/modules/admin/emendas-parlamentares/emendaParlamentar.service'
import { EmendaParlamentar, EmendaParlamentarRequest, FiltroEmendaParlamentar } from '@/modules/admin/emendas-parlamentares/types'

interface FormState {
  id: number | null
  numero: string
  dataPublicacao: string
  objeto: string
  autoridade: string
  origem: string
  tipo: TipoEmenda
  formaRepasse: FormaRepasseEmenda
  valorPrevisto: number
  valorRepassado: number
  linkDetalhes: string
}

const FORM_VAZIO: FormState = {
  id: null,
  numero: '',
  dataPublicacao: '',
  objeto: '',
  autoridade: '',
  origem: '',
  tipo: TipoEmenda.INDIVIDUAL,
  formaRepasse: FormaRepasseEmenda.TRANSFERENCIA_ESPECIAL,
  valorPrevisto: 0,
  valorRepassado: 0,
  linkDetalhes: ''
}

const anoAtual = new Date().getFullYear()
const ANOS = Array.from({ length: 10 }, (_, i) => anoAtual - i)

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function EmendasParlamentaresAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroEmendaParlamentar & { page?: number; size?: number; sort?: string }) => emendaParlamentarService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    EmendaParlamentar,
    FiltroEmendaParlamentar
  >({ fetchFunction, initialSort: 'dataPublicacao,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(e: EmendaParlamentar) {
    setErroForm(null)
    setForm({ ...e })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta emenda parlamentar? Essa ação não pode ser desfeita.')) return

    try {
      await emendaParlamentarService.excluir(id)
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
    const request: EmendaParlamentarRequest = dados

    try {
      if (id) {
        await emendaParlamentarService.atualizar(id, request)
      } else {
        await emendaParlamentarService.criar(request)
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
        <h1 className="text-lg font-bold text-primary">Emendas Parlamentares</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova emenda
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select
            value={filtros.tipo ?? ''}
            onChange={e => setFiltros({ ...filtros, tipo: (e.target.value || undefined) as TipoEmenda | undefined, ano: undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {Object.values(TipoEmenda).map(t => (
              <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ano de publicação</label>
          <select
            value={filtros.ano ?? ''}
            onChange={e => setFiltros({ ...filtros, ano: e.target.value ? Number(e.target.value) : undefined, tipo: undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {ANOS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-text-secondary/60 self-end pb-2">
          O backend só filtra por tipo ou por ano, nunca os dois ao mesmo tempo.
        </p>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar emenda' : 'Nova emenda'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Número (emenda/empenho)</label>
                <input
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data de publicação</label>
                <input
                  type="date"
                  required
                  value={form.dataPublicacao}
                  onChange={e => setForm({ ...form, dataPublicacao: e.target.value })}
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
                <label className="block text-sm font-medium mb-1">Autoridade</label>
                <input
                  required
                  value={form.autoridade}
                  onChange={e => setForm({ ...form, autoridade: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Origem do recurso</label>
                <input
                  required
                  value={form.origem}
                  onChange={e => setForm({ ...form, origem: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoEmenda })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(TipoEmenda).map(t => (
                    <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Forma de repasse</label>
                <select
                  value={form.formaRepasse}
                  onChange={e => setForm({ ...form, formaRepasse: e.target.value as FormaRepasseEmenda })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  {Object.values(FormaRepasseEmenda).map(f => (
                    <option key={f} value={f}>{FormaRepasseEmendaDescricao[f]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Valor previsto</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorPrevisto}
                  onChange={e => setForm({ ...form, valorPrevisto: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor já repassado</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorRepassado}
                  onChange={e => setForm({ ...form, valorRepassado: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Link para detalhes</label>
              <input
                type="url"
                value={form.linkDetalhes}
                onChange={e => setForm({ ...form, linkDetalhes: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma emenda parlamentar encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Número</th>
                <th className="p-3">Objeto</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Publicação</th>
                <th className="p-3">Previsto / Repassado</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(e => (
                <tr key={e.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{e.numero}</td>
                  <td className="p-3">{e.objeto}</td>
                  <td className="p-3">
                    <Badge className="bg-primary/10 text-primary">{TipoEmendaDescricao[e.tipo]}</Badge>
                  </td>
                  <td className="p-3">{e.dataPublicacao}</td>
                  <td className="p-3">{formatarMoeda(e.valorPrevisto)} / {formatarMoeda(e.valorRepassado)}</td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'obras-repasses') && (
                      <button onClick={() => abrirEdicao(e)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'obras-repasses') && (
                      <button onClick={() => excluir(e.id)} className="text-error hover:underline">
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
