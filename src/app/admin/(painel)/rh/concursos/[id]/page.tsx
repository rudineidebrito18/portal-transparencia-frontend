'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MdArrowBack, MdDeleteOutline, MdVisibility } from 'react-icons/md'

import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeExcluir } from '@/modules/auth/permissoes'
import { anexoConcursoService, concursoService } from '@/modules/admin/rh/concurso.service'
import { AnexoConcurso, Concurso } from '@/modules/admin/rh/types'
import { hrefDocumento } from '@/utils/documento'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

export default function AnexosConcursoAdminPage() {
  const { usuario } = useAuth()
  const params = useParams<{ id: string }>()
  const concursoId = Number(params.id)

  const [concurso, setConcurso] = useState<Concurso | null>(null)
  const [anexos, setAnexos] = useState<AnexoConcurso[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    Promise.all([concursoService.buscarPorId(concursoId), anexoConcursoService.listarPorConcurso(concursoId)])
      .then(([c, lista]) => {
        setConcurso(c)
        setAnexos(lista)
      })
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [concursoId])

  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await anexoConcursoService.excluir(idParaExcluir)
      setIdParaExcluir(null)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    } finally {
      setExcluindo(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!arquivo) return

    setEnviando(true)
    setErroForm(null)

    try {
      await anexoConcursoService.criar(concursoId, { descricao, data }, arquivo)
      setDescricao('')
      setData('')
      setArquivo(null)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao enviar anexo')
    } finally {
      setEnviando(false)
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-admin-border bg-admin-surface h-64 animate-pulse" aria-hidden="true" />
  }
  if (erro) return <AdminErrorState message={erro} />

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/rh/concursos" className="inline-flex items-center gap-1 text-sm text-admin-accent hover:underline">
          <MdArrowBack size={15} /> Voltar para Concursos
        </Link>
        <h1 className="text-lg font-bold text-admin-text mt-1">{concurso?.descricao}</h1>
        <p className="text-sm text-admin-text-faint">Concurso nº {concurso?.numero}/{concurso?.ano} — anexos</p>
      </div>

      {podeCriar(usuario, 'padrao') && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">Novo anexo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="descricao">Descrição</label>
                <input
                  id="descricao"
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="data">Data</label>
                <input
                  id="data"
                  type="date"
                  required
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="arquivo">Arquivo PDF</label>
              <input
                id="arquivo"
                type="file"
                required
                accept="application/pdf"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-admin-text-muted
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-admin-accent file:text-white
                  hover:file:bg-admin-accent-dark file:cursor-pointer file:transition-colors"
              />
            </div>

            {erroForm && <AdminErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar anexo'}
            </button>
          </form>
        </div>
      )}

      {anexos.length === 0 && <AdminEmptyState message="Nenhum anexo enviado." />}

      {anexos.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Descrição</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Data</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Arquivo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {anexos.map(a => (
                  <tr key={a.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{a.descricao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{a.data}</td>
                    <td className="p-3.5">
                      <Link
                        href={hrefDocumento(a.caminhoArquivo, a.descricao, { admin: true })}
                        className="inline-flex items-center gap-1 text-admin-accent hover:underline"
                      >
                        <MdVisibility size={15} /> Ver documento
                      </Link>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeExcluir(usuario, 'padrao') && (
                          <button
                            onClick={() => setIdParaExcluir(a.id)}
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

      <ConfirmDialog
        aberto={idParaExcluir !== null}
        titulo="Excluir anexo?"
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
