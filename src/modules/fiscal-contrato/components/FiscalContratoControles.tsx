'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { fiscalContratoService } from '../fiscalContrato.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em src/modules/competencias/components/CompetenciasControles.tsx.
export const FiscalContratoControles = criarDocumentoGenericoControles({
  listar: params => fiscalContratoService.listar('fiscal-contratos', params)
})
