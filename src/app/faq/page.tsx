'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { MdExpandMore, MdSearch } from 'react-icons/md'

import PageHeader from '@/components/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

interface FaqPergunta {
  pergunta: string
  resposta: React.ReactNode
}

interface FaqCategoria {
  titulo: string
  perguntas: FaqPergunta[]
}

// Conteúdo estático — sem endpoint de backend pra FAQ. Perguntas genéricas sobre
// transparência/LAI; ajustar/expandir livremente conforme dúvidas reais dos cidadãos.
const CATEGORIAS: FaqCategoria[] = [
  {
    titulo: 'Geral',
    perguntas: [
      {
        pergunta: 'O que é o Portal da Transparência?',
        resposta: (
          <>
            É o canal oficial onde a Prefeitura publica informações sobre receitas, despesas,
            licitações, contratos, servidores e demais dados de interesse público, em cumprimento
            à Lei de Acesso à Informação (Lei nº 12.527/2011) e à Lei de Responsabilidade Fiscal.
          </>
        )
      },
      {
        pergunta: 'O que é a Lei de Acesso à Informação (LAI)?',
        resposta: (
          <>
            A LAI (Lei nº 12.527/2011) garante a qualquer pessoa o direito de solicitar informações
            públicas aos órgãos do governo, sem precisar justificar o motivo do pedido. Os órgãos
            têm prazo legal para responder.
          </>
        )
      },
      {
        pergunta: 'Não encontrei a informação que procurava no portal. O que faço?',
        resposta: (
          <>
            Você pode fazer um pedido formal de informação através do{' '}
            <Link href="/esic" className="text-primary underline font-semibold">e-SIC</Link>{' '}
            (Sistema Eletrônico do Serviço de Informação ao Cidadão).
          </>
        )
      },
      {
        pergunta: 'Como faço uma reclamação, denúncia ou sugestão?',
        resposta: (
          <>
            Use o canal da{' '}
            <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>{' '}
            municipal, disponível também nesta página de Transparência.
          </>
        )
      },
      {
        pergunta: 'Preciso me identificar para pedir uma informação?',
        resposta: (
          <>
            A LAI não exige justificativa para o pedido, mas alguns canais podem solicitar dados
            de identificação e contato para viabilizar o envio da resposta.
          </>
        )
      },
      {
        pergunta: 'Com que frequência os dados do portal são atualizados?',
        resposta: (
          <>
            Cada seção segue a periodicidade definida pela legislação aplicável (diária, mensal,
            bimestral, anual, conforme o tipo de informação).
          </>
        )
      }
    ]
  },
  {
    titulo: 'Lei de Acesso à Informação (LAI) e Pedidos de Informação',
    perguntas: [
      {
        pergunta: 'O que é a Lei de Acesso à Informação e qual o seu objetivo?',
        resposta: (
          <>
            A Lei de Acesso à Informação (Lei Federal nº 12.527/2011) regulamenta o direito
            constitucional dos cidadãos de obterem acesso a dados e documentos públicos. Seu
            principal intuito é promover a cultura da transparência e permitir o controle social
            sobre a gestão pública.
          </>
        )
      },
      {
        pergunta: 'Quem pode solicitar informações públicas?',
        resposta: (
          <>
            Qualquer pessoa, física ou jurídica, pode fazer pedidos de acesso à informação, sem
            necessidade de justificativa ou motivação prévia.
          </>
        )
      },
      {
        pergunta: 'O que é necessário apresentar no momento do pedido?',
        resposta: (
          <>
            Basta fornecer o nome completo, um documento de identificação válido (CPF/RG ou CNPJ),
            o detalhamento claro da informação pretendida e um meio de contato (e-mail ou endereço)
            para o envio da resposta.
          </>
        )
      },
      {
        pergunta: 'Quais órgãos públicos devem cumprir a LAI?',
        resposta: (
          <>
            A obrigação abrange todos os Poderes (Executivo, Legislativo e Judiciário), em todas
            as esferas de governo (União, Estados, Distrito Federal e Municípios), incluindo
            autarquias, fundações públicas, empresas públicas e demais entidades controladas pelo
            Estado.
          </>
        )
      },
      {
        pergunta: 'Existe algum tipo de informação que não pode ser fornecida?',
        resposta: (
          <>
            Sim. Dados protegidos por sigilo legal (como segurança pública ou segredo industrial)
            e informações pessoais que afetem a intimidade, honra e imagem dos indivíduos têm
            acesso restrito.
          </>
        )
      },
      {
        pergunta: 'O que são informações pessoais e qual o seu prazo de sigilo?',
        resposta: (
          <>
            São dados relativos a um indivíduo identificado ou identificável. O acesso a essas
            informações é restrito a terceiros e possui proteção pelo prazo máximo de 100 anos a
            contar da data de sua produção.
          </>
        )
      },
      {
        pergunta: 'Qual é o prazo para receber a resposta de um pedido de informação?',
        resposta: (
          <>
            Se o dado estiver disponível, o acesso deve ser concedido imediatamente. Caso
            contrário, a Administração Pública possui o prazo de 20 dias, prorrogável por mais 10
            dias mediante justificativa prévia.
          </>
        )
      },
      {
        pergunta: 'O que fazer caso o pedido não seja respondido no prazo ou a resposta seja insatisfeita?',
        resposta: (
          <>
            O cidadão pode interpor um recurso ou formalizar uma reclamação à Autoridade de
            Monitoramento da LAI no prazo de 10 dias após o término do limite legal ou recebimento
            da resposta.
          </>
        )
      },
      {
        pergunta: 'Qual a diferença entre Transparência Ativa e Transparência Passiva?',
        resposta: (
          <>
            A Transparência Ativa ocorre quando o órgão público publica dados espontaneamente nos
            sites e portais, sem solicitação prévia. A Transparência Passiva ocorre quando a
            informação é fornecida em atendimento a uma requisição específica do cidadão (via SIC
            ou{' '}
            <Link href="/esic" className="text-primary underline font-semibold">e-SIC</Link>).
          </>
        )
      },
      {
        pergunta: 'O que são o SIC e o e-SIC?',
        resposta: (
          <>
            O SIC (Serviço de Informações ao Cidadão) é a unidade física de atendimento ao público
            no órgão. O{' '}
            <Link href="/esic" className="text-primary underline font-semibold">e-SIC</Link>{' '}
            é o sistema eletrônico que centraliza o envio, o acompanhamento, as respostas e os
            recursos de pedidos de informação via internet.
          </>
        )
      }
    ]
  },
  {
    titulo: 'Portal da Transparência',
    perguntas: [
      {
        pergunta: 'O que é o Portal da Transparência e por que ele existe?',
        resposta: (
          <>
            Trata-se de uma ferramenta eletrônica voltada ao cumprimento da Lei Complementar nº
            131/2009 e da Lei de Responsabilidade Fiscal. Ele foi estruturado para garantir que a
            sociedade acompanhe em tempo real a aplicação dos recursos públicos e a execução
            orçamentária.
          </>
        )
      },
      {
        pergunta: 'Quem pode consultar as informações e há algum custo?',
        resposta: (
          <>
            O acesso é totalmente livre, gratuito e universal. Qualquer cidadão pode navegar no
            portal sem necessidade de cadastro, senha ou autorização prévia.
          </>
        )
      },
      {
        pergunta: 'Quais dados estão disponíveis para consulta no portal?',
        resposta: (
          <>
            Estão disponíveis informações detalhadas sobre a receita arrecadada, despesas
            públicas (empenhos, liquidações e pagamentos), procedimentos licitatórios, contratos
            firmados, repasses federais/estaduais e despesas com pessoal.
          </>
        )
      },
      {
        pergunta: 'Quais as consequências para os entes que descumprirem as regras de transparência?',
        resposta: (
          <>
            O descumprimento da LC nº 131/2009 pode impedir o município ou estado de receber
            transferências voluntárias, além de sujeitar os gestores públicos a sanções por crime
            de responsabilidade fiscal.
          </>
        )
      }
    ]
  },
  {
    titulo: 'Ouvidoria Pública',
    perguntas: [
      {
        pergunta: 'Qual é o papel da Ouvidoria Municipal?',
        resposta: (
          <>
            A{' '}
            <Link href="/ouvidoria" className="text-primary underline font-semibold">Ouvidoria</Link>{' '}
            é o canal direto de interlocução entre o cidadão e a administração. Ela acolhe,
            encaminha e acompanha manifestações como elogios, sugestões, solicitações de serviços,
            reclamações, denúncias e pedidos de simplificação.
          </>
        )
      },
      {
        pergunta: 'A Ouvidoria possui poder punitivo ou de fiscalização direta?',
        resposta: (
          <>
            Não. A Ouvidoria não instaura processos disciplinares ou punitivos. Cabe a ela
            analisar a demanda do cidadão e recomendá-la aos setores competentes (como
            Corregedoria ou Controladoria) para que tomem as providências administrativas.
          </>
        )
      },
      {
        pergunta: 'Quando se deve acionar a Ouvidoria?',
        resposta: (
          <>
            Quando um serviço não for prestado de forma adequada, quando houver demora
            injustificada no atendimento, para comunicar irregularidades, encaminhar propostas de
            melhoria ou elogiar a atuação de agentes públicos.
          </>
        )
      },
      {
        pergunta: 'O que é a Carta de Serviços ao Usuário?',
        resposta: (
          <>
            É um documento normatizado pela Lei nº 13.460/2017 que informa detalhadamente os
            serviços prestados pelo órgão, prazos, locais de atendimento, documentos necessários e
            taxas de cada setor.
          </>
        )
      }
    ]
  },
  {
    titulo: 'Estrutura e Atribuições do Executivo Municipal',
    perguntas: [
      {
        pergunta: 'Como é composto o Poder Executivo Municipal?',
        resposta: (
          <>
            É liderado pelo Prefeito (chefe do Executivo) e integrado pelos Secretários
            Municipais, responsáveis pela condução das diretrizes de pastas específicas (como
            Saúde, Educação e Obras).
          </>
        )
      },
      {
        pergunta: 'Quais são as atribuições do Prefeito?',
        resposta: (
          <>
            Dirigir a administração local, definir as metas orçamentárias, nomear a equipe de
            governo, vetar ou sancionar projetos aprovados pela Câmara e representar formalmente o
            Município.
          </>
        )
      },
      {
        pergunta: 'Como o Executivo interage com a Câmara de Vereadores?',
        resposta: (
          <>
            O Executivo executa as leis criadas ou aprovadas pelo Legislativo, envia propostas
            orçamentárias para votação e deve periodicamente prestar contas das suas ações aos
            vereadores e à sociedade.
          </>
        )
      }
    ]
  },
  {
    titulo: 'Serviços ao Microempreendedor Individual (MEI)',
    perguntas: [
      {
        pergunta: 'O que é a conta gov.br e qual sua utilidade no MEI?',
        resposta: (
          <>
            A plataforma gov.br é o sistema de identificação digital unificado do governo federal.
            Ela permite acesso seguro a serviços ao contribuinte, abertura de empresas e geração de
            documentos no portal do empreendedor.
          </>
        )
      },
      {
        pergunta: 'Quais documentos e dados são necessários para a formalização do MEI?',
        resposta: (
          <>
            São necessários: CPF, dados do RG, dados de contato (telefone/e-mail), comprovante de
            endereço residencial e comercial, além do cadastro ativo no sistema gov.br.
          </>
        )
      },
      {
        pergunta: 'Quais são os principais benefícios de se formalizar como MEI?',
        resposta: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Obtenção de CNPJ e facilidade de abertura;</li>
            <li>Isenção de taxas federais para registro;</li>
            <li>Emissão de Notas Fiscais e acesso a licitações;</li>
            <li>Cobertura previdenciária do INSS (aposentadoria, auxílio-doença e salário-maternidade);</li>
            <li>Tributação simplificada com valor fixo mensal (DAS).</li>
          </ul>
        )
      },
      {
        pergunta: 'Quais são as obrigações correntes do Microempreendedor Individual?',
        resposta: (
          <ul className="list-disc pl-5 space-y-1">
            <li>Pagamento pontual do boleto mensal DAS (até o dia 20 de cada mês);</li>
            <li>Emissão de Nota Fiscal nas vendas ou serviços prestados para Pessoas Jurídicas (CNPJ);</li>
            <li>Preenchimento do Relatório Mensal de Receitas Brutas;</li>
            <li>Entrega da Declaração Anual do Simples Nacional (DASN-SIMEI) até o final do mês de maio de cada ano.</li>
          </ul>
        )
      }
    ]
  }
]

