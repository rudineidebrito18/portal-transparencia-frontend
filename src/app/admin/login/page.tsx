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
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-border/30 rounded-xl shadow-sm p-8 w-full max-w-sm"
      >
        <h1 className="text-lg font-bold text-primary mb-1">Painel Administrativo</h1>
        <p className="text-sm text-text-secondary/70 mb-6">Portal da Transparência</p>

        <label className="block text-sm font-semibold mb-1" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-border/30 rounded-lg px-3 py-2 mb-4 text-sm"
        />

        <label className="block text-sm font-semibold mb-1" htmlFor="senha">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          required
          value={senha}
          onChange={e => setSenha(e.target.value)}
          className="w-full border border-border/30 rounded-lg px-3 py-2 mb-4 text-sm"
        />

        {erro && (
          <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg p-3 mb-4">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all disabled:opacity-60"
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
