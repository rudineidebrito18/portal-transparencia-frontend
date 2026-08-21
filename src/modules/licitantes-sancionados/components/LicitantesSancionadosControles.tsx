'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { licitantesSancionadosService } from '../licitantesSancionados.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const LicitantesSancionadosControles = criarDocumentoGenericoControles({
  listar: params => licitantesSancionadosService.listar('licitantes-sancionados', params)
})
