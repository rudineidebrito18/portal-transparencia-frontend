'use client'

import UltimaEdicaoDestaque from './UltimaEdicaoDestaque'
import DiarioOficialListView from './DiarioOficialListView'

// Junta o que já existia na página antes das abas (edição em destaque + lista com filtro/
// busca/paginação, que já cobre "Edição Atual"/"Edições Anteriores"/"Busca" do site de
// referência num só lugar) — vira a aba padrão de /diario-oficial. A busca por conteúdo
// (palavra-chave nos PDFs indexados) vive no campo "Busca por conteúdo" do card de filtros.
export default function EdicoesTab() {
  return (
    <div className="space-y-6">
      <UltimaEdicaoDestaque />
      <DiarioOficialListView />
    </div>
  )
}
