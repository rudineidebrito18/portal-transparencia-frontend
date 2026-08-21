import { Page } from '@/modules/shared/types/Page'
import { api } from '@/services/api'
import { backendFetch } from '@/utils/backendFetch'
import { EmendaEstadual, FiltroEmendaEstadual } from './types'

type ListarParams = FiltroEmendaEstadual & {
  page?: number
  size?: number
  sort?: string
}

// /ano/{ano} é endpoint separado do listar geral — path resolvido aqui pra ser reaproveitado
// tanto por listar() (client, axios) quanto listarServidor() (Server Component, backendFetch).
function resolverPath(ano?: number): string {
  return ano !== undefined ? `/emendas-estaduais/ano/${ano}` : '/emendas-estaduais'
}

export const emendaEstadualService = {
  listar(params: ListarParams): Promise<Page<EmendaEstadual>> {
    const { ano, ...pageable } = params
    return api
      .get<Page<EmendaEstadual>>(resolverPath(ano), { params: pageable })
      .then(response => response.data)
  },

  // Mesma ramificação do listar() acima, mas chamado direto do servidor (Server Component da
  // Fase 4) via backendFetch, não pela instância axios `api`. NUNCA chamar de um 'use client'.
  listarServidor(params: ListarParams): Promise<Page<EmendaEstadual>> {
    const { ano, ...pageable } = params
    return backendFetch<Page<EmendaEstadual>>(resolverPath(ano), { params: pageable })
  }
}
