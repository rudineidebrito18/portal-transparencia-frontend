'use client'

import { FormEvent, useCallback, useState } from 'react'

import Link from 'next/link'
import { MdEdit, MdDeleteOutline, MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { empresaInidoneaService } from '@/modules/admin/anticorrupcao/empresaInidonea.service'
import { EmpresaInidonea, EmpresaInidoneaRequest, FiltroEmpresaInidonea } from '@/modules/admin/anticorrupcao/types'
import { hrefDocumento } from '@/utils/documento'

interface FormState extends EmpresaInidoneaRequest {
  id: number | null
}

const FORM_VAZIO: FormState = {
  id: null,
  empresa: '',
  cnpj: '',
  descricao: '',
  status: '',
  data: ''
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

export default function EmpresasInidoneasAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroEmpresaInidonea & { page?: number; size?: number; sort?: string }) => empresaInidoneaService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    EmpresaInidonea,
    FiltroEmpresaInidonea
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirEdicao(e: EmpresaInidonea) {
    setErroForm(null)
    setPdf(null)
    setForm({
      id: e.id,
      empresa: e.empresa,
      cnpj: e.cnpj,
      descricao: e.descricao,
      status: e.status,
      data: e.data
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await empresaInidoneaService.excluir(idParaExcluir)
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
    const request: EmpresaInidoneaRequest = dados

    try {
      if (id) {
        await empresaInidoneaService.atualizar(id, request, pdf)
      } else {
        await empresaInidoneaService.criar(request, pdf)
      }
      setForm(null)
      setPdf(null)
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
        <h1 className="text-lg font-bold text-admin-text">Empresas Inidôneas ou Suspensas</h1>

        {podeCriar(usuario, 'anticorrupcao') && !form && (
          <button
            onClick={() => { setErroForm(null); setPdf(null); setForm(FORM_VAZIO) }}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova empresa
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Empresa..."
          defaultValue={filtros.empresa ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, empresa: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="CNPJ..."
          defaultValue={filtros.cnpj ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cnpj: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="Status..."
          defaultValue={filtros.status ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, status: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>De:</span>
          <input
            type="date"
            value={filtros.dataInicial ?? ''}
            onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Até:</span>
          <input
            type="date"
            value={filtros.dataFinal ?? ''}
            onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar empresa' : 'Nova empresa'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="empresa">Empresa</label>
                <input
                  id="empresa"
                  required
                  value={form.empresa}
                  onChange={e => setForm({ ...form, empresa: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="cnpj">CNPJ</label>
                <input
                  id="cnpj"
                  required
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="status">Status</label>
                <input
                  id="status"
                  required
                  placeholder="Ex: Inidônea, Suspensa"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="descricao">Descrição da situação</label>
              <textarea
                id="descricao"
                required
                rows={2}
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className={classeInput}
              />
            </div>

            <div className="w-full md:w-1/3">
              <label className={classeLabel} htmlFor="data">Data da ocorrência</label>
              <input
                id="data"
                type="date"
                required
                value={form.data}
                onChange={e => setForm({ ...form, data: e.target.value })}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="pdf">
                PDF (opcional{form.id && ' — mantém o atual se vazio'})
              </label>
              <input
                id="pdf"
                type="file"
                accept="application/pdf"
                onChange={e => setPdf(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-admin-text-muted
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:text-white
                  file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark"
              />
              {pdf && <p className="text-xs text-admin-text-faint mt-1">Selecionado: {pdf.name}</p>}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma empresa cadastrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Empresa</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CNPJ</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Documento</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(e => (
                  <tr key={e.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{e.empresa}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{e.cnpj}</td>
                    <td className="p-3.5 text-admin-text-muted">{e.status}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarData(e.data)}</td>
                    <td className="p-3.5">
                      {e.caminhoPdf ? (
                        <Link
                          href={hrefDocumento(e.caminhoPdf, e.empresa, { admin: true })}
                          className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                        >
                          <MdVisibility size={15} /> Ver
                        </Link>
                      ) : (
                        <span className="text-admin-text-faint">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'anticorrupcao') && (
                          <button
                            onClick={() => abrirEdicao(e)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'anticorrupcao') && (
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
