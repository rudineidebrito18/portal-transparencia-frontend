// Replica ao pé da letra o snippet oficial do VLibras (o mesmo usado em gov.br) — div +
// os dois scripts como markup ESTÁTICO renderizado no HTML retornado pelo servidor, e
// não injetado via useEffect. Investigação anterior confirmou por que isso importa:
// com useEffect, a tag <script> só é criada depois que o bundle JS baixa, o React
// hidrata e o efeito roda — o "preload scanner" do navegador não vê scripts injetados
// via JS, então a busca do arquivo começa tarde e sem prioridade de rede, disputando
// conexão com todos os outros chunks/chamadas da SPA. Comparado ao HTML bruto do
// gov.br (que tem essa mesma div+scripts direto no markup do servidor), isso explica
// por que lá é consistente e aqui não era. Como <script src> sem async/defer bloqueia o
// parser, o navegador garante execução em ordem — vlibras-plugin.js roda e popula
// window.VLibras antes do segundo <script> (que chama Widget()) ser executado, sem
// precisar de onload/useEffect.
//
// Efeito colateral medido: como o script agora roda DURANTE o parse (antes da
// hidratação do React), ele já injeta <img>/style dentro da <div vw> antes do React
// comparar a árvore — gerando "Hydration failed" e o React descartando/recriando a
// subárvore (log capturado com Playwright). dangerouslySetInnerHTML + suppressHydrationWarning
// faz o React tratar o conteúdo dessa div como opaco (não compara filhos), eliminando o
// mismatch sem voltar a depender de useEffect.
export default function VLibrasWidget() {
  return (
    <>
      <div
        {...{ vw: '' }}
        className="enabled"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
            <div vw-access-button class="active"></div>
            <div vw-plugin-wrapper>
              <div class="vw-plugin-top-wrapper"></div>
            </div>
          `
        }}
      />
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- proposital: precisa bloquear
          o parser pra rodar em ordem com o script seguinte, sem depender de onload/useEffect */}
      <script src="https://vlibras.gov.br/app/vlibras-plugin.js" />
      {/*
        Tentei um atributo onerror="" nativo no <script> acima, mas o React descarta
        qualquer prop começando com "on" que não seja uma função (aviso: "Invalid event
        handler property"), então não tem como escapar isso via JSX. Em vez disso: como os
        dois <script> executam em ordem estrita (o de cima bloqueia o parser), se ele
        falhar (ad-blocker, firewall, CDN fora do ar) o `window.VLibras` fica undefined e
        o try/catch abaixo pega o erro que antes só acontecia em silêncio — o botão
        simplesmente não aparecia e nada acusava o motivo em lugar nenhum.
      */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              new window.VLibras.Widget('https://vlibras.gov.br/app');
            } catch (e) {
              console.error('[VLibras] Falha ao inicializar o widget — vlibras-plugin.js provavelmente não carregou (bloqueador de anúncios, firewall ou cdn.jsdelivr.net/vlibras.gov.br indisponível).', e);
            }
          `
        }}
      />
    </>
  )
}
