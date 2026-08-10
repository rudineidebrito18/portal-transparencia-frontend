'use client'

import { FormEvent, useCallback, useState } from 'react'
import { MdEdit, MdDeleteOutline, MdStar, MdStarBorder, MdClose } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { ConteudoInstitucional, ImagemNoticia } from '@/modules/institucional/types'
import { imagemPrincipal } from '@/modules/institucional/utils'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { noticiaAdminService } from '@/modules/admin/institucional/institucional.service'
import { ConteudoInstitucionalRequest } from '@/modules/admin/institucional/institucional.service'

interface FormState {
  id: number | null
  titulo: string
  texto: string
  data: string
  ativo: boolean
  imagensExistentes: ImagemNoticia[]
}

interface NovaImagem {
  file: File
  preview: string
}

const FORM_VAZIO: FormState = { id: null, titulo: '', texto: '', data: '', ativo: true, imagensExistentes: [] }

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function NoticiasAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: { ativo?: boolean; page?: number; size?: number; sort?: string }) => noticiaAdminService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    ConteudoInstitucional,
    { ativo?: boolean }
  >({ fetchFunction, initialSort: 'data,desc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [novasImagens, setNovasImagens] = useState<NovaImagem[]>([])
  const [principalNovaIndex, setPrincipalNovaIndex] = useState<number | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)
  const [imagemParaRemover, setImagemParaRemover] = useState<number | null>(null)

  function limparNovasImagens() {
    novasImagens.forEach(img => URL.revokeObjectURL(img.preview))
    setNovasImagens([])
    setPrincipalNovaIndex(null)
  }

  function adicionarNovosArquivos(files: FileList | null) {
    if (!files) return
    const novas = Array.from(files).map(file => ({ file, preview: URL.createObjectURL(file) }))
    setNovasImagens(prev => [...prev, ...novas])
  }

  function removerNovaImagem(index: number) {
    setNovasImagens(prev => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setPrincipalNovaIndex(prev => (prev === index ? null : prev !== null && prev > index ? prev - 1 : prev))
  }

  async function marcarExistentePrincipal(imagemId: number) {
    if (!form?.id) return

    try {
      await noticiaAdminService.marcarPrincipal(form.id, imagemId)
      setForm({
        ...form,
        imagensExistentes: form.imagensExistentes.map(img => ({ ...img, principal: img.id === imagemId }))
      })
      setPrincipalNovaIndex(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao marcar imagem principal')
    }
  }

  async function confirmarRemocaoImagem() {
    if (!form?.id || imagemParaRemover === null) return

    try {
      await noticiaAdminService.removerImagem(form.id, imagemParaRemover)
      setForm({ ...form, imagensExistentes: form.imagensExistentes.filter(img => img.id !== imagemParaRemover) })
      setImagemParaRemover(null)
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao remover imagem')
    }
  }

  function abrirCriacao() {
    setErroForm(null)
    limparNovasImagens()
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(item: ConteudoInstitucional) {
    setErroForm(null)
    limparNovasImagens()
    setForm({
      id: item.id,
      titulo: item.titulo,
      texto: item.texto,
      data: item.data,
      ativo: item.ativo,
      imagensExistentes: item.imagens ?? []
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await noticiaAdminService.excluir(idParaExcluir)
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
      const id = form.id
        ? (await noticiaAdminService.atualizar(form.id, dados)).id
        : (await noticiaAdminService.criar(dados)).id

      for (let i = 0; i < novasImagens.length; i++) {
        await noticiaAdminService.adicionarImagem(id, novasImagens[i].file, i === principalNovaIndex)
      }

      setForm(null)
      limparNovasImagens()
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
        <h1 className="text-lg font-bold text-admin-text">Notícias</h1>

        {podeCriar(usuario, 'institucional') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Nova notícia
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3 items-center">
        <label className="text-sm font-medium text-admin-text-muted" htmlFor="filtro-status">Status:</label>
        <select
          id="filtro-status"
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
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar notícia' : 'Nova notícia'}</h2>

            <div>
              <label className={classeLabel} htmlFor="titulo">Título</label>
              <input
                id="titulo"
                required
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className={classeInput}
              />
            </div>

            <div>
              <label className={classeLabel} htmlFor="texto">Texto</label>
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
                <label className={classeLabel} htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
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

            <fieldset className="border-0 p-0 m-0 min-w-0">
              <legend className={classeLabel}>Imagens</legend>

              {form.imagensExistentes.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.imagensExistentes.map(imagem => (
                    <div key={imagem.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagem.url}
                        alt={`Imagem da notícia${form.titulo ? `: ${form.titulo}` : ''}`}
                        className={`h-20 w-20 rounded-lg object-cover border-2 ${imagem.principal ? 'border-admin-accent' : 'border-transparent'}`}
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => marcarExistentePrincipal(imagem.id)}
                          title={imagem.principal ? 'Imagem principal' : 'Tornar principal'}
                          aria-label={imagem.principal ? 'Imagem principal' : 'Tornar principal'}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            imagem.principal
                              ? 'admin-gradient-accent text-white'
                              : 'bg-admin-surface-3 border border-admin-border-strong text-admin-text-faint hover:text-admin-accent'
                          }`}
                        >
                          {imagem.principal ? <MdStar size={13} /> : <MdStarBorder size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setImagemParaRemover(imagem.id)}
                          title="Remover"
                          aria-label="Remover imagem"
                          className="w-6 h-6 rounded-full bg-admin-surface-3 border border-admin-border-strong text-admin-error flex items-center justify-center hover:bg-admin-error-light transition-all"
                        >
                          <MdClose size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {novasImagens.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {novasImagens.map((imagem, index) => (
                    <div key={imagem.preview} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagem.preview}
                        alt={`Nova imagem: ${imagem.file.name}`}
                        className={`h-20 w-20 rounded-lg object-cover border-2 ${index === principalNovaIndex ? 'border-admin-accent' : 'border-transparent'}`}
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPrincipalNovaIndex(index)}
                          title={index === principalNovaIndex ? 'Imagem principal' : 'Tornar principal'}
                          aria-label={index === principalNovaIndex ? 'Imagem principal' : 'Tornar principal'}
                          className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            index === principalNovaIndex
                              ? 'admin-gradient-accent text-white'
                              : 'bg-admin-surface-3 border border-admin-border-strong text-admin-text-faint hover:text-admin-accent'
                          }`}
                        >
                          {index === principalNovaIndex ? <MdStar size={13} /> : <MdStarBorder size={13} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => removerNovaImagem(index)}
                          title="Remover"
                          aria-label="Remover imagem"
                          className="w-6 h-6 rounded-full bg-admin-surface-3 border border-admin-border-strong text-admin-error flex items-center justify-center hover:bg-admin-error-light transition-all"
                        >
                          <MdClose size={13} />
                        </button>
                      </div>
                      <p className="text-[10px] text-admin-text-faint mt-1 w-20 truncate">Nova</p>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={e => { adicionarNovosArquivos(e.target.files); e.target.value = '' }}
                className="block w-full text-sm text-admin-text-muted
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:text-white
                  file:bg-admin-accent file:cursor-pointer file:transition-colors hover:file:bg-admin-accent-dark"
              />
              <p className="text-xs text-admin-text-faint mt-1">
                Clique na estrela pra marcar a imagem principal — é a que aparece nas listagens do site.
              </p>
            </fieldset>

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
                onClick={() => { limparNovasImagens(); setForm(null) }}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhuma notícia encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Imagem</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Título</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(item => (
                  <tr key={item.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5">
                      {imagemPrincipal(item) ? (
                        <div className="relative inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagemPrincipal(item)!} alt={`Imagem da notícia: ${item.titulo}`} className="h-10 w-10 rounded-lg object-cover" />
                          {(item.imagens?.length ?? 0) > 1 && (
                            <span className="absolute -top-1 -right-1 admin-gradient-accent text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                              {item.imagens!.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-admin-text-faint">-</span>
                      )}
                    </td>
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
        titulo="Excluir notícia?"
        mensagem="Essa ação não pode ser desfeita."
        confirmarLabel="Excluir"
        perigoso
        carregando={excluindo}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setIdParaExcluir(null)}
      />

      <ConfirmDialog
        aberto={imagemParaRemover !== null}
        titulo="Remover imagem?"
        mensagem="A imagem será removida da notícia."
        confirmarLabel="Remover"
        perigoso
        onConfirmar={confirmarRemocaoImagem}
        onCancelar={() => setImagemParaRemover(null)}
      />
    </div>
  )
}
