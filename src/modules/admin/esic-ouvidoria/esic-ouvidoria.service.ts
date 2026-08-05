import { ApiError, api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { EsicInfo, EsicInfoRequest, FiltroFormularioEsic, FiltroFormularioOuvidoria, FormularioEsic, FormularioOuvidoria, OuvidoriaInfo, OuvidoriaInfoRequest } from './types'

export const esicInfoService = {
  // GET devolve 404 antes da primeira configuração (PUT faz upsert), igual ouvidoria.
  buscar(): Promise<EsicInfo | null> {
    return api.get<EsicInfo>('/esic/infos').then(
      r => r.data,
      (e: ApiError) => {
        if (e.status === 404) return null
        throw e
      }
    )
  },

  atualizar(dados: EsicInfoRequest): Promise<EsicInfo> {
    return api.put<EsicInfo>('/esic/infos', dados).then(r => r.data)
  }
}

type ListarFormularioParams = FiltroFormularioEsic & { page?: number; size?: number; sort?: string }

export const esicFormularioService = {
  listar(params: ListarFormularioParams): Promise<Page<FormularioEsic>> {
    return api.get<Page<FormularioEsic>>('/esic/formulario/filtro', { params }).then(r => r.data)
  }
}

export const ouvidoriaInfoService = {
  // GET devolve 404 antes da primeira configuração (PUT faz upsert) — trata
  // como "ainda não configurado" em vez de propagar erro.
  buscar(): Promise<OuvidoriaInfo | null> {
    return api.get<OuvidoriaInfo>('/ouvidoria/info').then(
      r => r.data,
      (e: ApiError) => {
        if (e.status === 404) return null
        throw e
      }
    )
  },

  atualizar(dados: OuvidoriaInfoRequest): Promise<OuvidoriaInfo> {
    return api.put<OuvidoriaInfo>('/ouvidoria/info', dados).then(r => r.data)
  }
}

type ListarFormularioOuvidoriaParams = FiltroFormularioOuvidoria & { page?: number; size?: number; sort?: string }

// GET /api/ouvidoria/formulario[/filtro] agora exige login (ROLE_MANAGER+) — antes era
// público, dado pessoal do cidadão ficava exposto sem autenticação (bug de privacidade
// corrigido pelo backend). Espelha exatamente o padrão de esicFormularioService.
export const ouvidoriaFormularioService = {
  listar(params: ListarFormularioOuvidoriaParams): Promise<Page<FormularioOuvidoria>> {
    return api.get<Page<FormularioOuvidoria>>('/ouvidoria/formulario/filtro', { params }).then(r => r.data)
  }
}
