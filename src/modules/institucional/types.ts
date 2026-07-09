export interface ConteudoInstitucional {
  id: number
  titulo: string
  texto: string
  data: string
  ativo: boolean
}

export type RecursoInstitucional = 'noticias' | 'avisos'
