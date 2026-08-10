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
import { cargoService } from '@/modules/admin/rh/cargo.service'
import { Cargo, CargoRequest, FiltroCargo } from '@/modules/admin/rh/types'

interface FormState {
  id: number | null
  cargo: string
  quantidade: number
  valorBruto: number
  valorDesconto: number
}

const FORM_VAZIO: FormState = { id: null, cargo: '', quantidade: 1, valorBruto: 0, valorDesconto: 0 }

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CargosAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroCargo & { page?: number; size?: number; sort?: string }) => cargoService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data: lista, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Cargo,
    FiltroCargo
  >({ fetchFunction, initialSort: 'cargo,asc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(c: Cargo) {
    setErroForm(null)
    setForm({ id: c.id, cargo: c.cargo, quantidade: c.quantidade, valorBruto: c.valorBruto, valorDesconto: c.valorDesconto })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await cargoService.excluir(idParaExcluir)
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

    const dados: CargoRequest = {
      cargo: form.cargo,
      quantidade: form.quantidade,
      valorBruto: form.valorBruto,
      valorDesconto: form.valorDesconto
    }

    try {
      if (form.id) {
        await cargoService.atualizar(form.id, dados)
      } else {
        await cargoService.criar(dados)
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
        <h1 className="text-lg font-bold text-admin-text">Tabela de Cargos</h1>

        {podeCriar(usuario, 'rh') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo cargo
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Cargo..."
          defaultValue={filtros.cargo ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cargo: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          type="number"
          step="0.01"
          min={0}
          placeholder="Valor bruto mínimo"
          defaultValue={filtros.valorBrutoMin ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, valorBrutoMin: (e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          type="number"
          step="0.01"
          min={0}
          placeholder="Valor bruto máximo"
          defaultValue={filtros.valorBrutoMax ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, valorBrutoMax: (e.target as HTMLInputElement).value ? Number((e.target as HTMLInputElement).value) : undefined }) }}
          className={`${classeInput} w-auto`}
        />
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar cargo' : 'Novo cargo'}</h2>

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="quantidade">Quantidade</label>
                <input
                  id="quantidade"
                  type="number"
                  min={1}
                  required
                  value={form.quantidade}
                  onChange={e => setForm({ ...form, quantidade: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorBruto">Valor bruto</label>
                <input
                  id="valorBruto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorBruto}
                  onChange={e => setForm({ ...form, valorBruto: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorDesconto">Valor de desconto</label>
                <input
                  id="valorDesconto"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorDesconto}
                  onChange={e => setForm({ ...form, valorDesconto: Number(e.target.value) })}
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
      {!loading && !erro && lista.length === 0 && <AdminEmptyState message="Nenhum cargo encontrado." />}

      {!loading && !erro && lista.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Quantidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor bruto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Desconto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor líquido</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Média</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map(c => (
                  <tr key={c.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{c.cargo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{c.quantidade}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(c.valorBruto)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(c.valorDesconto)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(c.valorLiquido)}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(c.media)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'rh') && (
                          <button
                            onClick={() => abrirEdicao(c)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'rh') && (
                          <button
                            onClick={() => setIdParaExcluir(c.id)}
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
        titulo="Excluir cargo?"
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
