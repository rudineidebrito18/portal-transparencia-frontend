import DocumentoGenericoListaServidor from '@/modules/shared/components/documento-generico/DocumentoGenericoListaServidor'
import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { educacaoService } from '../educacao.service'
import { RecursoEducacao } from '../types'
import EducacaoControles from './EducacaoControles'
import EducacaoTabs from './EducacaoTabs'

const CATEGORIAS: { recurso: RecursoEducacao; label: string }[] = [
  { recurso: 'lista-alunos', label: 'Lista de Alunos' },
  { recurso: 'lista-espera-creche', label: 'Lista de Espera - Creche' },
  { recurso: 'lista-solicitacao-matricula', label: 'Solicitações de Matrícula' },
  { recurso: 'planos', label: 'Plano Municipal de Educação' }
]

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

// Fase 4, variante com abas: mesmo padrão de Server Component + fetch no servidor dos módulos
// de recurso fixo, mas o recurso em si vem de ?categoria= — resolvido aqui (com fallback pra
// primeira aba se ausente/inválido) em vez de num useState client-side.
export default async function EducacaoView({ searchParams }: Props) {
  const categoriaParam = typeof searchParams.categoria === 'string' ? searchParams.categoria : undefined
  const aba = CATEGORIAS.find(c => c.recurso === categoriaParam)?.recurso ?? CATEGORIAS[0].recurso

  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await educacaoService.listarServidor(aba, {
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  const origem = { label: 'Educação', href: `/educacao?categoria=${aba}` }

  return (
    <div>
      <EducacaoTabs categorias={CATEGORIAS} abaAtiva={aba} />

      <div className="space-y-6">
        <EducacaoControles
          recurso={aba}
          totalElements={resultado.totalElements}
          atualizadoEm={new Date().toISOString()}
          ordenacaoPadrao={ORDENACAO_PADRAO}
          nomeBaseArquivo={`educacao-${aba}`}
        />

        <DocumentoGenericoListaServidor
          documentos={resultado.content}
          origem={origem}
          urlArquivo={id => educacaoService.urlArquivo(aba, id)}
        />

        <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
      </div>
    </div>
  )
}
