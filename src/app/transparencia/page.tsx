import { Metadata } from 'next'

import Breadcrumbs from '@/components/Breadcrumbs'
import SecaoAcesso from '@/modules/transparencia/components/SecaoAcesso'
import { secoesAcessoInformacao } from '@/modules/transparencia/data/secoes'

export const metadata: Metadata = {
  title: 'Transparência — Acesso à Informação',
}

export default function TransparenciaPage() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <Breadcrumbs items={[{ label: 'Transparência' }]} />

      <h1 className="text-3xl font-bold mb-2 text-primary uppercase">
        Acesso à Informação
      </h1>
      <div className="h-1 w-20 bg-secondary mb-4 rounded-full" />

      <p className="text-sm text-text-secondary/70 max-w-3xl mb-10">
        Reúne, por categoria, os dados e documentos que o município disponibiliza em
        cumprimento à Lei de Acesso à Informação. Itens marcados como &quot;Em breve&quot;
        ainda não possuem página própria e serão disponibilizados progressivamente.
      </p>

      <div className="flex flex-col gap-10 pb-16">
        {secoesAcessoInformacao.map((secao) => (
          <SecaoAcesso key={secao.titulo} {...secao} />
        ))}
      </div>
    </div>
  )
}
