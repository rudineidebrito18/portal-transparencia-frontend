'use client'

import Card from '@/components/ui/Card'

const PERGUNTAS: { pergunta: string; resposta: string }[] = [
  {
    pergunta: 'O que é a Lei de Acesso à Informação (LAI)?',
    resposta: 'A Lei nº 12.527/2011 regulamenta o direito constitucional de acesso a informações públicas, ' +
      'permitindo que qualquer pessoa, física ou jurídica, sem necessidade de apresentar motivo, solicite ' +
      'informações aos órgãos e entidades públicas.'
  },
  {
    pergunta: 'Qual o prazo para resposta?',
    resposta: 'O prazo padrão é de até 20 dias, prorrogável por mais 10 dias mediante justificativa expressa ' +
      '(ver aba "E-SIC" para os prazos configurados neste município).'
  },
  {
    pergunta: 'É necessário justificar o pedido?',
    resposta: 'Não. A lei exige apenas a identificação do requerente (nome e meio de contato), exceto quando ' +
      'a solicitação é feita de forma anônima.'
  },
  {
    pergunta: 'Toda informação produzida ou custodiada pelo poder público é pública?',
    resposta: 'Sim, como regra geral (princípio da publicidade), exceto as informações classificadas com ' +
      'grau de sigilo (reservado, secreto ou ultrassecreto) nos termos do art. 24 da LAI.'
  },
  {
    pergunta: 'O que acontece se o pedido de informação for negado?',
    resposta: 'O solicitante pode interpor recurso à autoridade hierarquicamente superior àquela que ' +
      'proferiu a decisão, no prazo de 10 dias a contar da ciência da negativa.'
  }
]

export default function LaiTab() {
  return (
    <div className="space-y-6">
      <Card hoverable={false} className="p-6">
        <p className="text-sm text-text-secondary leading-relaxed">
          A Lei de Acesso à Informação (LAI — Lei nº 12.527, de 18 de novembro de 2011) regulamenta o
          direito constitucional de acesso a informações públicas, previsto no art. 5º, inciso XXXIII, da
          Constituição Federal. Ela estabelece que é dever do Estado garantir o acesso à informação, que
          será franqueado mediante procedimentos objetivos e ágeis, de forma transparente, clara e em
          linguagem de fácil compreensão.
        </p>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary/60">
          Perguntas frequentes
        </h2>
        {PERGUNTAS.map(item => (
          <Card key={item.pergunta} hoverable={false} className="p-5">
            <p className="text-sm font-semibold text-text-secondary mb-2">{item.pergunta}</p>
            <p className="text-sm text-text-secondary/80 leading-relaxed">{item.resposta}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
