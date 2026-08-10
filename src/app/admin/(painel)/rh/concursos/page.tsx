'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'
import { MdAttachFile, MdEdit, MdDeleteOutline } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { concursoService } from '@/modules/admin/rh/concurso.service'
import { Concurso, ConcursoRequest, FiltroConcurso } from '@/modules/admin/rh/types'

interface FormState {
  id: number | null
  descricao: string
  numero: number
  ano: number
  dataAbertura: string
  dataInscricoes: string
  dataTerminoInscricoes: string
  validate: string
  resumo: string
}

const hoje = new Date()
const FORM_VAZIO: FormState = {
  id: null,
  descricao: '',
  numero: 1,
  ano: hoje.getFullYear(),
  dataAbertura: '',
  dataInscricoes: '',
  dataTerminoInscricoes: '',
  validate: '',
  resumo: ''
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function ConcursosAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroConcurso & { page?: number; size?: number; sort?: string }) => concursoService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Concurso,
    FiltroConcurso
  >({ fetchFunction, initialSort: 'dataAbertura,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(c: Concurso) {
    setErroForm(null)
    setForm({ ...c })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await concursoService.excluir(idParaExcluir)
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
    const request: ConcursoRequest = dados

    try {
      if (id) {
        await concursoService.atualizar(id, request)
      } else {
        await concursoService.criar(request)
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
        <h1 className="text-lg font-bold text-admin-text">Concursos e Seleções Públicas</h1>

        {podeCriar(usuario, 'padrao') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo concurso
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
        <input
          type="number"
          placeholder="Ano..."
          defaultValue={filtros.ano ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, ano: Number((e.target as HTMLInputElement).value) || undefined }) }}
          className={`${classeInput} w-32`}
        />
        <input
          placeholder="Descrição..."
          defaultValue={filtros.descricao ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, descricao: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Abertura de:</span>
          <input
            type="date"
            value={filtros.dataAberturaInicial ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAberturaInicial: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>até:</span>
          <input
            type="date"
            value={filtros.dataAberturaFinal ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAberturaFinal: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar concurso' : 'Novo concurso'}</h2>

            <div>
              <label className={classeLabel} htmlFor="descricao">Descrição</label>
              <input
                id="descricao"
                required
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                <label className={classeLabel} htmlFor="ano">Ano</label>
                <input
                  id="ano"
                  type="number"
                  required
                  value={form.ano}
                  onChange={e => setForm({ ...form, ano: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataAbertura">Data de abertura</label>
                <input
                  id="dataAbertura"
                  type="date"
                  required
                  value={form.dataAbertura}
                  onChange={e => setForm({ ...form, dataAbertura: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="validate">Validade</label>
                <input
                  id="validate"
                  type="date"
                  required
                  value={form.validate}
                  onChange={e => setForm({ ...form, validate: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataInscricoes">Início das inscrições</label>
                <input
                  id="dataInscricoes"
                  type="date"
                  required
                  value={form.dataInscricoes}
                  onChange={e => setForm({ ...form, dataInscricoes: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="dataTerminoInscricoes">Término das inscrições</label>
                <input
                  id="dataTerminoInscricoes"
                  type="date"
                  required
                  value={form.dataTerminoInscricoes}
                  onChange={e => setForm({ ...form, dataTerminoInscricoes: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="resumo">Resumo</label>
              <textarea
                id="resumo"
                required
                value={form.resumo}
                onChange={e => setForm({ ...form, resumo: e.target.value })}
                className={classeInput}
                rows={3}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum concurso encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Descrição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº/Ano</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Inscrições</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Validade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(c => (
                  <tr key={c.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{c.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{c.numero}/{c.ano}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{c.dataInscricoes} a {c.dataTerminoInscricoes}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{c.validate}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/rh/concursos/${c.id}`}
                          aria-label="Anexos"
                          className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                        >
                          <MdAttachFile size={16} />
                        </Link>
                        {podeEditar(usuario, 'padrao') && (
                          <button
                            onClick={() => abrirEdicao(c)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'padrao') && (
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
        titulo="Excluir concurso?"
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
