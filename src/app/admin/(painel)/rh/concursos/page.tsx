'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'

import { usePageableResource } from '@/hooks/usePageableResource'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
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

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(c: Concurso) {
    setErroForm(null)
    setForm({ ...c })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este concurso? Essa ação não pode ser desfeita.')) return

    try {
      await concursoService.excluir(id)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-primary">Concursos e Seleções Públicas</h1>

        {podeCriar(usuario, 'padrao') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo concurso
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <input
          type="number"
          placeholder="Número..."
          defaultValue={filtros.numero ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, numero: Number((e.target as HTMLInputElement).value) || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm w-32"
        />
        <input
          type="number"
          placeholder="Ano..."
          defaultValue={filtros.ano ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, ano: Number((e.target as HTMLInputElement).value) || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm w-32"
        />
        <input
          placeholder="Descrição..."
          defaultValue={filtros.descricao ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, descricao: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">Abertura de:</span>
          <input
            type="date"
            value={filtros.dataAberturaInicial ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAberturaInicial: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">até:</span>
          <input
            type="date"
            value={filtros.dataAberturaFinal ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAberturaFinal: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar concurso' : 'Novo concurso'}</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <input
                required
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.numero}
                  onChange={e => setForm({ ...form, numero: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ano</label>
                <input
                  type="number"
                  required
                  value={form.ano}
                  onChange={e => setForm({ ...form, ano: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de abertura</label>
                <input
                  type="date"
                  required
                  value={form.dataAbertura}
                  onChange={e => setForm({ ...form, dataAbertura: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Validade</label>
                <input
                  type="date"
                  required
                  value={form.validate}
                  onChange={e => setForm({ ...form, validate: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Início das inscrições</label>
                <input
                  type="date"
                  required
                  value={form.dataInscricoes}
                  onChange={e => setForm({ ...form, dataInscricoes: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Término das inscrições</label>
                <input
                  type="date"
                  required
                  value={form.dataTerminoInscricoes}
                  onChange={e => setForm({ ...form, dataTerminoInscricoes: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Resumo</label>
              <textarea
                required
                value={form.resumo}
                onChange={e => setForm({ ...form, resumo: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                rows={3}
              />
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
                onClick={() => setForm(null)}
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhum concurso encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Descrição</th>
                <th className="p-3">Nº/Ano</th>
                <th className="p-3">Inscrições</th>
                <th className="p-3">Validade</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(c => (
                <tr key={c.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{c.descricao}</td>
                  <td className="p-3">{c.numero}/{c.ano}</td>
                  <td className="p-3">{c.dataInscricoes} a {c.dataTerminoInscricoes}</td>
                  <td className="p-3">{c.validate}</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/admin/rh/concursos/${c.id}`} className="text-primary hover:underline">
                      Anexos
                    </Link>
                    {podeEditar(usuario, 'padrao') && (
                      <button onClick={() => abrirEdicao(c)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'padrao') && (
                      <button onClick={() => excluir(c.id)} className="text-error hover:underline">
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
