'use client'

import { criarConvenioControles } from './ConvenioControles'
import { acordosFirmadosService } from '../convenio.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component —
// ver comentário em CompetenciasControles.tsx.
export const AcordosFirmadosControles = criarConvenioControles(acordosFirmadosService)
