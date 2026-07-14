import Link from 'next/link'

import Breadcrumbs from '@/components/Breadcrumbs'
import Card from '@/components/ui/Card'

// Conteúdo estático — cobre os 5 itens da seção "LGPD e Governo Digital" do hub
// (nenhum tem endpoint de backend; são informativos/institucionais por natureza).
export default function Lgpd() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <Breadcrumbs
        items={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'LGPD e Governo Digital' }
        ]}
      />

      <h1 className="text-3xl font-bold mb-4 text-primary uppercase">
        LGPD e Governo Digital
      </h1>

      <div className="h-1 w-20 bg-secondary mb-6 rounded-full" />

      <div className="space-y-6">

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Proteção de Dados (LGPD)
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) estabelece regras sobre
            coleta, armazenamento, tratamento e compartilhamento de dados pessoais, impondo
            mais proteção e penalidades para o não cumprimento. A Prefeitura, como órgão
            público, trata dados pessoais apenas quando necessário para a execução de
            políticas públicas e prestação de serviços, respeitando os princípios de
            finalidade, necessidade e transparência previstos na lei.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Direitos do Titular de Dados
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Qualquer cidadão pode solicitar confirmação da existência de tratamento,
            acesso, correção, anonimização ou eliminação de dados pessoais desnecessários,
            entre outros direitos previstos na LGPD. Para exercer esses direitos ou tirar
            dúvidas sobre tratamento de dados pela Prefeitura, utilize os canais de{' '}
            <Link href="/esic" className="text-primary underline font-semibold">e-SIC</Link>{' '}
            ou{' '}
            <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Governo Digital — Lei Federal nº 14.129/2021
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            A Lei do Governo Digital estabelece princípios, regras e instrumentos para o
            aumento da eficiência da administração pública, com foco na digitalização de
            serviços públicos, simplificação de processos e uso de dados abertos para
            promover a transparência e a participação social.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Dados Abertos
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Dados abertos são dados públicos disponibilizados em formato que permite reuso,
            sem restrições de acesso, licença ou tecnologia proprietária. As seções deste
            Portal da Transparência são o principal canal de disponibilização de dados
            abertos da Prefeitura.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Pesquisa de Satisfação e Serviços Públicos
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Sugestões e avaliações sobre os serviços públicos municipais e sobre este portal
            podem ser enviadas a qualquer momento através do canal de{' '}
            <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>.
          </p>
        </Card>

      </div>
    </div>
  )
}
