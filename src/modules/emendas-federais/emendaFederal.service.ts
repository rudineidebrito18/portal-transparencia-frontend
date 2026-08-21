import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { EmendaFederal, FiltroEmendaFederal } from './types'

type ListarParams = FiltroEmendaFederal & {
  page?: number
  size?: number
  sort?: string
}

// Backend não tem filtro combinado — /tipo/{tipo} e /ano/{ano} são endpoints separados do
// listar geral, por isso o tipo tem prioridade se os dois vierem setados. Path resolvido aqui
// pra ser reaproveitado tanto por listar() (client, axios) quanto listarServidor() (Server
// Component, backendFetch) — a ramificação não pode divergir entre os dois.
function resolverPath(tipo?: string, ano?: number): string {
  if (tipo) return `/emendas-federais/tipo/${tipo}`
  if (ano !== undefined) return `/emendas-federais/ano/${ano}`
  return '/emendas-federais'
}

export const emendaFederalService = {
  listar(params: ListarParams): Promise<Page<EmendaFederal>> {
    const { tipo, ano, ...pageable } = params
    return api
      .get<Page<EmendaFederal>>(resolverPath(tipo, ano), { params: pageable })
      .then(response => response.data)
  },

  // Mesma ramificação do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<EmendaFederal>> {
    const { tipo, ano, ...pageable } = params
    return backendFetch<Page<EmendaFederal>>(resolverPath(tipo, ano), { params: pageable })
  }
}
