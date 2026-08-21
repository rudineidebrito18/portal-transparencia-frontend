import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { transferenciasRealizadasService } from '../convenio.service'
import ConvenioListaServidor from './ConvenioListaServidor'
import { TransferenciasRealizadasControles } from './TransferenciasRealizadasControles'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — mesma ideia de CompetenciasListView (padrão de referência).
export default async function TransferenciasRealizadasListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await transferenciasRealizadasService.listarServidor({
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  return (
    <div className="space-y-6">
      <TransferenciasRealizadasControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        nomeBaseArquivo="convenios-transferencias-realizadas"
        ordenacaoPadrao={ORDENACAO_PADRAO}
      />

      <ConvenioListaServidor
        documentos={resultado.content}
        emptyMessage="Nenhuma transferência voluntária realizada encontrada."
        urlArquivo={id => transferenciasRealizadasService.urlArquivo(id)}
      />

      <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
