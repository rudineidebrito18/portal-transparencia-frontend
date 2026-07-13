import { fakerPT_BR as faker } from '@faker-js/faker'

import { Page } from '../types/Page'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../types/DocumentoGenerico'
import { ordenar, paginar } from './mockUtils'

type ListParams = FiltroDocumentoGenerico & {
  page?: number
  size?: number
  sort?: string
}

const ANOS = [2020, 2021, 2022, 2023, 2024, 2025]

// Gera e cacheia documentos fake por recurso — reaproveitado por qualquer domínio
// cujo backend siga o padrão {id, data, descricao, caminhoArquivo} + GenericDocumentoFiltroDto
// (ex: prestacao-contas, planejamento).
export function criarMockDocumentoGenerico<TRecurso extends string>(
  descricoesPorRecurso: Record<TRecurso, string[]>,
  pastaArquivos: string,
  totalPorRecurso = 14
) {
  const cache = new Map<TRecurso, DocumentoGenerico[]>()

  function gerarDocumento(recurso: TRecurso, id: number): DocumentoGenerico {
    faker.seed(id + recurso.length * 1000)

    const ano = faker.helpers.arrayElement(ANOS)
    const mes = faker.helpers.arrayElement(['03', '04', '05', '06'])
    const titulo = faker.helpers.arrayElement(descricoesPorRecurso[recurso])

    return {
      id,
      data: `${ano}-${mes}-01`,
      descricao: `${titulo} - ${ano}`,
      caminhoArquivo: `/arquivos/${pastaArquivos}/${recurso}/${id}.pdf`
    }
  }

  function obterDocumentos(recurso: TRecurso): DocumentoGenerico[] {
    if (!cache.has(recurso)) {
      cache.set(recurso, Array.from({ length: totalPorRecurso }, (_, i) => gerarDocumento(recurso, i + 1)))
    }
    return cache.get(recurso)!
  }

  return {
    async listar(recurso: TRecurso, params: ListParams): Promise<Page<DocumentoGenerico>> {
      const { page = 0, size = 10, sort, ...filtros } = params

      let dados = obterDocumentos(recurso)

      if (filtros.descricao) {
        dados = dados.filter(d => d.descricao.toLowerCase().includes(String(filtros.descricao).toLowerCase()))
      }
      if (filtros.dataInicial) {
        const inicio = new Date(String(filtros.dataInicial)).getTime()
        dados = dados.filter(d => new Date(d.data).getTime() >= inicio)
      }
      if (filtros.dataFinal) {
        const fim = new Date(String(filtros.dataFinal)).getTime()
        dados = dados.filter(d => new Date(d.data).getTime() <= fim)
      }

      const ordenados = ordenar(
        dados as unknown as Record<string, unknown>[],
        sort ?? 'data,desc'
      ) as unknown as DocumentoGenerico[]

      return paginar(ordenados, page, size)
    }
  }
}
