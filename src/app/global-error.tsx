'use client'

import Link from 'next/link'
import { MdErrorOutline, MdRefresh } from 'react-icons/md'

import './globals.css'

// Next.js exige que este arquivo defina <html>/<body> próprios — ele substitui todo o
// root layout quando um erro escapa até a raiz, então não pode depender de
// RootLayoutSwitch/PublicLayout (que podem ser justamente o que quebrou).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="pt-BR">
      <body className="font-sans text-text-secondary">
        <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
          <div className="max-w-md w-full bg-white border border-border/30 rounded-2xl shadow-sm p-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center w-14 h-14 rounded-full bg-error-light text-error">
              <MdErrorOutline size={28} />
            </div>

            <h1 className="text-xl font-bold text-primary mb-2">Ocorreu um erro inesperado</h1>
            <p className="text-sm text-text-secondary/70 mb-6">
              Algo não funcionou como esperado. Você pode tentar novamente ou voltar para a
              página inicial.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => reset()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
              >
                <MdRefresh size={18} /> Tentar novamente
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-border/30 text-sm font-semibold text-text-secondary hover:bg-neutral-light transition-colors"
              >
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
