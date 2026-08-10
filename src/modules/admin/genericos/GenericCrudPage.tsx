'use client'

import { DragEvent, FormEvent, useCallback, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { MdCloudUpload, MdDescription, MdEdit, MdDeleteOutline, MdVisibility } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import { useAuth } from '@/modules/auth/AuthContext'
import { temPapel } from '@/modules/auth/permissoes'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { ModuloGenericoConfig } from './registry'
import { criarServicoAdminDocumentoGenerico } from './service'
import {
  DocumentoGenericoAdmin,
  DocumentoGenericoComIntervaloAdmin,
  DocumentoGenericoRequest,
  FiltroDocumentoGenericoAdmin
} from './types'
import { hrefDocumento } from '@/utils/documento'

type Registro = DocumentoGenericoAdmin & Partial<Pick<DocumentoGenericoComIntervaloAdmin, 'dataInicio' | 'dataFim'>>

interface FormState {
  id: number | null
  descricao: string
  data: string
  dataInicio: string
  dataFim: string
}

const FORM_VAZIO: FormState = { id: null, descricao: '', data: '', dataInicio: '', dataFim: '' }

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Campo de texto/data compartilhado pelo formulário — só centraliza a classe repetida
// 6x no arquivo original, não é um componente novo de verdade (não reutilizado fora
// daqui ainda).
function CampoForm({
  id,
  label,
  children
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor={id}>
        {label}
      </label>
      {children}
    </div>
  )
}

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

export default function GenericCrudPage({ config }: { config: ModuloGenericoConfig }) {
  const { usuario } = useAuth()
  const service = useMemo(() => criarServicoAdminDocumentoGenerico<Registro>(config.basePath), [config.basePath])

  // `versao` força o refetch depois de criar/editar/excluir sem depender de
  // mudança na URL — trocar a referência de fetchFunction é o que dispara o
  // useEffect de usePageableResource.
  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroDocumentoGenericoAdmin & { page?: number; size?: number; sort?: string }) => service.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [service, versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Registro,
    FiltroDocumentoGenericoAdmin
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  const podeEditar = temPapel(usuario, config.papelMinimoEdicao)
  const podeCriar = temPapel(usuario, 'ROLE_MANAGER')

  function abrirCriacao() {
    setErroForm(null)
    setArquivo(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(registro: Registro) {
    setErroForm(null)
    setArquivo(null)
    setForm({
      id: registro.id,
      descricao: registro.descricao,
      data: registro.data,
      dataInicio: registro.dataInicio ?? '',
      dataFim: registro.dataFim ?? ''
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

    const dados: DocumentoGenericoRequest = {
      descricao: form.descricao,
      data: form.data,
      ...(config.comIntervalo ? { dataInicio: form.dataInicio, dataFim: form.dataFim } : {})
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
          <h1 className="text-lg font-bold text-admin-text">{config.label}</h1>
          <p className="text-sm text-admin-text-muted">{config.categoria}</p>
        </div>

        {podeCriar && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo registro
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="Buscar por descrição..."
          defaultValue={filtros.descricao ?? ''}
          onKeyDown={e => {
            if (e.key === 'Enter') setFiltros({ ...filtros, descricao: (e.target as HTMLInputElement).value })
          }}
          className={`${classeInput} flex-1 min-w-[200px]`}
        />
        <input
          type="date"
          value={filtros.dataInicial ?? ''}
          onChange={e => setFiltros({ ...filtros, dataInicial: e.target.value })}
          className={`${classeInput} w-auto`}
        />
        <input
          type="date"
          value={filtros.dataFinal ?? ''}
          onChange={e => setFiltros({ ...filtros, dataFinal: e.target.value })}
          className={`${classeInput} w-auto`}
        />
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar registro' : 'Novo registro'}</h2>

            <CampoForm id="descricao" label="Descrição">
              <input
                id="descricao"
                required
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className={classeInput}
              />
            </CampoForm>

            <div className="flex gap-3 flex-wrap">
              <div className="w-40">
                <CampoForm id="data" label="Data">
                  <input
                    type="date"
                    id="data"
                    required
                    value={form.data}
                    onChange={e => setForm({ ...form, data: e.target.value })}
                    className={classeInput}
                  />
                </CampoForm>
              </div>

              {config.comIntervalo && (
                <>
                  <div className="w-40">
                    <CampoForm id="dataInicio" label="Início">
                      <input
                        type="date"
                        id="dataInicio"
                        required
                        value={form.dataInicio}
                        onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                        className={classeInput}
                      />
                    </CampoForm>
                  </div>
                  <div className="w-40">
                    <CampoForm id="dataFim" label="Fim">
                      <input
                        type="date"
                        id="dataFim"
                        required
                        value={form.dataFim}
                        onChange={e => setForm({ ...form, dataFim: e.target.value })}
                        className={classeInput}
                      />
                    </CampoForm>
                  </div>
                </>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="arquivo">
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
                  arrastando
                    ? 'border-admin-accent bg-admin-info-light'
                    : 'border-admin-border hover:border-admin-border-strong bg-admin-surface'
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum registro encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Descrição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  {config.comIntervalo && (
                    <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Vigência</th>
                  )}
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(registro => (
                  <tr key={registro.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 text-admin-text">{registro.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{registro.data}</td>
                    {config.comIntervalo && (
                      <td className="p-3.5 text-admin-text-muted tabular-nums">
                        {registro.dataInicio} — {registro.dataFim}
                      </td>
                    )}
                    <td className="p-3.5">
                      {registro.caminhoArquivo && (
                        <Link
                          href={hrefDocumento(registro.caminhoArquivo, registro.descricao, { admin: true })}
                          className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                        >
                          <MdVisibility size={15} /> Ver
                        </Link>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar && (
                          <button
                            onClick={() => abrirEdicao(registro)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeEditar && (
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
        titulo="Excluir registro?"
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
