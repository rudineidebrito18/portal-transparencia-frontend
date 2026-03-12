function parseData(data: string | Date): Date {
  if (data instanceof Date) return data

  // garante formato ISO correto caso venha com espaço
  const iso = data.includes("T") ? data : data.replace(" ", "T")

  return new Date(iso)
}

export function formatarData(data?: string | Date): string {
  if (!data) return "Não informado"

  if (typeof data === "string") {
    const partes = data.split("T")[0].split("-")

    if (partes.length === 3) {
      const [ano, mes, dia] = partes
      return `${dia}/${mes}/${ano}`
    }
  }

  const date = parseData(data)

  return date.toLocaleDateString("pt-BR")
}

export function formatarDataHora(data?: string | Date): string {
  if (!data) return "Não informado"

  const date = parseData(data)

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  })
}

export function dataDentroIntervalo(
  data: string | Date,
  inicio?: string,
  fim?: string
): boolean {

  const date = parseData(data)

  if (inicio) {
    const inicioDate = parseData(inicio)
    if (date < inicioDate) return false
  }

  if (fim) {
    const fimDate = parseData(fim)
    if (date > fimDate) return false
  }

  return true
}