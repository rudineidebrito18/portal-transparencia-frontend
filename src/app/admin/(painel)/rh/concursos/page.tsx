'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { concursoService } from '@/modules/admin/rh/concurso.service'
import { Concurso, ConcursoRequest } from '@/modules/admin/rh/types'

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

  const [lista, setLista] = useState<Concurso[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    concursoService
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

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
      carregar()
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
      carregar()
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
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum concurso encontrado." />}

      {!loading && !erro && lista.length > 0 && (
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
              {lista.map(c => (
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
    </div>
  )
}
