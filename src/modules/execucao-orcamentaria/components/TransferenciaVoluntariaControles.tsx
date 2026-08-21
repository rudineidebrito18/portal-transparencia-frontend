'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { execucaoOrcamentariaService } from '../execucaoOrcamentaria.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const TransferenciaVoluntariaControles = criarDocumentoGenericoControles({
  listar: params => execucaoOrcamentariaService.listar('transferencia-voluntaria', params)
})
