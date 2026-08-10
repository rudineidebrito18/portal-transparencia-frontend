'use client'

import { FormEvent, useCallback, useState } from 'react'

import Link from 'next/link'
import { MdEdit, MdDeleteOutline, MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { convenioService } from '@/modules/admin/convenios/convenio.service'
import { Convenio, ConvenioRequest, FiltroConvenio } from '@/modules/admin/convenios/types'
import { hrefDocumento } from '@/utils/documento'

interface FormState {
  id: number | null
  numero: number
  convenente: string
  objeto: string
  internveniente: string
  dataAssinatura: string
  inicioVigencia: string
  fimVigencia: string
  valorConvenio: number
  valorContrapartida: number
  valorConcedente: number
}

const FORM_VAZIO: FormState = {
  id: null,
  numero: 1,
  convenente: '',
  objeto: '',
  internveniente: '',
  dataAssinatura: '',
  inicioVigencia: '',
  fimVigencia: '',
  valorConvenio: 0,
  valorContrapartida: 0,
  valorConcedente: 0
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ConveniosAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroConvenio & { page?: number; size?: number; sort?: string }) => convenioService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Convenio,
    FiltroConvenio
  >({ fetchFunction, initialSort: 'dataAssinatura,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  function abrirCriacao() {
    setErroForm(null)
    setPdf(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(c: Convenio) {
    setErroForm(null)
    setPdf(null)
    setForm({
      id: c.id,
      numero: c.numero,
      convenente: c.convenente,
      objeto: c.objeto,
      internveniente: c.internveniente,
      dataAssinatura: c.dataAssinatura,
      inicioVigencia: c.inicioVigencia,
      fimVigencia: c.fimVigencia,
      valorConvenio: c.valorConvenio,
      valorContrapartida: c.valorContrapartida,
      valorConcedente: c.valorConcedente
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await convenioService.excluir(idParaExcluir)
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
    const request: ConvenioRequest = dados

    try {
      if (id) {
        await convenioService.atualizar(id, request, pdf)
      } else {
        await convenioService.criar(request, pdf)
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
        <h1 className="text-lg font-bold text-admin-text">Convênios</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo convênio
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
          placeholder="Convenente..."
          defaultValue={filtros.convenente ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, convenente: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Assinado de:</span>
          <input
            type="date"
            value={filtros.dataAssinaturaInicial ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAssinaturaInicial: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>até:</span>
          <input
            type="date"
            value={filtros.dataAssinaturaFinal ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAssinaturaFinal: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar convênio' : 'Novo convênio'}</h2>

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
                <label className={classeLabel} htmlFor="convenente">Convenente</label>
                <input
                  id="convenente"
                  required
                  value={form.convenente}
                  onChange={e => setForm({ ...form, convenente: e.target.value })}
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

            <div>
              <label className={classeLabel} htmlFor="internveniente">Interveniente</label>
              <input
                id="internveniente"
                required
                value={form.internveniente}
                onChange={e => setForm({ ...form, internveniente: e.target.value })}
                className={classeInput}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="dataAssinatura">Data de assinatura</label>
                <input
                  id="dataAssinatura"
                  type="date"
                  required
                  value={form.dataAssinatura}
                  onChange={e => setForm({ ...form, dataAssinatura: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="inicioVigencia">Início da vigência</label>
                <input
                  id="inicioVigencia"
                  type="date"
                  required
                  value={form.inicioVigencia}
                  onChange={e => setForm({ ...form, inicioVigencia: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="fimVigencia">Fim da vigência</label>
                <input
                  id="fimVigencia"
                  type="date"
                  required
                  value={form.fimVigencia}
                  onChange={e => setForm({ ...form, fimVigencia: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="valorConvenio">Valor do convênio</label>
                <input
                  id="valorConvenio"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorConvenio}
                  onChange={e => setForm({ ...form, valorConvenio: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorContrapartida">Valor da contrapartida</label>
                <input
                  id="valorContrapartida"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorContrapartida}
                  onChange={e => setForm({ ...form, valorContrapartida: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="valorConcedente">Valor do concedente</label>
                <input
                  id="valorConcedente"
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorConcedente}
                  onChange={e => setForm({ ...form, valorConcedente: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="pdf">
                PDF do convênio (opcional{form.id && ' — mantém o atual se vazio'})
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum convênio encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nº</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Convenente</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Vigência</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Valor total</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Documento</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(c => (
                  <tr key={c.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text tabular-nums">{c.numero}</td>
                    <td className="p-3.5 text-admin-text">{c.convenente}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{c.inicioVigencia} a {c.fimVigencia}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{formatarMoeda(c.valorConvenio)}</td>
                    <td className="p-3.5">
                      {c.caminhoPdf ? (
                        <Link
                          href={hrefDocumento(c.caminhoPdf, `Convênio Nº ${c.numero}`, { admin: true })}
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
                        {podeEditar(usuario, 'obras-repasses') && (
                          <button
                            onClick={() => abrirEdicao(c)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'obras-repasses') && (
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
        titulo="Excluir convênio?"
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
