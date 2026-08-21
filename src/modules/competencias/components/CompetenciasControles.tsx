'use client'

import { criarDocumentoGenericoControles } from '@/modules/shared/components/documento-generico/DocumentoGenericoControles'
import { competenciasService } from '../competencias.service'

// A chamada da factory precisa acontecer aqui (arquivo 'use client'), não no Server Component
// (CompetenciasListView.tsx) — um Server Component só pode RENDERIZAR um componente cliente
// como JSX, nunca CHAMAR uma função exportada de um arquivo 'use client' diretamente (o React
// rejeita em runtime: "criarDocumentoGenericoControles is on the client"). Client chamando
// client, no mesmo grafo de módulos, é o caso normal — só client→server é que não vale aqui.
export const CompetenciasControles = criarDocumentoGenericoControles({
  listar: params => competenciasService.listar('competencias', params)
})