export default function Faq() {
  const [busca, setBusca] = useState('')

  const categoriasFiltradas = useMemo(() => {
    const termo = normalizar(busca)
    if (!termo) return CATEGORIAS

    return CATEGORIAS
      .map(categoria => ({
        ...categoria,
        perguntas: categoria.perguntas.filter(({ pergunta }) => normalizar(pergunta).includes(termo))
      }))
      .filter(categoria => categoria.perguntas.length > 0)
  }, [busca])

  const buscando = busca.trim() !== ''

  return (
    <div className="max-w-4xl mx-auto p-2">
      <PageHeader title="Perguntas Frequentes" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Perguntas frequentes' }
        ]} />

      <div className="relative mb-6">
        <MdSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por uma pergunta..."
          className="pl-10"
        />
      </div>

      {categoriasFiltradas.length === 0 ? (
        <p className="text-sm text-text-secondary/70 text-center py-10">
          Nenhuma pergunta encontrada para &quot;{busca}&quot;.
        </p>
      ) : (
        <div className="space-y-8">
          {categoriasFiltradas.map(categoria => (
            <section key={categoria.titulo}>
              <h2 className="text-xs uppercase tracking-wide font-semibold text-text-muted mb-3">
                {categoria.titulo}
              </h2>

              <div className="space-y-3">
                {categoria.perguntas.map(({ pergunta, resposta }) => (
                  <Card key={pergunta} className="overflow-hidden" hoverable={false}>
                    <details className="group" open={buscando}>
                      <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none font-semibold text-text-secondary hover:text-primary transition-colors">
                        {pergunta}
                        <MdExpandMore
                          size={20}
                          className="shrink-0 transition-transform group-open:rotate-180"
                        />
                      </summary>

                      <div className="px-5 pb-4 text-sm text-text-secondary/80 leading-relaxed">
                        {resposta}
                      </div>
                    </details>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
