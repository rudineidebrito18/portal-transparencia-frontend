import DocumentoGenericoListaServidor from '@/modules/shared/components/documento-generico/DocumentoGenericoListaServidor'
import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { competenciasService } from '../competencias.service'
import { CompetenciasControles } from './CompetenciasControles'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — busca acontece aqui (no servidor, via listarServidor), não mais
// num useEffect client-side. Página/ordenação/filtro continuam vivendo na URL (searchParams),
// só que agora quem lê é o próprio servidor a cada navegação, em vez de um hook client
// disparando um fetch depois do primeiro paint. Serve de padrão de referência pros outros
// módulos que usam o mesmo criarServicoDocumentoGenerico (ver Fase 4 do plano).
export default async function CompetenciasListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await competenciasService.listarServidor('competencias', {
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  const origem = { label: 'Competências', href: '/competencias' }

  return (
    <div className="space-y-6">
      <CompetenciasControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
        nomeBaseArquivo="competencias"
      />

      <DocumentoGenericoListaServidor
        documentos={resultado.content}
        origem={origem}
        urlArquivo={id => competenciasService.urlArquivo('competencias', id)}
      />

      <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
