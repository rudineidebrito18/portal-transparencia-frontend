import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingExecucaoOrcamentariaEmendasParlamentares() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Execução Orçamentária (Emendas Parlamentares)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Emendas parlamentares', href: '/emendas-parlamentares' },
          { label: 'Execução orçamentária' }
        ]} />

      <Skeleton className="h-[88vh]" />
    </div>
  )
}
