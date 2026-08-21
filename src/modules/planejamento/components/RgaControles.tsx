'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { planejamentoService } from '../planejamento.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const RgaControles = criarDocumentoGenericoControles({
  listar: params => planejamentoService.listar('rga', params)
})
