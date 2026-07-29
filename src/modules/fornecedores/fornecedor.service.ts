import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { Fornecedor } from './types'

const BASE = '/geral/fornecedores'

// Endpoint é permitAll() pro GET no backend — não precisa de token. Só usado hoje pra
// popular o <select> de fornecedor em filtros públicos (ex: ObraFiltro); sem paginação
// na UI (lista é naturalmente pequena), pede uma página grande e usa só .content.
export const fornecedorService = {
  listar(params?: { nome?: string; cnpj?: string }): Promise<Fornecedor[]> {
    return api
      .get<Page<Fornecedor>>(`${BASE}/filtro`, { params: { ...params, size: 200 } })
      .then(r => r.data.content)
  }
}
