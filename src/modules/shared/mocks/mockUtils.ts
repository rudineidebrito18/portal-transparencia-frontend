import { Page } from '../types/Page'

export function criarErroNaoEncontrado(mensagem: string) {
  const erro = new Error(mensagem) as Error & { status?: number }
  erro.status = 404
  return erro
}

export function ordenar<T extends Record<string, unknown>>(dados: T[], sort?: string): T[] {
  if (!sort) return dados

  const [campo, direcao] = sort.split(',')
  if (!campo) return dados

  return [...dados].sort((a, b) => {
    const valorA = a[campo] ?? ''
    const valorB = b[campo] ?? ''

    if (valorA < valorB) return direcao === 'desc' ? 1 : -1
    if (valorA > valorB) return direcao === 'desc' ? -1 : 1
    return 0
  })
}

export function paginar<T>(dados: T[], page = 0, size = 10): Page<T> {
  const start = page * size
  const end = start + size

  return {
    content: dados.slice(start, end),
    totalPages: Math.ceil(dados.length / size) || 0,
    totalElements: dados.length,
    number: page,
    size
  }
}
