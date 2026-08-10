'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import { MdEdit, MdDeleteOutline } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { FiltroUnidade, Unidade, UnidadeRequest } from '@/modules/admin/geral/types'

interface FormState {
  id: number | null
  nome: string
  cnpj: string
  telefone: string
  email: string
  horarioAtendimento: string
  endereco: string
  atribuicoes: string
  dataInicio: string
  dataFim: string
}

const FORM_VAZIO: FormState = {
  id: null,
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  horarioAtendimento: '',
  endereco: '',
  atribuicoes: '',
  dataInicio: '',
  dataFim: ''
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function UnidadesAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroUnidade & { page?: number; size?: number; sort?: string }) => unidadesService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Unidade,
    FiltroUnidade
  >({ fetchFunction, initialSort: 'nome,asc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(u: Unidade) {
    setErroForm(null)
    setForm({
      id: u.id,
      nome: u.nome,
      cnpj: u.cnpj ?? '',
      telefone: u.telefone ?? '',
      email: u.email ?? '',
      horarioAtendimento: u.horarioAtendimento ?? '',
      endereco: u.endereco ?? '',
      atribuicoes: u.atribuicoes ?? '',
      dataInicio: u.dataInicio ?? '',
      dataFim: u.dataFim ?? ''
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await unidadesService.excluir(idParaExcluir)
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

    if (form.dataInicio && form.dataFim && form.dataInicio > form.dataFim) {
      setErroForm('A data de criação não pode ser depois da data de extinção.')
      return
    }

    setSalvando(true)
    setErroForm(null)

    const { id, ...dados } = form
    const request: UnidadeRequest = {
      ...dados,
      dataInicio: dados.dataInicio || undefined,
      dataFim: dados.dataFim || undefined
    }

    try {
      if (id) {
        await unidadesService.atualizar(id, request)
      } else {
        await unidadesService.criar(request)
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
        <h1 className="text-lg font-bold text-admin-text">Unidades</h1>

        {podeCriar(usuario, 'geral') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova unidade
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className={classeLabel} htmlFor="filtroNome">Buscar por nome</label>
          <input
            id="filtroNome"
            placeholder="Buscar por nome..."
            defaultValue={filtros.nome ?? ''}
            onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, nome: (e.target as HTMLInputElement).value || undefined }) }}
            className={`${classeInput} w-full md:w-80`}
          />
        </div>
        <div>
          <label className={classeLabel} htmlFor="vigencia">Vigente em</label>
          <input
            id="vigencia"
            type="date"
            value={filtros.vigencia ?? ''}
            onChange={e => setFiltros({ ...filtros, vigencia: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        {filtros.vigencia && (
          <button
            onClick={() => setFiltros({ ...filtros, vigencia: undefined })}
            className="text-sm text-admin-accent hover:underline pb-2"
          >
            Limpar filtro de vigência
          </button>
        )}
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar unidade' : 'Nova unidade'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="nome">Nome</label>
                <input
                  id="nome"
                  required
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="cnpj">CNPJ</label>
                <input
                  id="cnpj"
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="telefone">Telefone</label>
                <input
                  id="telefone"
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="horarioAtendimento">Horário de atendimento</label>
              <input
                id="horarioAtendimento"
                value={form.horarioAtendimento}
                onChange={e => setForm({ ...form, horarioAtendimento: e.target.value })}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="endereco">Endereço</label>
              <input
                id="endereco"
                value={form.endereco}
                onChange={e => setForm({ ...form, endereco: e.target.value })}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="atribuicoes">Atribuições</label>
              <textarea
                id="atribuicoes"
                value={form.atribuicoes}
                onChange={e => setForm({ ...form, atribuicoes: e.target.value })}
                className={classeInput}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataInicio">
                  Data de criação do órgão (opcional)
                </label>
                <input
                  id="dataInicio"
                  type="date"
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataFim">
                  Data de extinção do órgão (opcional)
                </label>
                <input
                  id="dataFim"
                  type="date"
                  min={form.dataInicio || undefined}
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            {form.id && (
              <p className="text-xs text-admin-text-faint">
                Gestor da unidade se gerencia na tela de detalhe (
                <Link href={`/admin/geral/unidades/${form.id}`} className="text-admin-accent hover:underline">
                  ver detalhes
                </Link>
                , aba Gestores) — não faz mais parte deste formulário.
              </p>
            )}

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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma unidade encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Gestor atual</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Contato</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(u => (
                  <tr key={u.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{u.nome}</td>
                    <td className="p-3.5 text-admin-text-muted">
                      {u.gestorAtual ? (
                        <>
                          {u.gestorAtual.nome} {u.gestorAtual.cargo && `— ${u.gestorAtual.cargo}`}
                          {u.gestorAtual.verificado && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-success-light text-admin-success ml-2">
                              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-admin-success" />
                              Verificado
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-admin-text-faint">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-admin-text-muted">{u.telefone || u.email || '-'}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/geral/unidades/${u.id}`}
                          className="px-2 py-1 rounded-md text-xs font-semibold text-admin-accent hover:underline"
                        >
                          Detalhes
                        </Link>
                        {podeEditar(usuario, 'geral') && (
                          <button
                            onClick={() => abrirEdicao(u)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'geral') && (
                          <button
                            onClick={() => setIdParaExcluir(u.id)}
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
        titulo="Excluir unidade?"
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
