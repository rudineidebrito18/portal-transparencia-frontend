'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown }
  }
}

// Navegação client-side do App Router (Link/router.push, sem reload de página) faz o
// RootLayoutSwitch re-renderizar (ele usa usePathname()), o que re-executa o VLibrasWidget
// e recria o objeto passado pro dangerouslySetInnerHTML da <div vw> — confirmado com
// MutationObserver (Playwright, build de produção) que o React reseta o conteúdo real que
// o vlibras-plugin.js tinha injetado (ícone, painel) de volta pro template estático vazio,
// e as tags <script> substituídas não reexecutam (nenhuma request nova pro
// vlibras-plugin.js). Resultado: o botão desaparece ao trocar de página e só volta com
// reload completo. Os <script> síncronos do VLibrasWidget resolvem o carregamento inicial
// (ver aquele arquivo), mas não têm como reagir a navegações subsequentes — isso é
// inerentemente client-only, por isso o useEffect aqui é legítimo (não é o mesmo problema
// de timing do primeiro load).
//
// Só chamar `new Widget()` de novo NÃO basta — inspecionei o código-fonte do plugin
// (window.VLibras.Widget.toString()) e o construtor não popula o DOM na hora: ele
// registra `window.onload = () => { ...b.load()/m.load()... }` e só executa esse corpo
// quando o evento `load` do navegador dispara. Esse evento só acontece uma vez, no
// carregamento inicial — numa navegação client-side ele nunca dispara de novo, então o
// handler registrado nunca roda. Confirmado com Playwright: chamar só `new Widget()`
// deixa a `<div vw>` vazia; chamar `new Widget()` e então invocar `window.onload()` na
// mão dispara o mesmo corpo que o navegador chamaria, repopulando o botão/painel.
export default function VLibrasReinit() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (window.VLibras?.Widget) {
      new window.VLibras.Widget('https://vlibras.gov.br/app')
      if (typeof window.onload === 'function') window.onload(new Event('load'))
    }
  }, [pathname])

  return null
}
