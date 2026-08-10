'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MdChevronRight, MdDeleteOutline, MdEdit } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Unidade, Fornecedor } from '@/modules/admin/geral/types'
import { obraService } from '@/modules/admin/obras/obra.service'
import { FiltroObraPublica, ObraPublica, ObraRequest, TipoObra, TipoObraDescricao, StatusObra, StatusObraDescricao } from '@/modules/admin/obras/types'

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

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

// Em andamento tratado como informativo (obra em execução), concluída como sucesso,
// cancelada como erro. "Paralisada" é uma marcação à parte (tom de alerta), não um
// StatusObra — pode coexistir com qualquer um dos três status acima.
const TOM_STATUS_OBRA: Record<StatusObra, { pill: string; dot: string }> = {
  [StatusObra.EM_ANDAMENTO]: { pill: 'bg-admin-info-light text-admin-info', dot: 'bg-admin-info' },
  [StatusObra.CONCLUIDA]: { pill: 'bg-admin-success-light text-admin-success', dot: 'bg-admin-success' },
  [StatusObra.CANCELADA]: { pill: 'bg-admin-error-light text-admin-error', dot: 'bg-admin-error' }
}

function BadgeStatusObra({ status }: { status: StatusObra }) {
  const { pill, dot } = TOM_STATUS_OBRA[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${pill}`}>
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {StatusObraDescricao[status]}
    </span>
  )
}

function BadgeParalisada() {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-warning-light text-admin-warning">
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-warning" />
      Paralisada
    </span>
  )
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ObrasAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroObraPublica & { page?: number; size?: number; sort?: string }) => obraService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    ObraPublica,
    FiltroObraPublica
  >({ fetchFunction, initialSort: 'numero,desc' })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  useEffect(() => {
    unidadesService.listar({ size: 200, sort: 'nome,asc' }).then(p => setUnidades(p.content)).catch(() => {})
    fornecedoresService.listar({ size: 200, sort: 'nome,asc' }).then(p => setFornecedores(p.content)).catch(() => {})
  }, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

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

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await obraService.excluir(idParaExcluir)
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
        <h1 className="text-lg font-bold text-admin-text">Obras Públicas</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova obra
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          type="number"
          placeholder="Número..."
          defaultValue={filtros.numero ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, numero: Number((e.target as HTMLInputElement).value) || undefined }) }}
          className={`${classeInput} w-32`}
        />
        <select
          value={filtros.status ?? ''}
          onChange={e => setFiltros({ ...filtros, status: (e.target.value as StatusObra) || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os status</option>
          {Object.values(StatusObra).map(s => (
            <option key={s} value={s}>{StatusObraDescricao[s]}</option>
          ))}
        </select>
        <select
          value={filtros.tipo ?? ''}
          onChange={e => setFiltros({ ...filtros, tipo: (e.target.value as TipoObra) || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os tipos</option>
          {Object.values(TipoObra).map(t => (
            <option key={t} value={t}>{TipoObraDescricao[t]}</option>
          ))}
        </select>
        <select
          value={filtros.unidadeId ?? ''}
          onChange={e => setFiltros({ ...filtros, unidadeId: Number(e.target.value) || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todas as unidades</option>
          {unidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
        <select
          value={filtros.fornecedorId ?? ''}
          onChange={e => setFiltros({ ...filtros, fornecedorId: Number(e.target.value) || undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos os fornecedores</option>
          {fornecedores.map(f => (
            <option key={f.id} value={f.id}>{f.nome}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-admin-text-muted">
          <input
            type="checkbox"
            checked={filtros.paralisada ?? false}
            onChange={e => setFiltros({ ...filtros, paralisada: e.target.checked || undefined })}
            className="rounded border-admin-border accent-admin-accent"
          />
          Só paralisadas
        </label>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar obra' : 'Nova obra'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numero">Número</label>
                <input
                  id="numero"
                  type="number"
                  min={1}
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="local">Local</label>
                <input
                  id="local"
                  required
                  value={form.local}
                  onChange={e => setForm({ ...form, local: e.target.value })}
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
                <label className={classeLabel} htmlFor="unidadeId">Unidade responsável</label>
                <select
                  id="unidadeId"
                  required
                  value={form.unidadeId || ''}
                  onChange={e => setForm({ ...form, unidadeId: Number(e.target.value) })}
                  className={classeInput}
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="fornecedorId">Fornecedor responsável</label>
                <select
                  id="fornecedorId"
                  required
                  value={form.fornecedorId || ''}
                  onChange={e => setForm({ ...form, fornecedorId: Number(e.target.value) })}
                  className={classeInput}
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
                <label className={classeLabel} htmlFor="tipo">Tipo</label>
                <select
                  id="tipo"
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value as TipoObra })}
                  className={classeInput}
                >
                  {Object.values(TipoObra).map(t => (
                    <option key={t} value={t}>{TipoObraDescricao[t]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={classeLabel} htmlFor="status">Status</label>
                <select
                  id="status"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value as StatusObra })}
                  className={classeInput}
                >
                  {Object.values(StatusObra).map(s => (
                    <option key={s} value={s}>{StatusObraDescricao[s]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataInicio">Data de início</label>
                <input
                  id="dataInicio"
                  type="date"
                  required
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataPrevistaTermino">Previsão de término</label>
                <input
                  id="dataPrevistaTermino"
                  type="date"
                  required
                  value={form.dataPrevistaTermino}
                  onChange={e => setForm({ ...form, dataPrevistaTermino: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataTermino">Término real (opcional)</label>
                <input
                  id="dataTermino"
                  type="date"
                  value={form.dataTermino}
                  onChange={e => setForm({ ...form, dataTermino: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="fonte">Fonte de recursos</label>
                <input
                  id="fonte"
                  required
                  value={form.fonte}
                  onChange={e => setForm({ ...form, fonte: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorTotal">Valor total</label>
                <input
                  id="valorTotal"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorTotal}
                  onChange={e => setForm({ ...form, valorTotal: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-admin-text-muted">
              <input
                type="checkbox"
                checked={form.paralisada}
                onChange={e => setForm({ ...form, paralisada: e.target.checked })}
                className="rounded border-admin-border accent-admin-accent"
              />
              Obra paralisada
            </label>

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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma obra encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Objeto / Local</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Tipo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor total</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">% físico</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(o => (
                  <tr key={o.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text tabular-nums">{o.numero}</td>
                    <td className="p-3.5">
                      <p className="text-admin-text">{o.objeto}</p>
                      <p className="text-xs text-admin-text-faint">{o.local}</p>
                    </td>
                    <td className="p-3.5 text-admin-text-muted">{TipoObraDescricao[o.tipo]}</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <BadgeStatusObra status={o.status} />
                        {o.paralisada && <BadgeParalisada />}
                      </div>
                    </td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(o.valorTotal)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{o.percentualObra?.toFixed(1) ?? 0}%</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/obras/${o.id}`}
                          aria-label="Ver detalhes"
                          className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                        >
                          <MdChevronRight size={16} />
                        </Link>
                        {podeEditar(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => abrirEdicao(o)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => setIdParaExcluir(o.id)}
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
        titulo="Excluir obra?"
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
