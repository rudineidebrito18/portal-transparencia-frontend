'use client'

import { StatusLicitacaoDescricao } from '@/interfaces/enums/StatusLicitacao'
import { TipoProcedimentoDescricao } from '@/interfaces/enums/TipoProcedimentoLicitacao'
import { Licitacao } from '@/interfaces/licitacao/Licitacao'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import LicitacaoDocumentos from './LicitacaoDocumentos'

interface Props {
    licitacao: Licitacao
}

export default function LicitacaoDetalhe({ licitacao }: Props) {
    const valorEstimado =
        licitacao.valorEstimado != null
            ? formatarMoeda(licitacao.valorEstimado)
            : 'Não informado'

    return (
        <div className="bg-neutral-light shadow rounded-lg p-6 mb-6">

            {/* Cabeçalho */}
            <h2 className="text-lg font-semibold text-primary mb-3">
                {TipoProcedimentoDescricao[licitacao.tipoProcedimento]} Nº {licitacao.numeroInstrumento}/{licitacao.ano} - {StatusLicitacaoDescricao[licitacao.status]}
            </h2>

            {/* Informações */}
            <div className="grid md:grid-cols-2 gap-2 text-sm text-text-secondary">

                <p>
                    <span className="font-medium">Processo:</span>{' '}
                    {licitacao.numeroProcesso || 'Não informado'}
                </p>

                <p>
                    <span className="font-medium">Data de Publicação:</span>{' '}
                    {formatarData(licitacao.dataPublicacao)}
                </p>

                <p>
                    <span className="font-medium">Data da Sessão:</span>{' '}
                    {formatarData(licitacao.dataSessao)}
                </p>

                <p>
                    <span className="font-medium">Data de Abertura:</span>{' '}
                    {formatarData(licitacao.dataAbertura)}
                </p>

                {licitacao.dataHomologacao && (
                    <p>
                        <span className="font-medium">Homologação:</span>{' '}
                        {formatarData(licitacao.dataHomologacao)}
                    </p>
                )}

                <p>
                    <span className="font-medium">Valor Estimado:</span>{' '}
                    {valorEstimado}
                </p>

            </div>

            {/* Objeto */}
            <div className="mt-4">

                <h3 className="text-md font-medium text-text-primary">
                    Objeto
                </h3>

                <p className="text-sm text-text-secondary mt-1">
                    {licitacao.objeto}
                </p>

            </div>

            <LicitacaoDocumentos/>           

        </div>
    )
}