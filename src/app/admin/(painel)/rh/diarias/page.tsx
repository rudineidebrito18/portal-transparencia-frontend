'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { MdEdit, MdDeleteOutline } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
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
  unidadeId?: number
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
  valorConcedido: 0,
  unidadeId: undefined
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

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

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    unidadesService.listar({ size: 200, sort: 'nome,asc' }).then(p => setUnidades(p.content)).catch(() => {})
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

  function abrirEdicao(d: Diaria) {
    setErroForm(null)
    setForm({ ...d })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await diariaService.excluir(idParaExcluir)
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">Diárias</h1>

        {podeCriar(usuario, 'rh') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova diária
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Beneficiário..."
          defaultValue={filtros.beneficiario ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, beneficiario: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="Cargo..."
          defaultValue={filtros.cargo ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cargo: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="Destino..."
          defaultValue={filtros.destino ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, destino: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Início:</span>
          <input
            type="date"
            value={filtros.dataInicio ?? ''}
            onChange={e => setFiltros({ ...filtros, dataInicio: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Término:</span>
          <input
            type="date"
            value={filtros.dataTermino ?? ''}
            onChange={e => setFiltros({ ...filtros, dataTermino: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        <select
          value={filtros.unidadeId ?? ''}
          onChange={e => setFiltros({ ...filtros, unidadeId: e.target.value ? Number(e.target.value) : undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todas as unidades</option>
          {unidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar diária' : 'Nova diária'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="beneficiario">Beneficiário</label>
                <input
                  id="beneficiario"
                  required
                  value={form.beneficiario}
                  onChange={e => setForm({ ...form, beneficiario: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <label className={classeLabel} htmlFor="dataTermino">Data de término</label>
                <input
                  id="dataTermino"
                  type="date"
                  required
                  value={form.dataTermino}
                  onChange={e => setForm({ ...form, dataTermino: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="destino">Destino</label>
              <input
                id="destino"
                required
                value={form.destino}
                onChange={e => setForm({ ...form, destino: e.target.value })}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="unidadeId">Unidade</label>
              <select
                id="unidadeId"
                value={form.unidadeId ?? ''}
                onChange={e => setForm({ ...form, unidadeId: e.target.value ? Number(e.target.value) : undefined })}
                className={classeInput}
              >
                <option value="">Não vinculada</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={classeLabel} htmlFor="motivo">Motivo</label>
              <textarea
                id="motivo"
                required
                value={form.motivo}
                onChange={e => setForm({ ...form, motivo: e.target.value })}
                className={classeInput}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="quantDiarias">Quantidade de diárias</label>
                <input
                  id="quantDiarias"
                  type="number"
                  min={1}
                  required
                  value={form.quantDiarias}
                  onChange={e => setForm({ ...form, quantDiarias: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorConcedido">Valor concedido</label>
                <input
                  id="valorConcedido"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorConcedido}
                  onChange={e => setForm({ ...form, valorConcedido: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma diária encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Beneficiário</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Destino</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Período</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Qtd.</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(d => (
                  <tr key={d.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{d.beneficiario}</td>
                    <td className="p-3.5 text-admin-text-muted">{d.cargo}</td>
                    <td className="p-3.5 text-admin-text-muted">{d.destino}</td>
                    <td className="p-3.5 text-admin-text-faint">{d.unidadeNome ?? '—'}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{d.dataInicio} a {d.dataTermino}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{d.quantDiarias}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{d.valorConcedido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'rh') && (
                          <button
                            onClick={() => abrirEdicao(d)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'rh') && (
                          <button
                            onClick={() => setIdParaExcluir(d.id)}
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
        titulo="Excluir diária?"
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
