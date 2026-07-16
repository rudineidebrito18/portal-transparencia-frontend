'use client'

import InstitucionalCrudPage from '@/modules/admin/institucional/InstitucionalCrudPage'
import { avisoAdminService } from '@/modules/admin/institucional/institucional.service'

export default function AvisosAdminPage() {
  return <InstitucionalCrudPage label="Avisos" servico={avisoAdminService} />
}
