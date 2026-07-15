'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import * as authService from './auth.service'
import { extrairEmailDoToken } from './jwt'
import { lerTokenCookie, limparTokenCookie, salvarTokenCookie } from './cookie'
import { Usuario } from './types'

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function montarUsuario(token: string): Promise<Usuario> {
  const email = extrairEmailDoToken(token)
  const { roles, id } = await authService.detectarPapeisEId(email)

  return { id, email, roles }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = lerTokenCookie()

    if (!token) {
      setCarregando(false)
      return
    }

    montarUsuario(token)
      .then(setUsuario)
      .finally(() => setCarregando(false))
  }, [])

  async function login(email: string, senha: string) {
    const { token } = await authService.login({ email, password: senha })
    salvarTokenCookie(token)
    setUsuario(await montarUsuario(token))
  }

  function logout() {
    limparTokenCookie()
    setUsuario(null)
    router.push('/admin/login')
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
  return context
}
