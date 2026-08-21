import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { transferenciasRecebidasService } from '../convenio.service'
import ConvenioListaServidor from './ConvenioListaServidor'
import { TransferenciasRecebidasControles } from './TransferenciasRecebidasControles'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de CompetenciasListView (padrão de referência).
export default async function TransferenciasRecebidasListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await transferenciasRecebidasService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <TransferenciasRecebidasControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        nomeBaseArquivo="convenios-transferencias-recebidas"
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <ConvenioListaServidor
        documentos={resultado.content}
        emptyMessage="Nenhuma transferência voluntária recebida encontrada."
        urlArquivo={id => transferenciasRecebidasService.urlArquivo(id)}
      />

      <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
