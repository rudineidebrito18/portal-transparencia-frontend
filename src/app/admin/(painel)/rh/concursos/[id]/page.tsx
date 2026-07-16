'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeExcluir } from '@/modules/auth/permissoes'
import { anexoConcursoService, concursoService } from '@/modules/admin/rh/concurso.service'
import { AnexoConcurso, Concurso } from '@/modules/admin/rh/types'

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

  async function excluirAnexo(id: number) {
    if (!confirm('Excluir este anexo? Essa ação não pode ser desfeita.')) return

    try {
      await anexoConcursoService.excluir(id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
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

  if (loading) return <Skeleton className="h-64" />
  if (erro) return <ErrorState message={erro} />

  return (
    <div className="space-y-4">
      <div>
        <Link href="/admin/rh/concursos" className="text-sm text-primary hover:underline">
          &larr; Voltar para Concursos
        </Link>
        <h1 className="text-lg font-bold text-primary mt-1">{concurso?.descricao}</h1>
        <p className="text-sm text-text-secondary/70">Concurso nº {concurso?.numero}/{concurso?.ano} — anexos</p>
      </div>

      {podeCriar(usuario, 'padrao') && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Novo anexo</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <input
                  required
                  value={descricao}
                  onChange={e => setDescricao(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={e => setData(e.target.value)}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arquivo PDF</label>
              <input
                type="file"
                required
                accept="application/pdf"
                onChange={e => setArquivo(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-text-secondary/70
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-primary file:text-white
                  hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
              />
            </div>

            {erroForm && <ErrorState message={erroForm} />}

            <button
              type="submit"
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
            >
              {enviando ? 'Enviando...' : 'Enviar anexo'}
            </button>
          </form>
        </Card>
      )}

      {anexos.length === 0 && <EmptyState message="Nenhum anexo enviado." />}

      {anexos.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3">Data</th>
                <th className="p-3">Arquivo</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {anexos.map(a => (
                <tr key={a.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{a.descricao}</td>
                  <td className="p-3">{a.data}</td>
                  <td className="p-3">
                    <a href={a.caminhoArquivo} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      Ver PDF
                    </a>
                  </td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'padrao') && (
                      <button onClick={() => excluirAnexo(a.id)} className="text-error hover:underline">
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
    </div>
  )
}
