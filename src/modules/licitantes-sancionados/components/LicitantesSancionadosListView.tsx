import DocumentoGenericoListaServidor from '@/modules/shared/components/documento-generico/DocumentoGenericoListaServidor'
import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { licitantesSancionadosService } from '../licitantesSancionados.service'
import { LicitantesSancionadosControles } from './LicitantesSancionadosControles'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — busca no servidor via listarServidor. Ver
// src/modules/competencias/components/CompetenciasListView.tsx (padrão de referência).
export default async function LicitantesSancionadosListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await licitantesSancionadosService.listarServidor('licitantes-sancionados', {
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  const origem = { label: 'Licitantes e/ou Contratados Sancionados', href: '/licitantes-sancionados' }

  return (
    <div className="space-y-6">
      <LicitantesSancionadosControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
        nomeBaseArquivo="licitantes-sancionados"
      />

      <DocumentoGenericoListaServidor
        documentos={resultado.content}
        origem={origem}
        urlArquivo={id => licitantesSancionadosService.urlArquivo('licitantes-sancionados', id)}
      />

      <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
