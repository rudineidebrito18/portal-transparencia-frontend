'use client'

import { criarConvenioControles } from './ConvenioControles'
import { transferenciasRecebidasService } from '../convenio.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em CompetenciasControles.tsx.
export const TransferenciasRecebidasControles = criarConvenioControles(transferenciasRecebidasService)
