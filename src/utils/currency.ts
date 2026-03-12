export function formatarMoeda(valor: number | string): string {
  const numero = typeof valor === 'string' ? Number(valor) : valor

  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  })
}