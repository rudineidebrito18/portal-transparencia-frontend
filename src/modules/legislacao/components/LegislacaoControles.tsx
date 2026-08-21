'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { legislacaoService } from '../legislacao.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const LegislacaoControles = criarDocumentoGenericoControles({
  listar: params => legislacaoService.listar('lei', params)
})
