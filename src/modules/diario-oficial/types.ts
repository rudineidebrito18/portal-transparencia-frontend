export interface EdicaoDiario {
  id: number
  numeroEdicao: number
  dataPublicacao: string
  tipo: string
  pathFile: string
  hash: string
}

export interface FiltroEdicaoDiario {
  // Busca por palavra-chave no conteúdo indexado (Meilisearch). Quando preenchido, a
  // listagem usa o endpoint de busca em vez do de filtro estruturado, mas combinada com
  // os demais filtros abaixo (tipo/número/datas) — não os descarta.
  termo?: string
  tipo?: string
  numeroEdicao?: number
  dataInicial?: string
  dataFinal?: string
}

// Mesmo shape usado pelo admin em src/modules/admin/diario-oficial/types.ts (que reexporta
// esse tipo) — GET /diario-oficial já é público (sem auth, confirmado via curl), só faltava
// um consumidor no site público. periodicidade/quemSomos ainda não existem no backend (ver
// STATUS.md/prompt-backend-diario-oficial.md) — ficam undefined até o backend implementar.
export interface DiarioOficialInfo {
  name: string
  issn: string
  email: string
  telefone: string
  editorChefe: string
  redacao: string
  endereco: string
  periodicidade?: string
  quemSomos?: string
  pathBrasao: string
  pathLogo: string
}

// GET /edicoes/{numero}/validar — endpoint público já existente no backend (destino do QR
// Code impresso na última página de cada edição), sem consumidor no front até agora.
export interface ValidacaoPublicaDiario {
  numeroEdicao: number
  dataPublicacao: string
  tipo: string
  assinadoDigitalmente: boolean
  dataAssinatura: string | null
  hash: string
  statusIndexacao: 'PENDENTE' | 'INDEXADO' | 'FALHOU'
}

// GET /edicoes/buscar-texto — resultado da busca por palavra-chave no conteúdo indexado
// (Meilisearch); trechoDestaque já vem com o termo marcado em <em> pelo motor de busca.
export interface ResultadoBuscaEdicaoDiario {
  id: number
  numeroEdicao: number
  tipo: string
  dataPublicacao: string
  // null quando o Meilisearch não devolve o campo _formatted (ver toResultadoDto no backend).
  trechoDestaque: string | null
}

// Edições anteriores à existência do sistema eletrônico (publicações físicas escaneadas) —
// recurso novo, endpoint ainda não existe no backend (ver prompt-backend-diario-oficial.md).
export interface EdicaoNaoEletronica {
  id: number
  volume: string
  descricao: string
  data: string
  tipo: string
  caminhoArquivo: string
}

export interface FiltroEdicaoNaoEletronica {
  descricao?: string
  tipo?: string
  dataInicial?: string
  dataFinal?: string
}
