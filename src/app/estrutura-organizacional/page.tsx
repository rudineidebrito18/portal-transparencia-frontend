import PageHeader from '@/components/PageHeader'
import PdfViewer from '@/components/ui/PdfViewer'

// URL é fixa (recurso singleton, EstruturaOrganizacionalController) — não depende de ID.
// Se o admin ainda não fez upload, o backend responde 404 e o PdfViewer já mostra o
// estado de erro apropriado (HEAD check antes do iframe), sem precisar de lógica extra aqui.
const PDF_SRC = '/api/institucional/estrutura-organizacional/arquivo'

export default function EstruturaOrganizacional() {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <PageHeader title="Estrutura Organizacional" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Estrutura organizacional' }
        ]} />

      <PdfViewer src={PDF_SRC} titulo="Estrutura Organizacional" />
    </div>
  )
}
