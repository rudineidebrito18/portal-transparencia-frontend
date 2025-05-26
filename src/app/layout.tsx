import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Portal da Transparência',
  description: 'Acompanhe os gastos, licitações e contratos públicos.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans text-gray-800">
        {children}
      </body>
    </html>
  )
}
