import Link from 'next/link'

import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'

const ATALHOS_TAMANHO_TEXTO = [
  { combinacao: 'Ctrl + (Windows/Linux) ou Cmd + (Mac)', acao: 'Aumentar o zoom da página' },
  { combinacao: 'Ctrl - (Windows/Linux) ou Cmd - (Mac)', acao: 'Diminuir o zoom da página' },
  { combinacao: 'Ctrl 0 (Windows/Linux) ou Cmd 0 (Mac)', acao: 'Restaurar o zoom padrão' }
]

export default function Acessibilidade() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Acessibilidade" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Acessibilidade' }
        ]} />

      <div className="space-y-6">

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Compromisso com a Acessibilidade
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Este portal busca seguir as diretrizes de acessibilidade do WCAG (Web Content
            Accessibility Guidelines) e o Decreto Federal nº 5.296/2004, que estabelece normas
            de acessibilidade para sites e serviços públicos. Trabalhamos para que qualquer
            pessoa, independentemente de limitações visuais, motoras ou auditivas, consiga
            navegar e encontrar as informações que procura.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Widget de Acessibilidade
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            No canto inferior esquerdo de qualquer página deste portal, um botão flutuante
            permite ajustar o tamanho do texto e ativar o modo de alto contraste. As
            preferências ficam salvas no seu navegador e são aplicadas automaticamente nas
            próximas visitas.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Atalhos de Teclado
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            Além do widget de acessibilidade do portal, o navegador oferece atalhos nativos
            para ajustar o tamanho do texto em qualquer site:
          </p>
          <div className="space-y-2">
            {ATALHOS_TAMANHO_TEXTO.map(item => (
              <div key={item.combinacao} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm">
                <span className="font-mono font-semibold text-primary bg-primary/10 px-2 py-1 rounded w-fit">
                  {item.combinacao}
                </span>
                <span className="text-text-secondary/70">{item.acao}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-text-secondary leading-relaxed mt-4">
            Este portal também disponibiliza um link de <strong>&quot;Saltar para o
            conteúdo&quot;</strong>, visível ao navegar com a tecla Tab a partir do topo de
            qualquer página — permite ir direto ao conteúdo principal sem passar por todo o
            menu de navegação.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            VLibras — Tradução para Libras
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Este portal integra o VLibras, suíte de ferramentas do Governo Federal que traduz
            conteúdo em Português para Língua Brasileira de Sinais (Libras). O ícone azul
            flutuante no canto inferior direito da tela abre o tradutor.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Encontrou um problema de acessibilidade?
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Se encontrar alguma barreira de acessibilidade neste portal, registre uma
            manifestação pela nossa{' '}
            <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>.
          </p>
        </Card>

      </div>
    </div>
  )
}
