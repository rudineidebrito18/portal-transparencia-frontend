'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { prestacaoContasService } from '../prestacaoContas.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const JulgamentoContasTceControles = criarDocumentoGenericoControles({
  listar: params => prestacaoContasService.listar('julgamento-contas-tce', params)
})
