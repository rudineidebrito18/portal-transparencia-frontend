import PageHeader from '@/components/PageHeader'
import PdfViewer from '@/components/ui/PdfViewer'

// TODO: substituir por /pdfs/diarias-legislacao.pdf (ou equivalente) quando o
// arquivo real estiver disponível — não há endpoint de backend pra esse recurso.
const PDF_SRC = '/test.pdf'

export default function DiariasLegislacao() {
  return (
    <div className="max-w-5xl mx-auto p-2">
      <PageHeader title="Diárias — Legislação e Valores" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Diárias — legislação e valores' }
        ]} />

      <PdfViewer src={PDF_SRC} titulo="Diárias — Legislação e Valores" />
    </div>
  )
}
