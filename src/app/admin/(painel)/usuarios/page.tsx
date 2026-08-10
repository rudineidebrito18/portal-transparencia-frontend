'use client'

import { FormEvent, useCallback, useState } from 'react'
import { MdArrowDownward, MdArrowUpward, MdBlock, MdCheckCircle } from 'react-icons/md'

import { usePageableResource } from '@/hooks/usePageableResource'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { Papel } from '@/modules/auth/types'
import AdminErrorState from '@/modules/admin/shared/AdminErrorState'
import AdminPagination from '@/modules/admin/shared/AdminPagination'
import ConfirmDialog from '@/modules/admin/shared/ConfirmDialog'
import { usuariosService } from '@/modules/admin/usuarios/usuarios.service'
import { UsuarioAdmin } from '@/modules/admin/usuarios/types'

const FORM_VAZIO = { email: '', password: '', role: 'ROLE_MANAGER' as Papel }

const classeInput =
  'border border-admin-border bg-admin-surface-2 rounded-lg px-3 py-2 text-sm text-admin-text focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'

export default function UsuariosPage() {
  const { usuario } = useAuth()

  const [versao, setVersao] = useState(0)
  const recarregar = () => setVersao(v => v + 1)
  const fetchFunction = useCallback(
    (params: { page?: number; size?: number; sort?: string }) => usuariosService.listar(params),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [versao]
  )

  const { data, loading, erro, pagina, totalPaginas, setPagina } = usePageableResource<UsuarioAdmin>({
    fetchFunction,
    initialSort: 'email,asc'
  })

  const [form, setForm] = useState(FORM_VAZIO)
  const [criando, setCriando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)
  const [paraDesativar, setParaDesativar] = useState<UsuarioAdmin | null>(null)
  const [desativando, setDesativando] = useState(false)

  if (!isAdministrador(usuario)) {
    return <AdminErrorState title="Acesso restrito" message="Apenas administradores podem gerenciar usuários." />
  }

  async function handleCriar(e: FormEvent) {
    e.preventDefault()
    setCriando(true)
    setErroForm(null)

    try {
      await usuariosService.criar(form)
      setForm(FORM_VAZIO)
      recarregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao criar usuário')
    } finally {
      setCriando(false)
    }
  }

  async function handleAlterarRole(u: UsuarioAdmin, novaRole: Papel) {
    try {
      await usuariosService.alterarRole(u.id, { role: novaRole })
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao alterar papel')
    }
  }

  async function confirmarDesativacao() {
    if (!paraDesativar) return

    setDesativando(true)
    try {
      await usuariosService.desativar(paraDesativar.id)
      setParaDesativar(null)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao desativar usuário')
    } finally {
      setDesativando(false)
    }
  }

  async function handleReativar(u: UsuarioAdmin) {
    try {
      await usuariosService.reativar(u.id)
      recarregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao reativar usuário')
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold text-admin-text">Gestão de Usuários</h1>

      <div className="rounded-2xl border border-admin-border bg-admin-surface p-5">
        <form onSubmit={handleCriar} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className={classeInput}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className={classeInput}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="role">
              Papel
            </label>
            <select
              id="role"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as Papel })}
              className={classeInput}
            >
              <option value="ROLE_MANAGER">Gerente</option>
              <option value="ROLE_ADMINISTRATOR">Administrador</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={criando}
            className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
          >
            {criando ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
        {erroForm && <AdminErrorState message={erroForm} className="mt-3 p-3" />}
      </div>

      {loading && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface h-40 animate-pulse" aria-hidden="true" />
      )}
      {erro && <AdminErrorState message={erro} />}

      {!loading && !erro && (
        <div className="rounded-2xl border border-admin-border bg-admin-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-admin-border text-left">
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">E-mail</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Papel</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint">Status</th>
                  <th className="p-3.5 text-xs font-semibold uppercase tracking-wide text-admin-text-faint text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.map(u => {
                  const propriaConta = u.id === usuario?.id
                  const ehAdmin = u.roles.includes('ROLE_ADMINISTRATOR')
                  return (
                    <tr key={u.id} className="border-t border-admin-border hover:bg-admin-surface-2/60 transition-colors">
                      <td className="p-3.5 text-admin-text">{u.email}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-admin-info-light text-admin-info">
                          {ehAdmin ? 'Administrador' : 'Gerente'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.ativo ? 'bg-admin-success-light text-admin-success' : 'bg-admin-surface-3 text-admin-text-faint'
                          }`}
                        >
                          <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${u.ativo ? 'bg-admin-success' : 'bg-admin-text-faint'}`} />
                          {u.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title={propriaConta ? 'Não é possível alterar a própria conta' : ehAdmin ? 'Rebaixar para Gerente' : 'Promover a Administrador'}
                            aria-label={ehAdmin ? 'Rebaixar para Gerente' : 'Promover a Administrador'}
                            disabled={propriaConta}
                            onClick={() => handleAlterarRole(u, ehAdmin ? 'ROLE_MANAGER' : 'ROLE_ADMINISTRATOR')}
                            className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-accent transition-colors disabled:opacity-30 disabled:pointer-events-none"
                          >
                            {ehAdmin ? <MdArrowDownward size={16} /> : <MdArrowUpward size={16} />}
                          </button>
                          {u.ativo ? (
                            <button
                              title={propriaConta ? 'Não é possível desativar a própria conta' : 'Desativar'}
                              aria-label="Desativar"
                              disabled={propriaConta}
                              onClick={() => setParaDesativar(u)}
                              className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-error transition-colors disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <MdBlock size={16} />
                            </button>
                          ) : (
                            <button
                              title="Reativar"
                              aria-label="Reativar"
                              onClick={() => handleReativar(u)}
                              className="p-1.5 rounded-md text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-success transition-colors"
                            >
                              <MdCheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AdminPagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />

      <ConfirmDialog
        aberto={paraDesativar !== null}
        titulo="Desativar usuário?"
        mensagem={`${paraDesativar?.email ?? 'Este usuário'} deixa de conseguir logar, mas o registro é mantido (não é excluído de fato).`}
        confirmarLabel="Desativar"
        perigoso
        carregando={desativando}
        onConfirmar={confirmarDesativacao}
        onCancelar={() => setParaDesativar(null)}
      />
    </div>
  )
}
