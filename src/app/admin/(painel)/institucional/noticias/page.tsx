'use client'

import InstitucionalCrudPage from '@/modules/admin/institucional/InstitucionalCrudPage'
import { noticiaAdminService } from '@/modules/admin/institucional/institucional.service'

export default function NoticiasAdminPage() {
  return <InstitucionalCrudPage label="Notícias" servico={noticiaAdminService} />
}
