import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

// Endpoint novo, ainda não existe no backend (ver prompt-backend-licitacoes.md) — mesmo
// shape documento-genérico dos outros ~29 módulos (confirmado pelo print de referência:
// tabela Descrição/Data/Arquivo, sem colunas extras).
export const licitantesSancionadosService = criarServicoDocumentoGenerico<'licitantes-sancionados'>(
  'licitacoes'
)
