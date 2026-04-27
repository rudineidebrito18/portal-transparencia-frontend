import { Licitacao } from '@/interfaces/licitacao/Licitacao'
import { Page } from '@/types/Page'
import { licitacoesMock } from './licitacaoMock'

type Params = {
  page?: number
  size?: number
  sort?: string
} & Record<string, unknown>

export const listarLicitacoesMock = async (
  params: Params
): Promise<Page<Licitacao>> => {

  const { page = 0, size = 10, sort, ...filtros } = params

  let data = [...licitacoesMock]

  if (filtros.numeroInstrumento) {
    data = data.filter(item =>
      item.numeroInstrumento.includes(String(filtros.numeroInstrumento))
    )
  }

  if (filtros.objeto) {
    data = data.filter(item =>
      item.objeto?.toLowerCase().includes(
        String(filtros.objeto).toLowerCase()
      )
    )
  }

  if (filtros.tipo) {
    data = data.filter(item =>
      item.tipoProcedimento === filtros.tipo
    )
  }

  if (filtros.status) {
    data = data.filter(item =>
      item.status === filtros.status
    )
  }

  if (filtros.ano !== undefined && filtros.ano !== '') {
    data = data.filter(item =>
      item.ano === Number(filtros.ano)
    )
  }

  if (filtros.covid !== undefined && filtros.covid !== '') {
    const isCovid = String(filtros.covid) === 'true'
    data = data.filter(item => item.covid === isCovid)
  }

  if (filtros.dataPublicacaoInicio) {
    const inicio = new Date(String(filtros.dataPublicacaoInicio)).getTime()
    data = data.filter(item => new Date(item.dataPublicacao).getTime() >= inicio)
  }

  if (filtros.dataPublicacaoFim) {
    const fim = new Date(String(filtros.dataPublicacaoFim)).getTime()
    data = data.filter(item => new Date(item.dataPublicacao).getTime() <= fim)
  }

  if (sort) {
    const parts = sort.split(',')
    if (parts.length === 2) {
      const campo = parts[0] as keyof Licitacao
      const direcao = parts[1] as 'asc' | 'desc'

      data.sort((a: Licitacao, b: Licitacao) => {
        const valorA = a[campo] ?? ''
        const valorB = b[campo] ?? ''

        if (valorA < valorB) return direcao === 'asc' ? -1 : 1
        if (valorA > valorB) return direcao === 'asc' ? 1 : -1
        return 0
      })
    }
  }

  const start = page * size
  const end = start + size
  const paginated = data.slice(start, end)

  return {
    content: paginated,
    totalPages: Math.ceil(data.length / size),
    totalElements: data.length,
    number: page,
    size
  }
}