'use client'

import GeralSimplesCrudPage from '@/modules/admin/geral/GeralSimplesCrudPage'
import { fornecedoresService } from '@/modules/admin/geral/geral.service'
import { Fornecedor, FornecedorRequest } from '@/modules/admin/geral/types'

export default function FornecedoresAdminPage() {
  return (
    <GeralSimplesCrudPage<Fornecedor, FornecedorRequest>
      label="Fornecedores"
      servico={fornecedoresService}
      campos={[
        { chave: 'nome', label: 'Nome' },
        { chave: 'cnpj', label: 'CNPJ' }
      ]}
    />
  )
}
