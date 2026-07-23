'use client'

import { FormEvent, useCallback, useState } from 'react'
import Link from 'next/link'

import { usePageableResource } from '@/hooks/usePageableResource'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { FiltroUnidade, Unidade, UnidadeRequest } from '@/modules/admin/geral/types'

interface FormState {
  id: number | null
  nome: string
  cnpj: string
  telefone: string
  email: string
  horarioAtendimento: string
  endereco: string
  atribuicoes: string
  gestorNome: string
  gestorCargo: string
  gestorVerificado: boolean
  dataInicio: string
  dataFim: string
}

const FORM_VAZIO: FormState = {
  id: null,
  nome: '',
  cnpj: '',
  telefone: '',
  email: '',
  horarioAtendimento: '',
  endereco: '',
  atribuicoes: '',
  gestorNome: '',
  gestorCargo: '',
  gestorVerificado: false,
  dataInicio: '',
  dataFim: ''
}

export default function UnidadesAdminPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: FiltroUnidade & { page?: number; size?: number; sort?: string }) => unidadesService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina, filtros, setFiltros } = usePageableResource<
    Unidade,
    FiltroUnidade
  >({ fetchFunction, initialSort: 'nome,asc' })

  const [form, setForm] = useState<FormState | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function abrirCriacao() {
    setErroForm(null)
    setFoto(null)
    setForm(FORM_VAZIO)
  }

  function abrirEdicao(u: Unidade) {
    setErroForm(null)
    setFoto(null)
    setForm({
      id: u.id,
      nome: u.nome,
      cnpj: u.cnpj ?? '',
      telefone: u.telefone ?? '',
      email: u.email ?? '',
      horarioAtendimento: u.horarioAtendimento ?? '',
      endereco: u.endereco ?? '',
      atribuicoes: u.atribuicoes ?? '',
      gestorNome: u.gestorNome ?? '',
      gestorCargo: u.gestorCargo ?? '',
      gestorVerificado: u.gestorVerificado ?? false,
      dataInicio: u.dataInicio ?? '',
      dataFim: u.dataFim ?? ''
    })
  }

  async function excluir(id: number) {
    if (!confirm('Excluir esta unidade? Essa ação não pode ser desfeita.')) return

    try {
      await unidadesService.excluir(id)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form) return

    if (form.dataInicio && form.dataFim && form.dataInicio > form.dataFim) {
      setErroForm('A data de criação não pode ser depois da data de extinção.')
      return
    }

    setSalvando(true)
    setErroForm(null)

    const { id, ...dados } = form
    const request: UnidadeRequest = {
      ...dados,
      dataInicio: dados.dataInicio || undefined,
      dataFim: dados.dataFim || undefined
    }

    try {
      if (id) {
        await unidadesService.atualizar(id, request, foto)
      } else {
        await unidadesService.criar(request, foto)
      }

      setForm(null)
      setFoto(null)
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
        <h1 className="text-lg font-bold text-primary">Unidades</h1>

        {podeCriar(usuario, 'geral') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            + Nova unidade
          </button>
        )}
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-end" hoverable={false}>
        <div>
          <label className="block text-xs font-medium mb-1">Buscar por nome</label>
          <input
            placeholder="Buscar por nome..."
            defaultValue={filtros.nome ?? ''}
            onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, nome: (e.target as HTMLInputElement).value || undefined }) }}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm w-full md:w-80"
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Vigente em</label>
          <input
            type="date"
            value={filtros.vigencia ?? ''}
            onChange={e => setFiltros({ ...filtros, vigencia: e.target.value || undefined })}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        {filtros.vigencia && (
          <button
            onClick={() => setFiltros({ ...filtros, vigencia: undefined })}
            className="text-sm text-primary hover:underline pb-2"
          >
            Limpar filtro de vigência
          </button>
        )}
      </Card>

      {form && (
        <Card className="p-4" hoverable={false}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="font-semibold text-sm">{form.id ? 'Editar unidade' : 'Nova unidade'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  required
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNPJ</label>
                <input
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={e => setForm({ ...form, telefone: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Horário de atendimento</label>
              <input
                value={form.horarioAtendimento}
                onChange={e => setForm({ ...form, horarioAtendimento: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Endereço</label>
              <input
                value={form.endereco}
                onChange={e => setForm({ ...form, endereco: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Atribuições</label>
              <textarea
                value={form.atribuicoes}
                onChange={e => setForm({ ...form, atribuicoes: e.target.value })}
                className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Gestor atual</label>
                <input
                  value={form.gestorNome}
                  onChange={e => setForm({ ...form, gestorNome: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cargo do gestor</label>
                <input
                  value={form.gestorCargo}
                  onChange={e => setForm({ ...form, gestorCargo: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.gestorVerificado}
                onChange={e => setForm({ ...form, gestorVerificado: e.target.checked })}
              />
              Cadastro do gestor verificado
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de criação do órgão (opcional)
                </label>
                <input
                  type="date"
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Data de extinção do órgão (opcional)
                </label>
                <input
                  type="date"
                  min={form.dataInicio || undefined}
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                  className="w-full border border-border/30 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Foto do gestor {form.id && '(opcional — mantém a atual se vazio)'}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFoto(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-text-secondary/70
                  file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0
                  file:text-sm file:font-semibold file:bg-primary file:text-white
                  hover:file:bg-primary-dark file:cursor-pointer file:transition-all"
              />
              {foto && <p className="text-xs text-text-secondary/70 mt-1">Selecionada: {foto.name}</p>}
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
      {!loading && !erro && data.length === 0 && <EmptyState message="Nenhuma unidade encontrada." />}

      {!loading && !erro && data.length > 0 && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Gestor atual</th>
                <th className="p-3">Contato</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.map(u => (
                <tr key={u.id} className="border-t border-border/20">
                  <td className="p-3 font-semibold">{u.nome}</td>
                  <td className="p-3">
                    {u.gestorNome ? (
                      <>
                        {u.gestorNome} {u.gestorCargo && `— ${u.gestorCargo}`}
                        {u.gestorVerificado && <Badge className="bg-success/10 text-success ml-2">Verificado</Badge>}
                      </>
                    ) : (
                      <span className="text-text-secondary/50">-</span>
                    )}
                  </td>
                  <td className="p-3">{u.telefone || u.email || '-'}</td>
                  <td className="p-3 text-right space-x-2">
                    <Link href={`/admin/geral/unidades/${u.id}`} className="text-primary hover:underline">
                      Detalhes
                    </Link>
                    {podeEditar(usuario, 'geral') && (
                      <button onClick={() => abrirEdicao(u)} className="text-primary hover:underline">
                        Editar
                      </button>
                    )}
                    {podeExcluir(usuario, 'geral') && (
                      <button onClick={() => excluir(u.id)} className="text-error hover:underline">
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
