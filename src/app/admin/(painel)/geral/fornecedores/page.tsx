'use client'

import { FormEvent, useCallback, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import { MdEdit, MdDeleteOutline } from 'react-icons/md'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { FiltroFornecedor, Fornecedor, FornecedorRequest } from '@/modules/admin/geral/types'

interface FormState {
  id: number | null
  nome: string
  cnpj: string
}

const FORM_VAZIO: FormState = { id: null, nome: '', cnpj: '' }

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function FornecedoresAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroFornecedor & { page?: number; size?: number; sort?: string }) => fornecedoresService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Fornecedor,
    FiltroFornecedor
  >({ fetchFunction, initialSort: 'nome,asc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirEdicao(f: Fornecedor) {
    setErroForm(null)
    setForm({ id: f.id, nome: f.nome, cnpj: f.cnpj })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await fornecedoresService.excluir(idParaExcluir)
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
    const request: FornecedorRequest = dados

    try {
      if (id) {
        await fornecedoresService.atualizar(id, request)
      } else {
        await fornecedoresService.criar(request)
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
        <h1 className="text-lg font-bold text-admin-text">Fornecedores</h1>

        {podeCriar(usuario, 'geral') && !form && (
          <button
            onClick={() => { setErroForm(null); setForm(FORM_VAZIO) }}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo fornecedor
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Nome..."
          defaultValue={filtros.nome ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, nome: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="CNPJ..."
          defaultValue={filtros.cnpj ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cnpj: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <h2 className="w-full font-semibold text-sm text-admin-text">{form.id ? 'Editar fornecedor' : 'Novo fornecedor'}</h2>

            <div>
              <label className={classeLabel} htmlFor="nome">Nome</label>
              <input
                id="nome"
                required
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
                className={`${classeInput} w-auto`}
              />
            </div>
            <div>
              <label className={classeLabel} htmlFor="cnpj">CNPJ</label>
              <input
                id="cnpj"
                required
                value={form.cnpj}
                onChange={e => setForm({ ...form, cnpj: e.target.value })}
                className={`${classeInput} w-auto`}
              />
            </div>

            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : form.id ? 'Salvar edição' : 'Criar'}
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
              className="px-4 py-2 rounded-lg border border-admin-border text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-all"
            >
              Cancelar
            </button>
          </form>
          {erroForm && <AdminErrorState message={erroForm} className="mt-3 p-3" />}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum fornecedor encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CNPJ</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(f => (
                  <tr key={f.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{f.nome}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{f.cnpj}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'geral') && (
                          <button
                            onClick={() => abrirEdicao(f)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'geral') && (
                          <button
                            onClick={() => setIdParaExcluir(f.id)}
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
        titulo="Excluir fornecedor?"
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
