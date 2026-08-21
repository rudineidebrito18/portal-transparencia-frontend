import DocumentoGenericoListaServidor from '@/modules/shared/components/documento-generico/DocumentoGenericoListaServidor'
import DocumentoGenericoPaginacao from '@/modules/shared/components/documento-generico/DocumentoGenericoPaginacao'
import { extrairFiltrosDeSearchParamsServidor } from '@/modules/shared/utils/filtroDocumentoGenerico'
import { saudeService } from '../saude.service'
import { RecursoSaude } from '../types'
import SaudeControles from './SaudeControles'
import SaudeTabs from './SaudeTabs'

const CATEGORIAS: { recurso: RecursoSaude; label: string }[] = [
  { recurso: 'planos', label: 'Planos de Saúde' },
  { recurso: 'relatorios', label: 'Relatórios' },
  { recurso: 'medicamentos', label: 'Medicamentos de Alto Custo' },
  { recurso: 'unidade', label: 'Unidades de Saúde' }
]

// Módulos "quase genéricos" com campo de exercício próprio (padrão V28/item 23 do backlog) —
// mesma lista/motivo do DocumentoListView.tsx client que este arquivo substitui.
const RECURSOS_COM_EXERCICIO: RecursoSaude[] = ['planos', 'relatorios']

const ORDENACAO_PADRAO = 'data,desc'
const TAMANHO_PAGINA = 10

interface Props {
  searchParams: Record<string, string | string[] | undefined>
}

export default async function SaudeView({ searchParams }: Props) {
  const categoriaParam = typeof searchParams.categoria === 'string' ? searchParams.categoria : undefined
  const aba = CATEGORIAS.find(c => c.recurso === categoriaParam)?.recurso ?? CATEGORIAS[0].recurso
  const comExercicio = RECURSOS_COM_EXERCICIO.includes(aba)

  const pagina = Number(searchParams.page ?? 0)
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : ORDENACAO_PADRAO
  const filtros = extrairFiltrosDeSearchParamsServidor(searchParams)

  const resultado = await saudeService.listarServidor(aba, {
    ...filtros,
    page: pagina,
    size: TAMANHO_PAGINA,
    sort
  })

  const origem = { label: 'Saúde', href: `/saude?categoria=${aba}` }

  return (
    <div>
      <SaudeTabs categorias={CATEGORIAS} abaAtiva={aba} />

      <div className="space-y-6">
        <SaudeControles
          recurso={aba}
          comExercicio={comExercicio}
          totalElements={resultado.totalElements}
          atualizadoEm={new Date().toISOString()}
          ordenacaoPadrao={ORDENACAO_PADRAO}
          nomeBaseArquivo={`saude-${aba}`}
        />

        <DocumentoGenericoListaServidor
          documentos={resultado.content}
          origem={origem}
          urlArquivo={id => saudeService.urlArquivo(aba, id)}
        />

        <DocumentoGenericoPaginacao totalPaginas={resultado.totalPages} ordenacaoPadrao={ORDENACAO_PADRAO} />
      </div>
    </div>
  )
}
