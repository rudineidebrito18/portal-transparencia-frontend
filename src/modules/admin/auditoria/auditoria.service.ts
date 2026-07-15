import { api } from '@/services/api'
import { Page } from '@/modules/shared/types/Page'
import { AuditLog, FiltroAuditoria } from './types'

type ListarParams = FiltroAuditoria & {
  page?: number
  size?: number
  sort?: string
}

// Cobre só os módulos do padrão genérico (seção 6.7 do prompt do admin) +
// gestão de usuários por enquanto — módulos bespoke (licitações, obras, RH
// específico, diário oficial etc.) ainda não geram registro de auditoria.
export const auditoriaService = {
  listar(params: ListarParams): Promise<Page<AuditLog>> {
    return api.get<Page<AuditLog>>('/admin/auditoria', { params }).then(r => r.data)
  }
}
