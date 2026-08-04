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
// esta topbar fica `hidden` em telas < lg, e um <div style="display:none"> remove a
// subárvore inteira do DOM renderizado (mesmo com position:fixed no CSS injetado pelo
// plugin), então o botão flutuante do VLibras nunca aparecia em mobile. "Libras" aqui só
// clica no botão nativo do widget (que já existe em qualquer lugar da página).
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

  function abrirLibras() {
    const botaoVLibras = document.querySelector<HTMLElement>('[vw-access-button]')
    botaoVLibras?.click()
    setAberto(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-label="Acessibilidade"
        aria-expanded={aberto}
        className="flex items-center gap-1 hover:underline"
      >
        <MdAccessibility /> Acessibilidade
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-border/10 overflow-hidden z-50">
          <p className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-text-secondary/60 bg-neutral-light">
            Acessibilidade
          </p>

          <div className="divide-y divide-border/10">
            <Link href="/acessibilidade" onClick={() => setAberto(false)} className={ITEM_CLASSNAME}>
              <MdInfoOutline size={18} className="shrink-0 text-primary" />
              Sobre
            </Link>

            <button type="button" onClick={alternarContraste} aria-pressed={altoContraste} className={ITEM_CLASSNAME}>
              <MdContrast size={18} className="shrink-0 text-primary" />
              <span className="flex-1">Contraste</span>
              {altoContraste && (
                <span className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
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

            <button type="button" onClick={abrirLibras} className={ITEM_CLASSNAME}>
              <MdRecordVoiceOver size={18} className="shrink-0 text-primary" />
              Libras
            </button>

            <Link href="/mapa-do-site" onClick={() => setAberto(false)} className={ITEM_CLASSNAME}>
              <MdMap size={18} className="shrink-0 text-primary" />
              Mapa do site
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
