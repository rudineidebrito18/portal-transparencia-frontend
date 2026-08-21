import { criarServicoDocumentoGenerico } from '@/modules/shared/services/documentoGenerico.service'

export const fiscalContratoService = criarServicoDocumentoGenerico<'fiscal-contratos'>(
  // Path plural — o backend renomeou /api/licitacao/* para /api/licitacoes/* (breaking
  // change documentado no status.md do backend); o singular aqui era o que quebrava a
  // página pública com 404 (GET /licitacao/fiscal-contratos/filtro não existe).
  'licitacoes'
)
