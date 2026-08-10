'use client'

import { FormEvent, useCallback, useState } from 'react'
import { MdEdit, MdDeleteOutline } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { Page } from '@/modules/shared/types/Page'
import { ConteudoInstitucional } from '@/modules/institucional/types'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
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

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

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
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(item: ConteudoInstitucional) {
    setErroForm(null)
    setForm({ id: item.id, titulo: item.titulo, texto: item.texto, data: item.data, ativo: item.ativo })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await servico.excluir(idParaExcluir)
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">{label}</h1>

        {podeCriar(usuario, 'institucional') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo registro
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3 items-center">
        <label className="text-sm font-medium text-admin-text-muted" htmlFor="status">Status:</label>
        <select
          id="status"
          value={filtros.ativo === undefined ? '' : String(filtros.ativo)}
          onChange={e =>
            setFiltros({ ativo: e.target.value === '' ? undefined : e.target.value === 'true' })
          }
          className={`${classeInput} w-auto`}
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar registro' : 'Novo registro'}</h2>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="titulo">
                Título
              </label>
              <input
                id="titulo"
                required
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className={classeInput}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="texto">
                Texto
              </label>
              <textarea
                id="texto"
                required
                rows={4}
                value={form.texto}
                onChange={e => setForm({ ...form, texto: e.target.value })}
                className={classeInput}
              />
            </div>

            <div className="flex gap-3 flex-wrap items-end">
              <div className="w-40">
                <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="data">
                  Data
                </label>
                <input
                  type="date"
                  id="data"
                  required
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  className={classeInput}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-admin-text-muted pb-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                  className="rounded border-admin-border accent-admin-accent"
                />
                Ativo (visível no portal)
              </label>
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum registro encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Título</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text">{item.titulo}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{item.data}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.ativo ? 'bg-admin-success-light text-admin-success' : 'bg-admin-surface-3 text-admin-text-faint'
                        }`}
                      >
                        <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${item.ativo ? 'bg-admin-success' : 'bg-admin-text-faint'}`} />
                        {item.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'institucional') && (
                          <button
                            onClick={() => abrirEdicao(item)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'institucional') && (
                          <button
                            onClick={() => setIdParaExcluir(item.id)}
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
        titulo="Excluir registro?"
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
