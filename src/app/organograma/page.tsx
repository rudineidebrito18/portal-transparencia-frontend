import PageHeader from '@/components/PageHeader'
import OrganogramaDiagrama from '@/components/OrganogramaDiagrama'

export default function Organograma() {
  return (
    <div className="max-w-5xl mx-auto p-2 overflow-x-auto">
      <PageHeader title="Organograma" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Organograma' }
        ]} />

      <OrganogramaDiagrama />
    </div>
  )
}
