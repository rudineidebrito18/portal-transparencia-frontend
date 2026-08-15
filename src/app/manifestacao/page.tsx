import PageHeader from '@/components/PageHeader'
import FormularioOuvidoriaForm from '@/modules/ouvidoria/components/FormularioOuvidoriaForm'

// Só o formulário, sem o bloco de informações de atendimento (esse fica em /ouvidoria) —
// item 30 do backlog: "Ouvidoria" e "Formulário para Manifestação" eram dois itens de menu
// diferentes apontando pra mesma página; agora cada um tem sua própria rota.
export default function Manifestacao() {
  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Formulário para Manifestação" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Formulário para Manifestação' }
        ]} />

      <FormularioOuvidoriaForm />
    </div>
  )
}
