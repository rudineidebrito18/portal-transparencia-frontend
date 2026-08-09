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

const ITEM_CLASSNAME = 'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary text-left hover:bg-primary/5 transition-colors'

interface Props {
  altoContraste: boolean
  onAumentarFonte: () => void
  onDiminuirFonte: () => void
  onAlternarContraste: () => void
}

// Menu de acessibilidade: Sobre / Contraste / Aumentar / Diminuir / Libras / Mapa do
// site. Renderizado 2x por Header.tsx (topbar desktop + menu mobile, cada um visível só
// no seu breakpoint) — por isso `fonte`/`altoContraste` vêm de fora como props em vez de
// estado local: as duas instâncias são componentes React separados, cada uma com seu
// próprio useState, então estado local dessincronizava entre elas (ativar o contraste
// numa instância não atualizava a outra — usuário via a mesma opção como "inativa" ao
// trocar de desktop pra mobile e vice-versa, precisando desativar e reativar pra
// sincronizar de novo). Header.tsx é o dono único do estado agora, as duas instâncias só
// refletem ele. O widget do VLibras em si (div + script) mora em PublicLayout, não aqui;
// "Libras" aqui é só um link informativo pro site oficial do projeto, não interage com
// o widget.
export default function AcessibilidadeMenu({ altoContraste, onAumentarFonte, onDiminuirFonte, onAlternarContraste }: Props) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fecharAoClicarFora(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setAberto(false)
    }

    document.addEventListener('mousedown', fecharAoClicarFora)
    return () => document.removeEventListener('mousedown', fecharAoClicarFora)
  }, [])

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
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions --
          delegação de clique, não é um controle em si: fecha o painel quando QUALQUER
          item real (Link/button, todos focáveis e com seu próprio onClick) é ativado.
          Ativar um item por teclado (Enter/Espaço) já dispara um evento `click` nativo do
          navegador, que borbulha até aqui — funciona igual para mouse e teclado sem
          precisar de handler próprio neste div. */}
      <div
        onClick={() => setAberto(false)}
        className={`absolute right-0 top-full w-56 bg-white rounded-xl shadow-lg border border-border/10 overflow-hidden z-50
          ${aberto ? 'visible' : 'invisible group-hover:visible group-focus-within:visible'}`}
      >
        <p className="px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-text-secondary/60 bg-neutral-light">
          Acessibilidade
        </p>

        <div className="divide-y divide-border/10">
          <Link href="/acessibilidade" className={ITEM_CLASSNAME}>
            <MdInfoOutline size={18} className="shrink-0 text-primary" />
            Sobre
          </Link>

          <button
            type="button"
            onClick={onAlternarContraste}
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

          <button type="button" onClick={onAumentarFonte} className={ITEM_CLASSNAME}>
            <MdTextIncrease size={18} className="shrink-0 text-primary" />
            Aumentar
          </button>

          <button type="button" onClick={onDiminuirFonte} className={ITEM_CLASSNAME}>
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
