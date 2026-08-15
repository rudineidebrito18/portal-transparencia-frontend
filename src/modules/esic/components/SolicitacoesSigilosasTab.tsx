'use client'

import DeclaracaoSigiloEsicListView from './DeclaracaoSigiloEsicListView'

// Deliberadamente NÃO lista solicitações individuais classificadas com sigilo — só a
// declaração periódica (LAI, art. 24 §1º). Conteúdo sigiloso nunca é servido nesta aba.
export default function SolicitacoesSigilosasTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary/70">
        Solicitações classificadas com grau de sigilo não têm o conteúdo divulgado publicamente.
        Esta seção reúne as declarações periódicas exigidas pela Lei de Acesso à Informação.
      </p>
      <DeclaracaoSigiloEsicListView />
    </div>
  )
}
