import GestaoFiscalGlossario from '@/modules/gestao-fiscal/components/GestaoFiscalGlossario'

import PageHeader from '@/components/PageHeader'

export default function GlossarioGestaoFiscalPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="O que é isso? (Gestão Fiscal)" breadcrumbItems={[
        { label: 'Transparência', href: '/transparencia' },
        { label: 'O que é isso? (Gestão Fiscal)' }
      ]} />

      <GestaoFiscalGlossario />
    </div>
  )
}
