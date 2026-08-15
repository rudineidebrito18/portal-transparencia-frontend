import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import {
  ConselhoMunicipal,
  ConselhoMunicipalRequest,
  MembroConselho,
  MembroConselhoRequest,
  TipoConselho
} from '@/modules/conselho-municipal/types'

const BASE = '/conselhos'

// Fábrica em vez de service fixo — cada conselho (Saúde/Educação/Assistência Social) usa
// a mesma API, só filtrando/gravando um `tipo` diferente. `criar`/`atualizar` já embutem
// o tipo pra tela de admin não precisar (nem poder) escolher outro por engano.
export function criarConselhoMunicipalService(tipo: TipoConselho) {
  return {
    // Sem UI de paginação — lista pequena por natureza, mesmo padrão do service público.
    listar(): Promise<ConselhoMunicipal[]> {
      return api
        .get<Page<ConselhoMunicipal>>(BASE, { params: { tipo, sort: 'mandatoInicio,desc', size: 50 } })
        .then(r => r.data.content)
    },

    buscarPorId(id: number): Promise<ConselhoMunicipal> {
      return api.get<ConselhoMunicipal>(`${BASE}/${id}`).then(r => r.data)
    },

    criar(dados: Omit<ConselhoMunicipalRequest, 'tipo'>): Promise<ConselhoMunicipal> {
      return api.post<ConselhoMunicipal>(BASE, { ...dados, tipo }).then(r => r.data)
    },

    atualizar(id: number, dados: Omit<ConselhoMunicipalRequest, 'tipo'>): Promise<ConselhoMunicipal> {
      return api.put<ConselhoMunicipal>(`${BASE}/${id}`, { ...dados, tipo }).then(r => r.data)
    },

    excluir(id: number): Promise<void> {
      return api.delete(`${BASE}/${id}`)
    }
  }
}

// Membro não depende do tipo do conselho (opera só por conselhoId) — service único.
export const membroConselhoService = {
  criar(conselhoId: number, dados: MembroConselhoRequest): Promise<MembroConselho> {
    return api.post<MembroConselho>(`${BASE}/${conselhoId}/membros`, dados).then(r => r.data)
  },

  atualizar(conselhoId: number, id: number, dados: MembroConselhoRequest): Promise<MembroConselho> {
    return api.put<MembroConselho>(`${BASE}/${conselhoId}/membros/${id}`, dados).then(r => r.data)
  },

  excluir(conselhoId: number, id: number): Promise<void> {
    return api.delete(`${BASE}/${conselhoId}/membros/${id}`)
  }
}
