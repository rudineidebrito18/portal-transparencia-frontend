'use client'

import { FormEvent, useCallback, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { ConteudoInstitucional, ImagemNoticia } from '@/modules/institucional/types'
import { imagemPrincipal } from '@/modules/institucional/utils'
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

  async function removerExistente(imagemId: number) {
    if (!form?.id) return
    if (!confirm('Remover esta imagem?')) return

    try {
      await noticiaAdminService.removerImagem(form.id, imagemId)
      setForm({ ...form, imagensExistentes: form.imagensExistentes.filter(img => img.id !== imagemId) })
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

  async function excluir(id: number) {
    if (!confirm('Excluir esta notícia? Essa ação não pode ser desfeita.')) return

    try {
      await noticiaAdminService.excluir(id)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Notícias</h1>

        {podeCriar(usuario, 'institucional') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova notícia
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center" hoverable={false}>
        <label className="text-sm font-medium">Status:</label>
        <select
          value={filtros.ativo === undefined ? '' : String(filtros.ativo)}
          onChange={e =>
            setFiltros({ ativo: e.target.value === '' ? undefined : e.target.value === 'true' })
          }
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar notícia' : 'Nova notícia'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                required
                value={form.titulo}
                onChange={e => setForm({ ...form, titulo: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Texto</label>
              <textarea
                required
                rows={4}
                value={form.texto}
                onChange={e => setForm({ ...form, texto: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={form.data}
                  onChange={e => setForm({ ...form, data: e.target.value })}
                  className="border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium pb-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={e => setForm({ ...form, ativo: e.target.checked })}
                />
                Ativo (visível no portal)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Imagens</label>

              {form.imagensExistentes.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.imagensExistentes.map(imagem => (
                    <div key={imagem.id} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagem.url}
                        alt=""
                        className={`h-20 w-20 rounded-lg object-cover border-2 ${imagem.principal ? 'border-primary' : 'border-transparent'}`}
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => marcarExistentePrincipal(imagem.id)}
                          title={imagem.principal ? 'Imagem principal' : 'Tornar principal'}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                            imagem.principal
                              ? 'bg-primary text-white'
                              : 'bg-white border border-border/30 text-text-secondary/60 hover:text-primary'
                          }`}
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => removerExistente(imagem.id)}
                          title="Remover"
                          className="w-6 h-6 rounded-full bg-white border border-border/30 text-error flex items-center justify-center text-xs hover:bg-error/10 transition-all"
                        >
                          ×
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
                        alt=""
                        className={`h-20 w-20 rounded-lg object-cover border-2 ${index === principalNovaIndex ? 'border-primary' : 'border-transparent'}`}
                      />
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => setPrincipalNovaIndex(index)}
                          title={index === principalNovaIndex ? 'Imagem principal' : 'Tornar principal'}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                            index === principalNovaIndex
                              ? 'bg-primary text-white'
                              : 'bg-white border border-border/30 text-text-secondary/60 hover:text-primary'
                          }`}
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={() => removerNovaImagem(index)}
                          title="Remover"
                          className="w-6 h-6 rounded-full bg-white border border-border/30 text-error flex items-center justify-center text-xs hover:bg-error/10 transition-all"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-[10px] text-text-secondary/60 mt-1 w-20 truncate">Nova</p>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={e => { adicionarNovosArquivos(e.target.files); e.target.value = '' }}
                className="block w-full text-sm text-text-secondary/70
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-primary file:text-white
                  hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
              />
              <p className="text-xs text-text-secondary/50 mt-1">
                Clique na estrela pra marcar a imagem principal — é a que aparece nas listagens do site.
              </p>
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={salvando}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                type="button"
                onClick={() => { limparNovasImagens(); setForm(null) }}
                className="px-4 py-2 rounded-lg border border-border/30 text-sm font-semibold hover:bg-neutral-light transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </Card>
      )}

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma notícia encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Imagem</th>
                <th className="p-3">Título</th>
                <th className="p-3">Data</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} className="border-t border-border/20">
                  <td className="p-3">
                    {imagemPrincipal(item) ? (
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagemPrincipal(item)!} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        {(item.imagens?.length ?? 0) > 1 && (
                          <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                            {item.imagens!.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-text-secondary/40">-</span>
                    )}
                  </td>
                  <td className="p-3">{item.titulo}</td>
                  <td className="p-3">{item.data}</td>
                  <td className="p-3">
                    <Badge className={item.ativo ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}>
                      {item.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'institucional') && (
                      <button onClick={() => abrirEdicao(item)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'institucional') && (
                      <button onClick={() => excluir(item.id)} className="text-error hover:underline">
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}
