'use client'

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

import PublicLayout from './PublicLayout'

// O painel admin (/admin/*) tem seu próprio shell (sidebar/topbar, ver
// src/app/admin/(painel)/layout.tsx) e não deve herdar Header/Footer do site
// público. Layout raiz do Next.js (src/app/layout.tsx) envolve tudo, então
// esse switch decide aqui em vez de duplicar <html>/<body> com route groups.
export default function RootLayoutSwitch({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) return <>{children}</>

  return <PublicLayout>{children}</PublicLayout>
}
