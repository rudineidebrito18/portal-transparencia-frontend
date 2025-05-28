import { Licitacao } from '@/interfaces/Licitacao'
import Link from 'next/link'

export default function LicitacaoCard({ licitacao }: { licitacao: Licitacao }) {
  return (
    <Link href={licitacao.link}      
        className="block border p-6 rounded-xl shadow hover:shadow-md transition-shadow duration-300
                   hover:bg-neutral focus:outline-none focus:ring-2 focus:ring-primary"
        target="_blank"
        rel="noopener noreferrer"
      >
        <h2 className="text-xl font-semibold text-primary mb-1">
          {licitacao.numero} — {licitacao.modalidade}
        </h2>
        <p className="text-gray-700 mb-2">{licitacao.objeto}</p>
        <p className="text-sm text-gray-500">Data: {licitacao.data}</p>
        <span
          className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${
            licitacao.situacao.toLowerCase() === 'aberta'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {licitacao.situacao}
        </span>
    </Link>
  )
}
