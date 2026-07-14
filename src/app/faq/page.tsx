import Link from 'next/link'
import { MdExpandMore } from 'react-icons/md'

import Breadcrumbs from '@/components/Breadcrumbs'
import Card from '@/components/ui/Card'

// Conteúdo estático — sem endpoint de backend pra FAQ. Perguntas genéricas sobre
// transparência/LAI; ajustar/expandir livremente conforme dúvidas reais dos cidadãos.
const PERGUNTAS: { pergunta: string; resposta: React.ReactNode }[] = [
  {
    pergunta: 'O que é o Portal da Transparência?',
    resposta: (
      <>
        É o canal oficial onde a Prefeitura publica informações sobre receitas, despesas,
        licitações, contratos, servidores e demais dados de interesse público, em cumprimento
        à Lei de Acesso à Informação (Lei nº 12.527/2011) e à Lei de Responsabilidade Fiscal.
      </>
    )
  },
  {
    pergunta: 'O que é a Lei de Acesso à Informação (LAI)?',
    resposta: (
      <>
        A LAI (Lei nº 12.527/2011) garante a qualquer pessoa o direito de solicitar informações
        públicas aos órgãos do governo, sem precisar justificar o motivo do pedido. Os órgãos
        têm prazo legal para responder.
      </>
    )
  },
  {
    pergunta: 'Não encontrei a informação que procurava no portal. O que faço?',
    resposta: (
      <>
        Você pode fazer um pedido formal de informação através do{' '}
        <Link href="/esic" className="text-primary underline font-semibold">e-SIC</Link>{' '}
        (Sistema Eletrônico do Serviço de Informação ao Cidadão).
      </>
    )
  },
  {
    pergunta: 'Como faço uma reclamação, denúncia ou sugestão?',
    resposta: (
      <>
        Use o canal da{' '}
        <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>{' '}
        municipal, disponível também nesta página de Transparência.
      </>
    )
  },
  {
    pergunta: 'Preciso me identificar para pedir uma informação?',
    resposta: (
      <>
        A LAI não exige justificativa para o pedido, mas alguns canais podem solicitar dados
        de identificação e contato para viabilizar o envio da resposta.
      </>
    )
  },
  {
    pergunta: 'Com que frequência os dados do portal são atualizados?',
    resposta: (
      <>
        Cada seção segue a periodicidade definida pela legislação aplicável (diária, mensal,
        bimestral, anual, conforme o tipo de informação).
      </>
    )
  }
]

export default function Faq() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Perguntas frequentes' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">Perguntas Frequentes</h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <div className="space-y-3">
        {PERGUNTAS.map(({ pergunta, resposta }) => (
          <Card key={pergunta} className="overflow-hidden" hoverable={false}>
            <details className="group">
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-text-secondary hover:text-primary transition-colors">
                {pergunta}
                <MdExpandMore
                  size={20}
                  className="shrink-0 transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="px-5 pb-4 text-sm text-text-secondary/80 leading-relaxed">
                {resposta}
              </div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  )
}
