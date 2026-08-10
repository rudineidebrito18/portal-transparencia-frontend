'use client'

import { FormEvent, useCallback, useState } from 'react'

import { MdEdit, MdDeleteOutline } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
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

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

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
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(e: EmendaParlamentar) {
    setErroForm(null)
    setForm({ ...e })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await emendaParlamentarService.excluir(idParaExcluir)
      setIdParaExcluir(null)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">Emendas Parlamentares</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova emenda
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <div>
          <label className={classeLabel} htmlFor="filtro-tipo">Tipo</label>
          <select
            id="filtro-tipo"
            value={filtros.tipo ?? ''}
            onChange={e => setFiltros({ ...filtros, tipo: (e.target.value || undefined) as TipoEmenda | undefined, ano: undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="">Todos</option>
            {Object.values(TipoEmenda).map(t => (
              <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={classeLabel} htmlFor="ano">Ano de publicação</label>
          <select
            id="ano"
            value={filtros.ano ?? ''}
            onChange={e => setFiltros({ ...filtros, ano: e.target.value ? Number(e.target.value) : undefined, tipo: undefined })}
            className={`${classeInput} w-auto`}
          >
            <option value="">Todos</option>
            {ANOS.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-admin-text-faint self-end pb-2">
          O backend só filtra por tipo ou por ano, nunca os dois ao mesmo tempo.
        </p>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar emenda' : 'Nova emenda'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numero">Número (emenda/empenho)</label>
                <input
                  id="numero"
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataPublicacao">Data de publicação</label>
                <input
                  id="dataPublicacao"
                  type="date"
                  required
                  value={form.dataPublicacao}
                  onChange={e => setForm({ ...form, dataPublicacao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="objeto">Objeto</label>
              <textarea
                id="objeto"
                required
                value={form.objeto}
                onChange={e => setForm({ ...form, objeto: e.target.value })}
                className={classeInput}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="autoridade">Autoridade</label>
                <input
                  id="autoridade"
                  required
                  value={form.autoridade}
                  onChange={e => setForm({ ...form, autoridade: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="origem">Origem do recurso</label>
                <input
                  id="origem"
                  required
                  value={form.origem}
                  onChange={e => setForm({ ...form, origem: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoEmenda })}
                  className={classeInput}
                >
                  {Object.values(TipoEmenda).map(t => (
                    <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="formaRepasse">Forma de repasse</label>
                <select
                  id="formaRepasse"
                  value={form.formaRepasse}
                  onChange={e => setForm({ ...form, formaRepasse: e.target.value as FormaRepasseEmenda })}
                  className={classeInput}
                >
                  {Object.values(FormaRepasseEmenda).map(f => (
                    <option key={f} value={f}>{FormaRepasseEmendaDescricao[f]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="valorPrevisto">Valor previsto</label>
                <input
                  id="valorPrevisto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorPrevisto}
                  onChange={e => setForm({ ...form, valorPrevisto: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorRepassado">Valor já repassado</label>
                <input
                  id="valorRepassado"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorRepassado}
                  onChange={e => setForm({ ...form, valorRepassado: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="linkDetalhes">Link para detalhes</label>
              <input
                id="linkDetalhes"
                type="url"
                value={form.linkDetalhes}
                onChange={e => setForm({ ...form, linkDetalhes: e.target.value })}
                className={classeInput}
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma emenda parlamentar encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Número</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Objeto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Publicação</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Previsto / Repassado</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(e => (
                  <tr key={e.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{e.numero}</td>
                    <td className="p-3.5 text-admin-text">{e.objeto}</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-surface-3 text-admin-text-muted">
                        {TipoEmendaDescricao[e.tipo]}
                      </span>
                    </td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{e.dataPublicacao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(e.valorPrevisto)} / {formatarMoeda(e.valorRepassado)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => abrirEdicao(e)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => setIdParaExcluir(e.id)}
                            aria-label="Excluir"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors"
                          >
                            <MdDeleteOutline size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir emenda parlamentar?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
      />
    </div>
  )
}
