export interface ImagemNoticia {
  id: number
  url: string
  principal: boolean
}

export interface ConteudoInstitucional {
  id: number
  titulo: string
  texto: string
  data: string
  ativo: boolean
  // Só populado em Notícias — Avisos não tem imagem.
  imagens?: ImagemNoticia[]
}

export type RecursoInstitucional = 'noticias' | 'avisos'

export interface FiltroConteudoInstitucional {
  titulo?: string
  dataInicial?: string
  dataFinal?: string
}
