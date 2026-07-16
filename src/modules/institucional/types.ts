export interface ConteudoInstitucional {
  id: number
  titulo: string
  texto: string
  data: string
  ativo: boolean
  // Só populado em Notícias — Avisos não tem imagem.
  imagemUrl?: string | null
}

export type RecursoInstitucional = 'noticias' | 'avisos'
