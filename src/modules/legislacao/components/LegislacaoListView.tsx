import DocumentoGenericoListaServidor from '@/modules/shared/components/documento-generico/DocumentoGenericoListaServidor'
import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { legislacaoService } from '../legislacao.service'
import { LegislacaoControles } from './LegislacaoControles'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — busca no servidor via listarServidor. Ver
// src/modules/competencias/components/CompetenciasListView.tsx (padrão de referência).
export default async function LegislacaoListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await legislacaoService.listarServidor('lei', {
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  const origem = { label: 'Legislação', href: '/legislacao' }

  return (
    <div className="space-y-6">
      <LegislacaoControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
        nomeBaseArquivo="legislacao"
      />

      <DocumentoGenericoListaServidor
        documentos={resultado.content}
        origem={origem}
        urlArquivo={id => legislacaoService.urlArquivo('lei', id)}
      />

      <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
