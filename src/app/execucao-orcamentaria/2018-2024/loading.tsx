import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function LoadingExecucaoOrcamentaria2018a2024() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Execução Orçamentária (2018 a 2024)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Execução Orçamentária (2018 a 2024)' }
        ]} />

      <Skeleton className="h-[88vh]" />
    </div>
  )
}
