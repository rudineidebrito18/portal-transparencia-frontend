import Link from 'next/link'

import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'

// Conteúdo estático — a LAI e seu decreto de regulamentação são leis federais, não algo
// cadastrado pelo município; não há endpoint de backend pra esse recurso.
export default function RegulamentacaoLai() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Regulamentação da LAI" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Regulamentação da LAI' }
        ]} />

      <div className="space-y-6">

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Lei de Acesso à Informação (Lei nº 12.527/2011)
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            A LAI garante a qualquer pessoa, física ou jurídica, o direito de solicitar e
            receber informações públicas dos órgãos e entidades do poder público, sem
            necessidade de justificar o motivo do pedido. Ela também obriga os órgãos a
            divulgar proativamente informações de interesse coletivo, independentemente de
            solicitação — é essa exigência de transparência ativa que este portal cumpre.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Decreto nº 7.724/2012
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Regulamenta, no âmbito federal, os procedimentos para garantir o acesso à
            informação: prazos de resposta, hipóteses de sigilo, recursos em caso de
            negativa e a criação dos Serviços de Informação ao Cidadão (SIC). Estados e
            municípios seguem os mesmos princípios ao regulamentar a LAI em nível local.
          </p>
        </Card>

        <Card className="p-6" hoverable={false}>
          <h2 className="text-base font-bold text-primary uppercase mb-3">
            Como solicitar informações
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Se a informação que você procura não está disponível neste portal, você pode
            solicitá-la formalmente através do{' '}
            <Link href="/esic" className="text-primary underline font-semibold">e-SIC</Link>.
            Reclamações, denúncias e sugestões sobre os serviços do município podem ser
            registradas pela{' '}
            <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>.
          </p>
        </Card>

      </div>
    </div>
  )
}
