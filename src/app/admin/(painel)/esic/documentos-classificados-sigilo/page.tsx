'use client'

import { DragEvent, FormEvent, useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { MdCloudUpload, MdDescription, MdDeleteOutline, MdEdit, MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { criarServicoAdminDocumentoGenerico } from '@/modules/admin/genericos/service'
import { hrefDocumento, urlArquivoDocumento } from '@/utils/documento'
import { DocumentoClassificadoSigilo, GrauSigilo, LABELS_GRAU_SIGILO } from '@/modules/esic/types'

const BASE_PATH = '/esic/documentos-classificados-sigilo'
const service = criarServicoAdminDocumentoGenerico<DocumentoClassificadoSigilo>(BASE_PATH)

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

interface FormState {
  id: number | null
  numero: string
  descricao: string
  data: string
  dataClassificacao: string
  grauSigilo: GrauSigilo
}

const FORM_VAZIO: FormState = { id: null, numero: '', descricao: '', data: '', dataClassificacao: '', grauSigilo: 'RESERVADO' }

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentosClassificadosSigiloAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: { descricao?: string; page?: number; size?: number; sort?: string }) => service.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina } = usePageableResource<
    DocumentoClassificadoSigilo,
    { descricao?: string }
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  function abrirCriacao() {
    setErroForm(null)
    setArquivo(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(registro: DocumentoClassificadoSigilo) {
    setErroForm(null)
    setArquivo(null)
    setForm({
      id: registro.id,
      numero: registro.numero ?? '',
      descricao: registro.descricao ?? '',
      data: registro.data ?? '',
      dataClassificacao: registro.dataClassificacao ?? '',
      grauSigilo: registro.grauSigilo ?? 'RESERVADO'
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return
    setExcluindo(true)
    try {
      await service.excluir(idParaExcluir)
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

    const dados = {
      numero: form.numero || null,
      descricao: form.descricao,
      data: form.data,
      dataClassificacao: form.dataClassificacao || null,
      grauSigilo: form.grauSigilo
    }

    try {
      if (form.id) {
        await service.atualizar(form.id, dados, arquivo)
      } else {
        if (!arquivo) throw new Error('Selecione um arquivo PDF.')
        await service.criar(dados, arquivo)
      }
      setForm(null)
      recarregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setArrastando(false)
    const arquivoSolto = e.dataTransfer.files?.[0]
    if (arquivoSolto) setArquivo(arquivoSolto)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-admin-text">Documentos por Grau de Sigilo</h1>
          <p className="text-sm text-admin-text-muted">Rol de Informações Classificadas (LAI, art. 30)</p>
        </div>

        {podeCriar(usuario, 'institucional') && !form && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo documento
          </button>
        )}
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar documento' : 'Novo documento'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="numero">Número do documento</label>
                <input
                  id="numero"
                  placeholder="Ex: 001/2026"
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="descricao">Assunto/Tema</label>
                <input
                  id="descricao"
                  required
                  value={form.descricao}
                  onChange={e => setForm({ ...form, descricao: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={classeLabel} htmlFor="data">Data de publicação</label>
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
                <label className={classeLabel} htmlFor="dataClassificacao">Data de classificação</label>
                <input
                  id="dataClassificacao"
                  type="date"
                  value={form.dataClassificacao}
                  onChange={e => setForm({ ...form, dataClassificacao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="grauSigilo">Grau de sigilo</label>
                <select
                  id="grauSigilo"
                  value={form.grauSigilo}
                  onChange={e => setForm({ ...form, grauSigilo: e.target.value as GrauSigilo })}
                  className={classeInput}
                >
                  {(Object.keys(LABELS_GRAU_SIGILO) as GrauSigilo[]).filter(g => g !== 'PUBLICO').map(g => (
                    <option key={g} value={g}>{LABELS_GRAU_SIGILO[g]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="arquivo">
                Arquivo PDF {form.id && '(opcional — mantém o atual se vazio)'}
              </label>
              <div
                onDragOver={e => { e.preventDefault(); setArrastando(true) }}
                onDragLeave={() => setArrastando(false)}
                onDrop={handleDrop}
                onClick={() => inputArquivoRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputArquivoRef.current?.click() }}
                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  arrastando ? 'border-admin-accent bg-admin-info-light' : 'border-admin-border hover:border-admin-border-strong bg-admin-surface'
                }`}
              >
                <input
                  ref={inputArquivoRef}
                  id="arquivo"
                  type="file"
                  accept="application/pdf"
                  onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                {arquivo ? (
                  <>
                    <MdDescription size={28} className="text-admin-accent" />
                    <p className="text-sm font-medium text-admin-text">{arquivo.name}</p>
                    <p className="text-xs text-admin-text-faint">{formatarTamanho(arquivo.size)} — clique para trocar</p>
                  </>
                ) : (
                  <>
                    <MdCloudUpload size={28} className="text-admin-text-faint" />
                    <p className="text-sm text-admin-text-muted">
                      <span className="text-admin-accent font-semibold">Clique para selecionar</span> ou arraste um PDF aqui
                    </p>
                  </>
                )}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum documento classificado cadastrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Número</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Assunto</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Grau</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(registro => (
                  <tr key={registro.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text-muted">{registro.numero || '—'}</td>
                    <td className="p-3.5 text-admin-text">{registro.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted">{registro.grauSigilo ? LABELS_GRAU_SIGILO[registro.grauSigilo] : '—'}</td>
                    <td className="p-3.5">
                      {registro.caminhoArquivo && (
                        <Link
                          href={hrefDocumento(urlArquivoDocumento(BASE_PATH, registro.id), registro.descricao ?? 'Documento', { admin: true })}
                          className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                        >
                          <MdVisibility size={15} /> Ver
                        </Link>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'institucional') && (
                          <button
                            onClick={() => abrirEdicao(registro)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'institucional') && (
                          <button
                            onClick={() => setIdParaExcluir(registro.id)}
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
        titulo="Excluir documento?"
        mensagem="Essa ação não pode ser desfeita. O registro e o arquivo associado serão removidos permanentemente."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
      />
    </div>
  )
}
