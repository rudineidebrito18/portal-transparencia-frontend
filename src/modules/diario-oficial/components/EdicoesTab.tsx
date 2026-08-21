import UltimaEdicaoDestaque from './UltimaEdicaoDestaque'
import DiarioOficialListView from './DiarioOficialListView'

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Junta o que já existia na página antes das abas (edição em destaque + lista com filtro/
// busca/paginação, que já cobre "Edição Atual"/"Edições Anteriores"/"Busca" do site de
// referência num só lugar) — vira a aba padrão de /diario-oficial. A busca por conteúdo
// (palavra-chave nos PDFs indexados) vive no campo "Busca por conteúdo" do card de filtros.
// Fase 4: Server Component — repassa searchParams pra DiarioOficialListView; UltimaEdicaoDestaque
// não depende de filtro nenhum (sempre a edição mais recente), não precisa da prop.
export default function EdicoesTab({ searchParams }: Props) {
  return (
    <div className="space-y-6">
      <UltimaEdicaoDestaque />
      <DiarioOficialListView searchParams={searchParams} />
    </div>
  )
}
