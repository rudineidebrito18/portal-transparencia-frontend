'use client'

import { useEffect, useRef } from 'react'
import { MdWarningAmber } from 'react-icons/md'

interface Props {
  aberto: boolean
  titulo: string
  mensagem: string
  confirmarLabel?: string
  cancelarLabel?: string
  perigoso?: boolean
  carregando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

// Substitui o `confirm()` nativo do navegador (usado em GenericCrudPage.tsx e nas
// telas bespoke) — nativo não é estilizável, não respeita o design system e trava
// automação de teste (ver STATUS.md, seção de pegadinhas do ambiente). Genérico o
// bastante pra qualquer fluxo de confirmação do painel, não só exclusão.
export default function ConfirmDialog({
  aberto,
  titulo,
  mensagem,
  confirmarLabel = 'Confirmar',
  cancelarLabel = 'Cancelar',
  perigoso = false,
  carregando = false,
  onConfirmar,
  onCancelar
}: Props) {
  const botaoCancelarRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return

    botaoCancelarRef.current?.focus()

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancelar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, onCancelar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onCancelar}
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-titulo"
        aria-describedby="confirm-dialog-mensagem"
        className="relative w-full max-w-sm rounded-2xl border border-admin-border-strong bg-admin-surface-2 shadow-admin-lg p-6 animate-fade-in"
      >
        <span
          className={`flex items-center justify-center w-11 h-11 rounded-xl mb-4 ${
            perigoso ? 'bg-admin-error-light text-admin-error' : 'bg-admin-info-light text-admin-info'
          }`}
        >
          <MdWarningAmber size={22} aria-hidden="true" />
        </span>

        <h2 id="confirm-dialog-titulo" className="text-base font-bold text-admin-text mb-1.5">
          {titulo}
        </h2>
        <p id="confirm-dialog-mensagem" className="text-sm text-admin-text-muted leading-relaxed mb-6">
          {mensagem}
        </p>

        <div className="flex justify-end gap-2">
          <button
            ref={botaoCancelarRef}
            onClick={onCancelar}
            disabled={carregando}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-colors disabled:opacity-60"
          >
            {cancelarLabel}
          </button>
          <button
            onClick={onConfirmar}
            disabled={carregando}
            className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 ${
              perigoso ? 'bg-admin-error hover:brightness-110' : 'admin-gradient-accent hover:brightness-110'
            }`}
          >
            {carregando ? 'Aguarde...' : confirmarLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
