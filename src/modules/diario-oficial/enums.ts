export enum TipoEdicaoDiario {
  EXECUTIVO = "EXECUTIVO",
  TERCEIROS = "TERCEIROS",
  EXTRAS = "EXTRAS",
  LEGISLATIVO = "LEGISLATIVO"
}

export const TipoEdicaoDiarioDescricao: Record<TipoEdicaoDiario, string> = {
  [TipoEdicaoDiario.EXECUTIVO]: "Executivo",
  [TipoEdicaoDiario.TERCEIROS]: "Terceiros",
  [TipoEdicaoDiario.EXTRAS]: "Edição Extra",
  [TipoEdicaoDiario.LEGISLATIVO]: "Legislativo"
}

export const TipoEdicaoDiarioStyle: Record<TipoEdicaoDiario, string> = {
  [TipoEdicaoDiario.EXECUTIVO]: "bg-blue-100 text-blue-700",
  [TipoEdicaoDiario.TERCEIROS]: "bg-gray-100 text-gray-600",
  [TipoEdicaoDiario.EXTRAS]: "bg-red-100 text-red-700",
  [TipoEdicaoDiario.LEGISLATIVO]: "bg-purple-100 text-purple-700"
}
