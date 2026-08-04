'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    VLibras?: { Widget: new (url: string) => unknown }
  }
}

// Replica ao pé da letra o snippet oficial da documentação do VLibras — div + os dois
// scripts como filhos diretos e CONSECUTIVOS de <body>, nessa ordem exata:
//   <div vw>...</div>
//   <script src="...vlibras-plugin.js"></script>
//   <script>new window.VLibras.Widget(...)</script>
// Tentativas anteriores usando JSX (dangerouslySetInnerHTML) + next/script <Script>
// carregavam o arquivo com sucesso (confirmado na aba Network, HTTP 200) mas o botão
// nunca ficava com `position: fixed` (confirmado via getComputedStyle no navegador do
// usuário — vinha "static"). Suspeita: o próprio plugin localiza sua div-alvo via
// travessia de DOM relativa à posição do <script> (ex.: `previousElementSibling`), e o
// componente <Script> do Next.js não garante que o nó real do script fique exatamente
// na posição do JSX onde foi declarado — quebra esse tipo de lookup. Manipulação direta
// do DOM aqui elimina essa ambiguidade.
export default function VLibrasWidget() {
  useEffect(() => {
    // Guarda contra o Strict Mode do React (dev) montar/desmontar/montar de novo.
    if (document.querySelector('[vw]')) return

    const container = document.createElement('div')
    container.setAttribute('vw', '')
    container.className = 'enabled'
    container.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `
    document.body.appendChild(container)

    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.onload = () => {
      new window.VLibras!.Widget('https://vlibras.gov.br/app')
    }
    document.body.appendChild(script)
  }, [])

  return null
}
