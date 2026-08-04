import PageHeader from '@/components/PageHeader'
import PdfViewer from '@/components/ui/PdfViewer'

// TODO: substituir por /pdfs/estrutura-organizacional.pdf (ou equivalente) quando o
// arquivo real estiver disponível — não há endpoint de backend pra esse recurso.
const PDF_SRC = '/test.pdf'

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
