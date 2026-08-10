'use client'

import { FormEvent, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { AuthProvider, useAuth } from '@/modules/auth/AuthContext'

function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErro(null)
    setEnviando(true)

    try {
      await login(email, senha)
      router.replace(searchParams.get('redirect') || '/admin')
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao entrar')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-bg admin-gradient-mesh p-4">
      <form
        onSubmit={handleSubmit}
        className="relative bg-admin-surface border border-admin-border-strong rounded-2xl shadow-admin-lg p-8 w-full max-w-sm"
      >
        <span className="inline-flex w-11 h-11 rounded-xl admin-gradient-accent items-center justify-center font-bold text-white shadow-admin-glow mb-4">
          PT
        </span>

        <h1 className="text-lg font-bold text-admin-text mb-1">Painel Administrativo</h1>
        <p className="text-sm text-admin-text-muted mb-6">Portal da Transparência</p>

        <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 mb-4 text-sm text-admin-text focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all"
        />

        <label className="block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 mb-4 text-sm text-admin-text focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all"
        />

        {erro && (
          <p className="text-sm text-admin-error bg-admin-error-light border border-admin-error/20 rounded-lg p-3 mb-4">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-2.5 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
        >
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthProvider>
  )
}
