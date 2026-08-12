import { MdExpandMore } from 'react-icons/md'

import Card from '@/components/ui/Card'
import VerificarAutenticidade from './VerificarAutenticidade'

// Conteúdo estático inspirado nos tópicos do Diário Oficial de referência (assinatura
// digital, validade jurídica) — texto próprio, não copiado. Mesmo padrão de accordion
// de src/app/faq/page.tsx (<details>/<summary>, sem componente compartilhado ainda).
const PERGUNTAS: { pergunta: string; resposta: React.ReactNode }[] = [
  {
    pergunta: 'O que é a assinatura digital do Diário Oficial?',
    resposta: (
      <>
        Cada edição é assinada digitalmente com certificado no padrão ICP-Brasil (Infraestrutura
        de Chaves Públicas Brasileira) antes de ser publicada. Isso garante que o conteúdo não foi
        alterado depois da publicação e comprova a autoria do documento.
      </>
    )
  },
  {
    pergunta: 'O Diário Oficial eletrônico tem validade jurídica?',
    resposta: (
      <>
        Sim. A publicação eletrônica substitui a publicação em papel para todos os efeitos legais,
        conforme a legislação municipal que instituiu o Diário Oficial Eletrônico (disponível na
        aba Legislação desta página).
      </>
    )
  },
  {
    pergunta: 'Como confirmo que um PDF não foi alterado?',
    resposta: (
      <>
        Cada edição publicada tem um hash (uma espécie de impressão digital do arquivo) calculado
        no momento da assinatura. Na página de verificação de autenticidade (rota{' '}
        <code>/diario/validar</code>, acessível pelo QR Code impresso no PDF), você confere o hash
        oficial da edição e pode selecionar o PDF baixado para comparar automaticamente o hash do
        arquivo com o oficial — se forem iguais, o documento está íntegro.
      </>
    )
  },
  {
    pergunta: 'O que é o QR Code impresso na última página das edições?',
    resposta: (
      <>
        É um atalho para a página de verificação de autenticidade (<code>/diario/validar</code>),
        que já abre com o número da edição preenchido — sem precisar digitar nada. Você também pode
        fazer a verificação manualmente no formulário abaixo desta seção.
      </>
    )
  }
]

export default function AjudaDiarioOficial() {
  return (
    <div className="space-y-6">
      <VerificarAutenticidade />

      <div className="space-y-3">
        {PERGUNTAS.map(({ pergunta, resposta }) => (
          <Card key={pergunta} className="overflow-hidden" hoverable={false}>
            <details className="group">
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
    </div>
  )
}
