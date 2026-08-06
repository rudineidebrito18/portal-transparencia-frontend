import { Viewport } from 'next'
import RootLayoutSwitch from '@/layouts/RootLayoutSwitch'
import './globals.css'
import { ReactNode } from 'react'

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
    <html lang="pt-BR">
      <body className="font-sans text-text-secondary">
        <RootLayoutSwitch>
          {children}
        </RootLayoutSwitch>
      </body>
    </html>
  )
}
