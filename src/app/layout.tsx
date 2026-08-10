import { Viewport } from 'next'
import { Public_Sans } from 'next/font/google'
import RootLayoutSwitch from '@/layouts/RootLayoutSwitch'
import './globals.css'
import { ReactNode } from 'react'

// Self-hosted pelo Next (sem request externo em runtime, sem layout shift) — ver
// justificativa da escolha da fonte no comentário de --font-sans em globals.css.
const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Portal da Transparência',
  description: 'Acompanhe os gastos, licitações e contratos públicos.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={publicSans.variable}>
      <body className="font-sans text-text-secondary">
        <RootLayoutSwitch>
          {children}
        </RootLayoutSwitch>
      </body>
    </html>
  )
}
