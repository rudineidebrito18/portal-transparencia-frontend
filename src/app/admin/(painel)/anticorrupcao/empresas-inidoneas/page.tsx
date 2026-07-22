'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeExcluir } from '@/modules/auth/permissoes'
import { empresaInidoneaService } from '@/modules/admin/anticorrupcao/empresaInidonea.service'
import { EmpresaInidonea, EmpresaInidoneaRequest } from '@/modules/admin/anticorrupcao/types'

const FORM_VAZIO: EmpresaInidoneaRequest = {
  empresa: '',
  cnpj: '',
  descricao: '',
  status: '',
  data: ''
}

function formatarData(data?: string) {
  if (!data) return '—'
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')
}

export default function EmpresasInidoneasAdminPage() {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<EmpresaInidonea[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    empresaInidoneaService
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  const [form, setForm] = useState<EmpresaInidoneaRequest | null>(null)
  const [pdf, setPdf] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  async function excluir(id: number) {
    if (!confirm('Excluir este registro? Essa ação não pode ser desfeita.')) return

    try {
      await empresaInidoneaService.excluir(id)
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

    try {
      await empresaInidoneaService.criar(form, pdf)
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
        <h1 className="text-lg font-bold text-primary">Empresas Inidôneas ou Suspensas</h1>

        {podeCriar(usuario, 'anticorrupcao') && !form && (
          <button
            onClick={() => { setErroForm(null); setPdf(null); setForm(FORM_VAZIO) }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova empresa
          </button>
        )}
      </div>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">Nova empresa</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Empresa</label>
                <input
                  required
                  value={form.empresa}
                  onChange={e => setForm({ ...form, empresa: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  required
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <input
                  required
                  placeholder="Ex: Inidônea, Suspensa"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição da situação</label>
              <textarea
                required
                rows={2}
                value={form.descricao}
                onChange={e => setForm({ ...form, descricao: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data da ocorrência</label>
              <input
                type="date"
                required
                value={form.data}
                onChange={e => setForm({ ...form, data: e.target.value })}
                className="w-full md:w-1/3 border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">PDF (opcional)</label>
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
      {!loading && !erro && lista.length === 0 && <EmptyState message="Nenhuma empresa cadastrada." />}

      {!loading && !erro && lista.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Empresa</th>
                <th className="p-3">CNPJ</th>
                <th className="p-3">Status</th>
                <th className="p-3">Data</th>
                <th className="p-3">PDF</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(e => (
                <tr key={e.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{e.empresa}</td>
                  <td className="p-3">{e.cnpj}</td>
                  <td className="p-3">{e.status}</td>
                  <td className="p-3">{formatarData(e.data)}</td>
                  <td className="p-3">
                    {e.caminhoPdf ? (
                      <a href={e.caminhoPdf} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        Ver PDF
                      </a>
                    ) : (
                      <span className="text-text-secondary/50">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    {podeExcluir(usuario, 'anticorrupcao') && (
                      <button onClick={() => excluir(e.id)} className="text-error hover:underline">
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
