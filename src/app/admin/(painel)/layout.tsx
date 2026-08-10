'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AuthProvider, useAuth } from '@/modules/auth/AuthContext'
import AdminSidebar from '@/modules/admin/shared/AdminSidebar'
import AdminTopbar from '@/modules/admin/shared/AdminTopbar'

const CHAVE_SIDEBAR_COLAPSADA = 'admin-sidebar-colapsada'

function PainelGuard({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth()
  const router = useRouter()

  // Preferência de colapso persistida (mesmo padrão já usado pra fonte/alto-contraste
  // do site público) — sem isso, cada navegação de página reabriria a sidebar cheia.
  const [colapsada, setColapsada] = useState(false)

  useEffect(() => {
    setColapsada(localStorage.getItem(CHAVE_SIDEBAR_COLAPSADA) === 'true')
  }, [])

  function alternarColapso() {
    setColapsada(prev => {
      const novoValor = !prev
      localStorage.setItem(CHAVE_SIDEBAR_COLAPSADA, String(novoValor))
      return novoValor
    })
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-admin-bg text-admin-text-muted text-sm">
        Carregando...
      </div>
    )
  }

  // O middleware já barra sem cookie — isso cobre o caso de cookie presente
  // mas inválido/expirado (a sonda de papel em AuthContext falha e usuario
  // fica null; o interceptor de 401 em api.ts também redireciona nesse caso).
  if (!usuario) {
    router.replace('/admin/login')
    return null
  }

  return (
    <div className="flex h-screen bg-admin-bg overflow-hidden">
      <AdminSidebar colapsada={colapsada} onExpandir={() => { if (colapsada) alternarColapso() }} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar colapsada={colapsada} onToggleColapsada={alternarColapso} />
        <main className="flex-1 p-6 overflow-y-auto overflow-x-hidden admin-gradient-mesh">
          {children}
        </main>
      </div>
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
