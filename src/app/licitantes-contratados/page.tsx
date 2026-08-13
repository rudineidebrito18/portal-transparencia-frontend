import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/PageHeader'
import PdfViewer from '@/components/ui/PdfViewer'
import { licitanteContratadoService } from '@/modules/licitantes-contratados/licitanteContratado.service'

// force-dynamic: sem isso o Next detecta que a página não usa nenhuma API dinâmica e
// pré-renderiza estático no build, congelando o fetch — uploads novos no admin não
// apareceriam até o próximo build. Precisa buscar o documento a cada request.
export const dynamic = 'force-dynamic'

// Sem listagem de propósito (decisão do usuário, 2026-08-13): o site legado leva direto
// pro PDF mais recente, sem cards/filtro/paginação como os outros módulos genéricos.
// Admin continua podendo subir/trocar o arquivo normalmente em /admin/modulos/licitantes-contratados.
export default async function LicitantesContratadosPage() {
  const pagina = await licitanteContratadoService.listar('licitantes-contratados', {
    sort: 'data,desc',
    size: 1
  })
  const documento = pagina.content[0]

  return (
    <div className="max-w-5xl mx-auto p-2">
      <PageHeader title="Relação de Licitantes Contratados" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Relação de Licitantes Contratados' }
        ]} />

      {documento ? (
        <PdfViewer src={documento.caminhoArquivo} titulo={documento.descricao} />
      ) : (
        <EmptyState message="Nenhum documento publicado ainda." />
      )}
    </div>
  )
}
