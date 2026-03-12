export function formatarData(data: string | Date): string {
  if (!data) return ''

  const date = new Date(data)

  return date.toLocaleDateString('pt-BR')
}

export function formatarDataHora(data: string | Date): string {
  if (!data) return ''

  const date = new Date(data)

  return date.toLocaleString('pt-BR')
}

export function dataDentroIntervalo(
  data: string | Date,
  inicio?: string,
  fim?: string
): boolean {

  const date = new Date(data)

  if (inicio && date < new Date(inicio)) return false
  if (fim && date > new Date(fim)) return false

  return true
}