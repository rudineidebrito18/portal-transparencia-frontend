'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { emendasMunicipaisService } from '../emendas-municipais.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const EmendasMunicipaisControles = criarDocumentoGenericoControles({
  listar: params => emendasMunicipaisService.listar('emenda-municipal', params)
})
