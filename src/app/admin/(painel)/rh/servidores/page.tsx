'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'

import { usePageableResource } from '@/hooks/usePageableResource'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { servidorService } from '@/modules/admin/rh/servidor.service'
import { FiltroServidor, Servidor, ServidorRequest } from '@/modules/admin/rh/types'

interface FormState {
  id: number | null
  cpf: string
  name: string
  cargo: string
  unidadeId: number
  dataAdmissao: string
  cargaHoraria: number
}

const FORM_VAZIO: FormState = { id: null, cpf: '', name: '', cargo: '', unidadeId: 0, dataAdmissao: '', cargaHoraria: 40 }

export default function ServidoresAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroServidor & { page?: number; size?: number; sort?: string }) => servidorService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Servidor,
    FiltroServidor
  >({ fetchFunction, initialSort: 'name,asc' })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    unidadesService.listar().then(setUnidades).catch(() => {})
  }, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(s: Servidor) {
    setErroForm(null)
    setForm({
      id: s.id,
      cpf: s.cpf,
      name: s.name,
      cargo: s.cargo,
      unidadeId: s.unidade?.id ?? 0,
      dataAdmissao: s.dataAdmissao,
      cargaHoraria: s.cargaHoraria
    })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir este servidor? Essa ação não pode ser desfeita.')) return

    try {
      await servidorService.excluir(id)
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

    const dados: ServidorRequest = {
      cpf: form.cpf,
      name: form.name,
      cargo: form.cargo,
      unidade: { id: form.unidadeId },
      dataAdmissao: form.dataAdmissao,
      cargaHoraria: form.cargaHoraria
    }

    try {
      if (form.id) {
        await servidorService.atualizar(form.id, dados)
      } else {
        await servidorService.criar(dados)
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
        <h1 className="text-lg font-bold text-primary">Servidores</h1>

        {podeCriar(usuario, 'rh') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Novo servidor
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3" hoverable={false}>
        <input
          placeholder="CPF..."
          defaultValue={filtros.cpf ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cpf: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Nome..."
          defaultValue={filtros.name ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, name: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <input
          placeholder="Cargo..."
          defaultValue={filtros.cargo ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cargo: (e.target as HTMLInputElement).value || undefined }) }}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        />
        <select
          value={filtros.unidadeId ?? ''}
          onChange={e => setFiltros({ ...filtros, unidadeId: e.target.value ? Number(e.target.value) : undefined })}
          className="border border-border/30 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todas as unidades</option>
          {unidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-text-secondary/60">Admissão:</span>
          <input
            type="date"
            value={filtros.dataAdmissaoInicio ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAdmissaoInicio: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
          <span>até</span>
          <input
            type="date"
            value={filtros.dataAdmissaoFim ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAdmissaoFim: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar servidor' : 'Novo servidor'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">CPF</label>
                <input
                  required
                  value={form.cpf}
                  onChange={e => setForm({ ...form, cpf: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Cargo</label>
                <input
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidade</label>
                <select
                  required
                  value={form.unidadeId || ''}
                  onChange={e => setForm({ ...form, unidadeId: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="" disabled>Selecione...</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Data de admissão</label>
                <input
                  type="date"
                  required
                  value={form.dataAdmissao}
                  onChange={e => setForm({ ...form, dataAdmissao: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carga horária semanal</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={form.cargaHoraria}
                  onChange={e => setForm({ ...form, cargaHoraria: Number(e.target.value) })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhum servidor encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Cargo</th>
                <th className="p-3">Unidade</th>
                <th className="p-3">Admissão</th>
                <th className="p-3">Carga horária</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(s => (
                <tr key={s.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3">{s.cpf}</td>
                  <td className="p-3">{s.cargo}</td>
                  <td className="p-3">{s.unidade?.nome ?? '-'}</td>
                  <td className="p-3">{s.dataAdmissao}</td>
                  <td className="p-3">{s.cargaHoraria}h</td>
                  <td className="p-3 text-right space-x-2">
                    {podeEditar(usuario, 'rh') && (
                      <button onClick={() => abrirEdicao(s)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'rh') && (
                      <button onClick={() => excluir(s.id)} className="text-error hover:underline">
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
