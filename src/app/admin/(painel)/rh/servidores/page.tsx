'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { MdEdit, MdDeleteOutline } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import AdminEmptyState from '@/modules/admin/shared/AdminEmptyState'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { useAuth } from '@/modules/auth/AuthContext'
import { podeCriar, podeEditar, podeExcluir } from '@/modules/auth/permissoes'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade } from '@/modules/admin/geral/types'
import { servidorService } from '@/modules/admin/rh/servidor.service'
import { FiltroServidor, Servidor, ServidorRequest, StatusServidor } from '@/modules/admin/rh/types'

interface FormState {
  id: number | null
  cpf: string
  name: string
  cargo: string
  unidadeId: number
  dataAdmissao: string
  cargaHoraria: number
  status: StatusServidor
}

const FORM_VAZIO: FormState = { id: null, cpf: '', name: '', cargo: '', unidadeId: 0, dataAdmissao: '', cargaHoraria: 40, status: 'ATIVO' }

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

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
    unidadesService.listar({ size: 200, sort: 'nome,asc' }).then(p => setUnidades(p.content)).catch(() => {})
  }, [])

  const [form, setForm] = useState<FormState | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [idParaExcluir, setIdParaExcluir] = useState<number | null>(null)
  const [excluindo, setExcluindo] = useState(false)

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
      cargaHoraria: s.cargaHoraria,
      status: s.status
    })
  }

  async function confirmarExclusao() {
    if (idParaExcluir === null) return

    setExcluindo(true)
    try {
      await servidorService.excluir(idParaExcluir)
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

    const dados: ServidorRequest = {
      cpf: form.cpf,
      name: form.name,
      cargo: form.cargo,
      unidade: { id: form.unidadeId },
      dataAdmissao: form.dataAdmissao,
      cargaHoraria: form.cargaHoraria,
      status: form.status
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-admin-text">Servidores</h1>

        {podeCriar(usuario, 'rh') && (
          <button
            onClick={abrirCriacao}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all"
          >
            + Novo servidor
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-4 flex flex-wrap gap-3">
        <input
          placeholder="CPF..."
          defaultValue={filtros.cpf ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cpf: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="Nome..."
          defaultValue={filtros.name ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, name: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <input
          placeholder="Cargo..."
          defaultValue={filtros.cargo ?? ''}
          onKeyDown={e => { if (e.key === 'Enter') setFiltros({ ...filtros, cargo: (e.target as HTMLInputElement).value || undefined }) }}
          className={`${classeInput} w-auto`}
        />
        <select
          value={filtros.unidadeId ?? ''}
          onChange={e => setFiltros({ ...filtros, unidadeId: e.target.value ? Number(e.target.value) : undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Todas as unidades</option>
          {unidades.map(u => (
            <option key={u.id} value={u.id}>{u.nome}</option>
          ))}
        </select>
        <select
          value={filtros.status ?? ''}
          onChange={e => setFiltros({ ...filtros, status: (e.target.value || undefined) as StatusServidor | undefined })}
          className={`${classeInput} w-auto`}
        >
          <option value="">Ativos e desligados</option>
          <option value="ATIVO">Ativos</option>
          <option value="DESLIGADO">Desligados</option>
        </select>
        <div className="flex items-center gap-2 text-sm text-admin-text-muted">
          <span>Admissão:</span>
          <input
            type="date"
            value={filtros.dataAdmissaoInicio ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAdmissaoInicio: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
          <span>até</span>
          <input
            type="date"
            value={filtros.dataAdmissaoFim ?? ''}
            onChange={e => setFiltros({ ...filtros, dataAdmissaoFim: e.target.value || undefined })}
            className={`${classeInput} w-auto`}
          />
        </div>
      </div>

      {form && (
        <div className="rounded-2xl border border-admin-border-strong bg-admin-surface-2 p-5 shadow-admin-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="font-semibold text-sm text-admin-text">{form.id ? 'Editar servidor' : 'Novo servidor'}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="cpf">CPF</label>
                <input
                  id="cpf"
                  required
                  value={form.cpf}
                  onChange={e => setForm({ ...form, cpf: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="name">Nome</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={classeInput}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className={classeLabel} htmlFor="cargo">Cargo</label>
                <input
                  id="cargo"
                  required
                  value={form.cargo}
                  onChange={e => setForm({ ...form, cargo: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="unidadeId">Unidade</label>
                <select
                  id="unidadeId"
                  required
                  value={form.unidadeId || ''}
                  onChange={e => setForm({ ...form, unidadeId: Number(e.target.value) })}
                  className={classeInput}
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
                <label className={classeLabel} htmlFor="dataAdmissao">Data de admissão</label>
                <input
                  id="dataAdmissao"
                  type="date"
                  required
                  value={form.dataAdmissao}
                  onChange={e => setForm({ ...form, dataAdmissao: e.target.value })}
                  className={classeInput}
                />
              </div>
              <div>
                <label className={classeLabel} htmlFor="cargaHoraria">Carga horária semanal</label>
                <input
                  id="cargaHoraria"
                  type="number"
                  min={1}
                  required
                  value={form.cargaHoraria}
                  onChange={e => setForm({ ...form, cargaHoraria: Number(e.target.value) })}
                  className={classeInput}
                />
              </div>
            </div>

            <div>
              <label className={classeLabel} htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as StatusServidor })}
                className={`${classeInput} md:w-60`}
              >
                <option value="ATIVO">Ativo</option>
                <option value="DESLIGADO">Desligado</option>
              </select>
              <p className="text-xs text-admin-text-faint mt-1">
                Desligar preserva o histórico de folha de pagamento — excluir o cadastro é bloqueado enquanto houver folha lançada.
              </p>
            </div>

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
                onClick={() => setForm(null)}
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
      {!loading && !erro && data.length === 0 && <AdminEmptyState message="Nenhum servidor encontrado." />}

      {!loading && !erro && data.length > 0 && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Nome</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">CPF</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Cargo</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Unidade</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Admissão</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Carga horária</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(s => (
                  <tr key={s.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                    <td className="p-3.5 font-semibold text-admin-text">{s.name}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{s.cpf}</td>
                    <td className="p-3.5 text-admin-text-muted">{s.cargo}</td>
                    <td className="p-3.5 text-admin-text-muted">{s.unidade?.nome ?? '-'}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{s.dataAdmissao}</td>
                    <td className="p-3.5 text-admin-text-muted tabular-nums">{s.cargaHoraria}h</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === 'DESLIGADO' ? 'bg-admin-error-light text-admin-error' : 'bg-admin-success-light text-admin-success'}`}>
                        {s.status === 'DESLIGADO' ? 'Desligado' : 'Ativo'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {podeEditar(usuario, 'rh') && (
                          <button
                            onClick={() => abrirEdicao(s)}
                            aria-label="Editar"
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors"
                          >
                            <MdEdit size={16} />
                          </button>
                        )}
                        {podeExcluir(usuario, 'rh') && (
                          <button
                            onClick={() => setIdParaExcluir(s.id)}
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
        titulo="Excluir servidor?"
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
