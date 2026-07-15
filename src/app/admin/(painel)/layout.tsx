'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { AuthProvider, useAuth } from '@/modules/auth/AuthContext'
import AdminSidebar from '@/modules/admin/shared/AdminSidebar'

function PainelGuard({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth()
  const router = useRouter()

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-text-secondary text-sm">Carregando...</div>
  }

  // O middleware já barra sem cookie — isso cobre o caso de cookie presente
  // mas inválido/expirado (a sonda de papel em AuthContext falha e usuario
  // fica null; o interceptor de 401 em api.ts também redireciona nesse caso).
  if (!usuario) {
    router.replace('/admin/login')
    return null
  }

  return (
    <div className="flex min-h-screen bg-neutral">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  )
}

export default function PainelLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PainelGuard>{children}</PainelGuard>
    </AuthProvider>
  )
}
