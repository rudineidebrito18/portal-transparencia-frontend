import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

// Mesmo shape documento-genérico dos outros ~30 módulos (Descrição/Data/Arquivo). A
// página pública não lista — mostra só o documento mais recente direto num PdfViewer,
// igual ao comportamento do site legado (decisão do usuário, 2026-08-13).
export const licitanteContratadoService = criarServicoDocumentoGenerico<'licitantes-contratados'>(
  'licitacoes'
)
