'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { documentoRHService } from '../documentoRH.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const TerceirizadosControles = criarDocumentoGenericoControles({
  listar: params => documentoRHService.listar('terceirizados', params)
})
