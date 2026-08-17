import Link from 'next/link'
import {
  MdAccountBalance,
  MdAssignment,
  MdAttachMoney,
  MdBusiness,
  MdCalendarToday,
  MdDescription,
  MdGavel,
  MdPerson,
  MdVisibility
} from 'react-icons/md'

import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import DocumentList from '@/components/ui/DocumentList'
import EmptyState from '@/components/ui/EmptyState'
import InfoBlock from '@/components/ui/InfoBlock'
import { Documento } from '@/modules/shared/types/Documento'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import { hrefDocumento } from '@/utils/documento'
import { licitacaoService } from '@/modules/licitacoes/licitacao.service'
import { contratoService } from '../contrato.service'
import { contratoStatusDot, contratoStatusLabel, contratoStatusStyle } from '../status'
import { Aditivo, ContratoLicitacao } from '../types'

interface Props {
  contrato: ContratoLicitacao
  documentos: Documento[]
  aditivos: Aditivo[]
  documentosLicitacao?: Documento[]
}

export default function ContratoDetalhe({ contrato, documentos, aditivos, documentosLicitacao }: Props) {
  const origem = { label: `Contrato Nº ${contrato.numeroContrato}/${contrato.exercicio}`, href: `/contratos/${contrato.id}` }
  const origemLicitacao = contrato.licitacaoId
    ? { label: `Licitação ${contrato.numeroLicitacao}`, href: `/licitacoes/${contrato.licitacaoId}` }
    : undefined

  return (
    <div className="bg-light border border-border/30 rounded-2xl shadow-md overflow-hidden mb-10">

      {/* HEADER */}
      <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/20">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-primary/70 uppercase tracking-wide mb-1">
              Nº Sequencial: {contrato.numeroSequencial}
            </p>

            {origemLicitacao ? (
              <Link
                href={origemLicitacao.href}
                className="inline-block text-xs font-bold uppercase bg-primary text-white px-2 py-0.5 rounded hover:bg-primary-dark transition-colors"
              >
                Licitação: {contrato.numeroLicitacao}
              </Link>
            ) : (
              <span className="text-xs font-bold uppercase bg-primary text-white px-2 py-0.5 rounded">
                Licitação: {contrato.numeroLicitacao}
              </span>
            )}

            <h1 className="text-2xl font-extrabold text-primary tracking-tight mt-2">
              Contrato Nº {contrato.numeroContrato} / {contrato.exercicio}
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1">
            <p className="text-xs uppercase text-text-muted font-semibold">Status</p>
            <Badge size="md" className={contratoStatusStyle(contrato.status)} dotClassName={contratoStatusDot(contrato.status)}>
              {contratoStatusLabel(contrato.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-6">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
          <InfoBlock label="Fornecedor" value={contrato.fornecedor} icon={MdBusiness} />
          <InfoBlock label="Gestor do Contrato" value={contrato.gestorContrato} icon={MdPerson} />
          <InfoBlock label="Valor do Contrato" value={formatarMoeda(contrato.valorContrato)} icon={MdAttachMoney} />
          <InfoBlock label="Meio de Publicação" value={contrato.meioPublicacao} icon={MdGavel} />

          <InfoBlock label="Assinatura" value={formatarData(contrato.dataAssinatura)} icon={MdCalendarToday} />
          <InfoBlock label="Publicação" value={formatarData(contrato.dataPublicacao)} />
          <InfoBlock label="Início da Vigência" value={formatarData(contrato.dataInicio)} />
          <InfoBlock label="Término da Vigência" value={formatarData(contrato.dataTermino)} />
        </div>

        {/* UNIDADE */}
        <div className="grid grid-cols-1 gap-5 mb-10">
          <div className="bg-white p-5 rounded-xl border border-border/30 shadow-sm">
            <p className="text-xs uppercase text-text-muted mb-1 flex items-center gap-1">
              <MdAccountBalance /> Unidade
            </p>
            <p className="font-bold text-primary uppercase">
              {contrato.unidade || 'Não informada'}
            </p>
          </div>
        </div>

        {/* OBJETO */}
        <div className="mb-10">
          <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
            <MdDescription /> Objeto do Contrato
          </h3>

          <div className="bg-white border border-border/30 p-6 rounded-xl shadow-sm">
            <p className="text-text-secondary leading-relaxed text-[15px] text-justify">
              {contrato.objeto}
            </p>
          </div>
        </div>

        {/* DOCUMENTOS */}
        <div className="mb-10">
          <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
            <MdDescription /> Documentos do Contrato
          </h3>

          <DocumentList
            documentos={documentos}
            emptyMessage="Nenhum documento disponível."
            origem={origem}
            urlArquivo={doc => contratoService.urlDocumento(contrato.id, doc.id)}
          />
        </div>

        {/* DOCUMENTOS DA LICITAÇÃO DE ORIGEM */}
        {documentosLicitacao && origemLicitacao && (
          <div className="mb-10">
            <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
              <MdDescription /> Documentos da Licitação de Origem ({contrato.numeroLicitacao})
            </h3>

            <DocumentList
              documentos={documentosLicitacao}
              emptyMessage="Nenhum documento disponível na licitação de origem."
              origem={origemLicitacao}
              urlArquivo={doc => licitacaoService.urlDocumento(contrato.licitacaoId!, doc.id)}
            />
          </div>
        )}

        {/* ADITIVOS */}
        <div>
          <h3 className="font-bold text-primary uppercase text-sm tracking-wider mb-3 flex items-center gap-2">
            <MdAssignment /> Aditivos
          </h3>

          {aditivos.length === 0 ? (
            <EmptyState message="Nenhum aditivo registrado." />
          ) : (
            <div className="space-y-3">
              {aditivos.map(aditivo => (
                <Card key={aditivo.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-text-secondary">
                      {aditivo.objeto}
                    </p>
                    <p className="text-xs text-text-secondary/70">
                      {aditivo.fornecedorNome ?? '-'} • {formatarData(aditivo.dataAssinatura)}
                    </p>
                  </div>

                  <Link
                    href={hrefDocumento(contratoService.urlArquivoAditivo(aditivo.id), aditivo.objeto, { origemLabel: origem.label, origemHref: origem.href })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all whitespace-nowrap"
                  >
                    <MdVisibility size={18} />
                    Ver documento
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
