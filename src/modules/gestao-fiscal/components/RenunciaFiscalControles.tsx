'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { renunciaFiscalService } from '../renunciaFiscal.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const RenunciaFiscalControles = criarDocumentoGenericoControles({
  listar: params => renunciaFiscalService.listar('renuncia-fiscal', params)
})
