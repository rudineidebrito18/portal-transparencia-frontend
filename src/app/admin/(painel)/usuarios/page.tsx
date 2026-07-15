'use client'

import { FormEvent, useEffect, useState } from 'react'

import Card from '@/components/ui/Card'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/modules/auth/AuthContext'
import { isAdministrador } from '@/modules/auth/permissoes'
import { Papel } from '@/modules/auth/types'
import { usuariosService } from '@/modules/admin/usuarios/usuarios.service'
import { UsuarioAdmin } from '@/modules/admin/usuarios/types'

const FORM_VAZIO = { email: '', password: '', role: 'ROLE_MANAGER' as Papel }

export default function UsuariosPage() {
  const { usuario } = useAuth()

  const [lista, setLista] = useState<UsuarioAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const [form, setForm] = useState(FORM_VAZIO)
  const [criando, setCriando] = useState(false)
  const [erroForm, setErroForm] = useState<string | null>(null)

  function carregar() {
    setLoading(true)
    setErro(null)
    usuariosService
      .listar()
      .then(setLista)
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao carregar usuários'))
      .finally(() => setLoading(false))
  }

  useEffect(carregar, [])

  if (!isAdministrador(usuario)) {
    return <ErrorState title="Acesso restrito" message="Apenas administradores podem gerenciar usuários." />
  }

  async function handleCriar(e: FormEvent) {
    e.preventDefault()
    setCriando(true)
    setErroForm(null)

    try {
      await usuariosService.criar(form)
      setForm(FORM_VAZIO)
      carregar()
    } catch (e: unknown) {
      setErroForm(e instanceof Error ? e.message : 'Erro ao criar usuário')
    } finally {
      setCriando(false)
    }
  }

  async function handleAlterarRole(u: UsuarioAdmin, novaRole: Papel) {
    try {
      await usuariosService.alterarRole(u.id, { role: novaRole })
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao alterar papel')
    }
  }

  async function handleDesativar(u: UsuarioAdmin) {
    if (!confirm(`Desativar o usuário ${u.email}? Ele deixa de conseguir logar, mas o registro é mantido (não é excluído de fato).`)) return

    try {
      await usuariosService.desativar(u.id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao desativar usuário')
    }
  }

  async function handleReativar(u: UsuarioAdmin) {
    try {
      await usuariosService.reativar(u.id)
      carregar()
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : 'Erro ao reativar usuário')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-primary">Gestão de Usuários</h1>

      <Card className="p-4" hoverable={false}>
        <form onSubmit={handleCriar} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="border border-border/30 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="border border-border/30 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Papel</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value as Papel })}
              className="border border-border/30 rounded-lg px-3 py-2 text-sm"
            >
              <option value="ROLE_MANAGER">Gerente</option>
              <option value="ROLE_ADMINISTRATOR">Administrador</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={criando}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
          >
            {criando ? 'Criando...' : 'Criar usuário'}
          </button>
        </form>
        {erroForm && <ErrorState message={erroForm} className="mt-3 p-3" />}
      </Card>

      {loading && <Skeleton className="h-40" />}
      {erro && <ErrorState message={erro} />}

      {!loading && !erro && (
        <Card className="overflow-x-auto" hoverable={false}>
          <table className="w-full text-sm">
            <thead className="bg-neutral-light text-left">
              <tr>
                <th className="p-3">E-mail</th>
                <th className="p-3">Papel</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(u => {
                const propriaConta = u.id === usuario?.id
                return (
                  <tr key={u.id} className="border-t border-border/20">
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <Badge className="bg-primary/10 text-primary">
                        {u.roles.includes('ROLE_ADMINISTRATOR') ? 'Administrador' : 'Gerente'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={u.ativo ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        title={propriaConta ? 'Não é possível alterar a própria conta' : undefined}
                        disabled={propriaConta}
                        onClick={() =>
                          handleAlterarRole(u, u.roles.includes('ROLE_ADMINISTRATOR') ? 'ROLE_MANAGER' : 'ROLE_ADMINISTRATOR')
                        }
                        className="text-primary hover:underline disabled:text-text-secondary/40 disabled:cursor-not-allowed disabled:no-underline"
                      >
                        {u.roles.includes('ROLE_ADMINISTRATOR') ? 'Rebaixar p/ Gerente' : 'Promover a Admin'}
                      </button>
                      {u.ativo ? (
                        <button
                          title={propriaConta ? 'Não é possível desativar a própria conta' : undefined}
                          disabled={propriaConta}
                          onClick={() => handleDesativar(u)}
                          className="text-error hover:underline disabled:text-text-secondary/40 disabled:cursor-not-allowed disabled:no-underline"
                        >
                          Desativar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReativar(u)}
                          className="text-success hover:underline"
                        >
                          Reativar
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
