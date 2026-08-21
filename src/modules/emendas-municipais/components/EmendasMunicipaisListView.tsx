import DocumentoGenericoListaServidor from '@/modules/shared/components/documento-generico/DocumentoGenericoListaServidor'
import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { emendasMunicipaisService } from '../emendas-municipais.service'
import { EmendasMunicipaisControles } from './EmendasMunicipaisControles'

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4: Server Component — busca no servidor via listarServidor. Ver
// src/modules/competencias/components/CompetenciasListView.tsx (padrão de referência).
export default async function EmendasMunicipaisListView({ searchParams }: Props) {
  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await emendasMunicipaisService.listarServidor('emenda-municipal', {
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  const origem = { label: 'Emendas Municipais', href: '/emendas-municipais' }

  return (
    <div className="space-y-6">
      <EmendasMunicipaisControles
        totalElements={resultado.totalElements}
        atualizadoEm={new Date().toISOString()}
        ordenacaoPadrao={ORDENACAO_PADRAO}
        nomeBaseArquivo="emendas-municipais"
      />

      <DocumentoGenericoListaServidor
        documentos={resultado.content}
        origem={origem}
        urlArquivo={id => emendasMunicipaisService.urlArquivo('emenda-municipal', id)}
      />

      <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
    </div>
  )
}
