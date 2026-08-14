import PageHeader from '@/components/PageHeader'
import PlanejamentoGlossario from '@/modules/planejamento/components/PlanejamentoGlossario'

// Antes era um hub com abas (LDO/LOA/PPA/Plano Estratégico/RGA + este glossário) — cada
// documento agora tem rota própria (/ldo, /loa, /ppa, etc.), linkada direto do hub de
// Transparência. Esta página fica só com o glossário, que não tem equivalente nas outras.
export default function Planejamento() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Glossário de Planejamento" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Glossário de Planejamento' }
        ]} />

      <PlanejamentoGlossario />
    </div>
  )
}
