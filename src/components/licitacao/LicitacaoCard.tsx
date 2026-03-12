import { Licitacao } from '@/interfaces/Licitacao'
import { formatarMoeda } from '@/utils/currency'
import { formatarData } from '@/utils/date'
import Link from 'next/link'
import { MdVisibility } from 'react-icons/md'

interface Props {
  licitacao: Licitacao
}

export default function LicitacaoCard({ licitacao }: Props) {

  const situacao = licitacao.situacao?.toLowerCase()

  const corSituacao =
    situacao === 'aberta'
      ? 'text-success font-bold'
      : situacao === 'finalizada'
      ? 'text-error font-bold'
      : 'text-gray-500'

  return (
    <div className="border rounded-lg shadow-sm p-2 bg-white hover:shadow-md transition relative">

      <div className="flex justify-between items-start mb-1">
        <h2 className="text-lg font-bold text-gray-800">
          {licitacao.modalidade?.toUpperCase()}: {licitacao.numero}
        </h2>
      </div>

      <p className="text-sm text-gray-700 mb-4">
        {licitacao.objeto}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm text-gray-700 mb-3">

        <div>
          <span className="font-semibold">Modalidade:</span> {licitacao.modalidade}
        </div>

        <div>
          <span className="font-semibold">Abertura:</span>{' '}
          {formatarData(licitacao.dataAbertura)}
        </div>

        <div>
          <span className="font-semibold">Tipo:</span> {licitacao.tipo}
        </div>

        <div>
          <span className="font-semibold">Valor estimado:</span>{' '}
          {formatarMoeda(licitacao.valorEstimado)}
        </div>

        <div>
          <span className="font-semibold">Situação:</span>{' '}
          <span className={corSituacao}>
            {licitacao.situacao}
          </span>
        </div>

        <div>
          <span className="font-semibold">Data da situação:</span>{' '}
          {formatarData(licitacao.dataSituacao)}
        </div>

      </div>

      <div className="text-xs text-gray-500 italic mt-2 md:absolute md:top-4 md:right-4 md:text-right">
        <p>
          Publicação: {formatarData(licitacao.dataPublicacao)}
        </p>
      </div>

      <div className="mt-4 flex justify-end md:absolute md:bottom-4 md:right-4">
        <Link
          href={`/licitacoes/${licitacao.id}`}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-light text-text-primary text-sm px-4 py-2 rounded-md transition"
        >
          <MdVisibility className="w-4 h-4" />
          Acessar
        </Link>
      </div>

    </div>
  )
}