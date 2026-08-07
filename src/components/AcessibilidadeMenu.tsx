'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  MdAccessibility,
  MdCheck,
  MdContrast,
  MdInfoOutline,
  MdMap,
  MdRecordVoiceOver,
  MdTextDecrease,
  MdTextIncrease
} from 'react-icons/md'

const CHAVE_FONTE = 'acessibilidade-fonte'
const CHAVE_CONTRASTE = 'acessibilidade-alto-contraste'
const FONTE_MIN = 90
const FONTE_MAX = 130
const FONTE_PADRAO = 100
const PASSO = 10

const ITEM_CLASSNAME = 'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary text-left hover:bg-primary/5 transition-colors'

// Menu de acessibilidade da topbar: Sobre / Contraste / Aumentar / Diminuir / Libras /
// Mapa do site. O widget do VLibras em si (div + script) mora em PublicLayout, não aqui —
// esta topbar fica `hidden` em telas < lg, então o botão flutuante do VLibras (que já
// existe em qualquer lugar da página) segue invisível em mobile. "Libras" aqui é só um
// link informativo pro site oficial do projeto, não interage com o widget.
export default function AcessibilidadeMenu() {
  const [aberto, setAberto] = useState(false)
  const [fonte, setFonte] = useState(FONTE_PADRAO)
  const [altoContraste, setAltoContraste] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fonteSalva = Number(localStorage.getItem(CHAVE_FONTE))
    if (fonteSalva) {
      document.documentElement.style.fontSize = `${fonteSalva}%`
      setFonte(fonteSalva)
    }

    const contrasteSalvo = localStorage.getItem(CHAVE_CONTRASTE) === 'true'
    if (contrasteSalvo) {
      document.documentElement.classList.add('alto-contraste')
      setAltoContraste(true)
    }
  }, [])

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setAberto(false)
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

  function aplicarFonte(valor: number) {
    const novoValor = Math.min(FONTE_MAX, Math.max(FONTE_MIN, valor))
    document.documentElement.style.fontSize = `${novoValor}%`
    localStorage.setItem(CHAVE_FONTE, String(novoValor))
    setFonte(novoValor)
  }

  function alternarContraste() {
    const novoValor = !altoContraste
    document.documentElement.classList.toggle('alto-contraste', novoValor)
    localStorage.setItem(CHAVE_CONTRASTE, String(novoValor))
    setAltoContraste(novoValor)
  }

  return (
    <div ref={ref} className="relative group">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-label="Acessibilidade"
        aria-expanded={aberto}
        className="flex items-center gap-1 hover:underline"
      >
        <MdAccessibility /> Acessibilidade
      </button>

      {/* Abre no hover/foco (:group-hover/:group-focus-within, igual DropdownMenuItem.tsx)
          além do clique — `aberto` força visível pra manter aberto depois que o mouse sai
          e pra fechar-ao-clicar-fora continuar funcionando. `top-full` sem margem — um
          `mt-2` aqui criava uma faixa morta entre o botão e o painel: o mouse perdia o
          hover ao atravessar esse espaço vazio antes de chegar no painel, fechando o menu
          no meio do caminho. `onClick` no painel fecha ao clicar em qualquer item (bubbling,
          mesmo padrão de DropdownMenuItem.tsx) — os itens não precisam fechar cada um por
          conta própria. */}
      <div
        onClick={() => setAberto(false)}
        className={`absolute right-0 top-full w-56 bg-white rounded-xl shadow-lg border border-border/10 overflow-hidden z-50
          ${aberto ? 'visible' : 'invisible group-hover:visible group-focus-within:visible'}`}
      >
        <p className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60 bg-neutral-light">
          Acessibilidade
        </p>

        <div className="divide-y divide-border/10">
          <Link href="/acessibilidade" className={ITEM_CLASSNAME}>
            <MdInfoOutline size={18} className="shrink-0 text-primary" />
            Sobre
          </Link>

          <button
            type="button"
            onClick={alternarContraste}
            aria-pressed={altoContraste}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
              altoContraste ? 'bg-gray-900 text-white hover:bg-gray-800' : 'text-text-secondary hover:bg-primary/5'
            }`}
          >
            <MdContrast size={18} className={`shrink-0 ${altoContraste ? 'text-yellow-400' : 'text-primary'}`} />
            <span className="flex-1">Contraste</span>
            {altoContraste && (
              <span className="flex items-center gap-1 text-xs font-semibold text-yellow-400 shrink-0">
                <MdCheck size={16} /> Ativo
              </span>
            )}
          </button>

          <button type="button" onClick={() => aplicarFonte(fonte + PASSO)} className={ITEM_CLASSNAME}>
            <MdTextIncrease size={18} className="shrink-0 text-primary" />
            Aumentar
          </button>

          <button type="button" onClick={() => aplicarFonte(fonte - PASSO)} className={ITEM_CLASSNAME}>
            <MdTextDecrease size={18} className="shrink-0 text-primary" />
            Diminuir
          </button>

          <a
            href="https://www.vlibras.gov.br/"
            target="_blank"
            rel="noopener noreferrer"
            className={ITEM_CLASSNAME}
          >
            <MdRecordVoiceOver size={18} className="shrink-0 text-primary" />
            Libras
          </a>

          <Link href="/mapa-do-site" className={ITEM_CLASSNAME}>
            <MdMap size={18} className="shrink-0 text-primary" />
            Mapa do site
          </Link>
        </div>
      </div>
    </div>
  )
}
