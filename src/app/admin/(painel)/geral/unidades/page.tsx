'use client'

import GeralSimplesCrudPage from '@/modules/admin/geral/GeralSimplesCrudPage'
import { unidadesService } from '@/modules/admin/geral/geral.service'
import { Unidade, UnidadeRequest } from '@/modules/admin/geral/types'

export default function UnidadesAdminPage() {
  return (
    <GeralSimplesCrudPage<Unidade, UnidadeRequest>
      label="Unidades"
      servico={unidadesService}
      campos={[{ chave: 'nome', label: 'Nome' }]}
    />
  )
}
