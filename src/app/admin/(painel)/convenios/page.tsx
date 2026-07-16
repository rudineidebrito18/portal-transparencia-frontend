'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { convenioService } from '@/modules/admin/convenios/convenio.service'
import { Convenio, ConvenioRequest } from '@/modules/admin/convenios/types'

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

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ConveniosAdminPage() {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<Convenio[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    convenioService
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

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

  async function excluir(id: number) {
    if (!confirm('Excluir este convênio? Essa ação não pode ser desfeita.')) return

    try {
      await convenioService.excluir(id)
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
    const request: ConvenioRequest = dados

    try {
      if (id) {
        await convenioService.atualizar(id, request, pdf)
      } else {
        await convenioService.criar(request, pdf)
      }
      setForm(null)
      setPdf(null)
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
        <h1 className="text-lg font-bold text-primary">Convênios</h1>

        {podeCriar(usuario, 'obras-repasses') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo convênio
          </button>
        )}
      </div>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar convênio' : 'Novo convênio'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <label className="block text-sm font-medium mb-1">Convenente</label>
                <input
                  required
                  value={form.convenente}
                  onChange={e => setForm({ ...form, convenente: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Objeto</label>
              <textarea
                required
                value={form.objeto}
                onChange={e => setForm({ ...form, objeto: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Interveniente</label>
              <input
                required
                value={form.internveniente}
                onChange={e => setForm({ ...form, internveniente: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de assinatura</label>
                <input
                  type="date"
                  required
                  value={form.dataAssinatura}
                  onChange={e => setForm({ ...form, dataAssinatura: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Início da vigência</label>
                <input
                  type="date"
                  required
                  value={form.inicioVigencia}
                  onChange={e => setForm({ ...form, inicioVigencia: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fim da vigência</label>
                <input
                  type="date"
                  required
                  value={form.fimVigencia}
                  onChange={e => setForm({ ...form, fimVigencia: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Valor do convênio</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorConvenio}
                  onChange={e => setForm({ ...form, valorConvenio: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor da contrapartida</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorContrapartida}
                  onChange={e => setForm({ ...form, valorContrapartida: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Valor do concedente</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={form.valorConcedente}
                  onChange={e => setForm({ ...form, valorConcedente: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                PDF do convênio (opcional{form.id && ' — mantém o atual se vazio'})
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={e => setPdf(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-text-secondary/70
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-primary file:text-white
                  hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
              />
              {pdf && <p className="text-xs text-text-secondary/70 mt-1">Selecionado: {pdf.name}</p>}
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
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhum convênio encontrado." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nº</th>
                <th className="p-3">Convenente</th>
                <th className="p-3">Vigência</th>
                <th className="p-3">Valor total</th>
                <th className="p-3">PDF</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(c => (
                <tr key={c.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{c.numero}</td>
                  <td className="p-3">{c.convenente}</td>
                  <td className="p-3">{c.inicioVigencia} a {c.fimVigencia}</td>
                  <td className="p-3">{formatarMoeda(c.valorConvenio)}</td>
                  <td className="p-3">
                    {c.caminhoPdf ? (
                      <a href={c.caminhoPdf} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-text-secondary/50">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'obras-repasses') && (
                      <button onClick={() => abrirEdicao(c)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'obras-repasses') && (
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
