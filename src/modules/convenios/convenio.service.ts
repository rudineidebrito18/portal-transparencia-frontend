import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { urlArquivoDocumento } from '@/utils/documento'
import { Page } from '@/modules/shared/types/Page'
import { ConvenioDocumento, FiltroConvenio } from './types'

type ListarParams = FiltroConvenio & {
  page?: number
  size?: number
  sort?: string
}

// path já inclui o segmento final ("/filtro" é adicionado aqui) — os 3 recursos de
// convênios têm basePaths diferentes no backend, então cada um vira um serviço próprio.
function criarServicoConvenio(path: string) {
  return {
    listar(params: ListarParams): Promise<Page<ConvenioDocumento>> {
      return api
        .get<Page<ConvenioDocumento>>(`/${path}/filtro`, { params })
        .then(response => response.data)
    },

    // Mesmo endpoint do listar() acima, mas chamado direto do servidor (Server Component da
    // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
    listarServidor(params: ListarParams): Promise<Page<ConvenioDocumento>> {
      return backendFetch<Page<ConvenioDocumento>>(`/${path}/filtro`, { params })
    },

    urlArquivo(id: number): string {
      return urlArquivoDocumento(path, id)
    }
  }
}

export const transferenciasRecebidasService = criarServicoConvenio('convenios-transferencias-recebidas')

export const transferenciasRealizadasService = criarServicoConvenio('convenios-transferencias-realizadas')

export const acordosFirmadosService = criarServicoConvenio('convenios/acordos-firmados-orgao')
