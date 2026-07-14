export interface Concurso {
  id: number
  descricao: string
  numero: number
  ano: number
  dataAbertura: string
  dataInscricoes: string
  dataTerminoInscricoes: string
  // Nome do campo vem assim do backend (ConcursoResponseDto.validate) — é a data de
  // validade/prazo do concurso, não uma flag booleana.
  validate?: string
  resumo: string
}

export interface AnexoConcurso {
  id: number
  descricao: string
  data: string
  caminhoArquivo: string
}
