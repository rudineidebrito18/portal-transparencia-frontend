type Licitacao = {
  id: number
  titulo: string
  status: string
  dataAbertura: string
}

export default function LicitacaoCard({ licitacao }: { licitacao: Licitacao }) {
  return (
    <div className="border p-6 rounded-xl shadow hover:shadow-md transition">
      <h2 className="text-xl font-semibold text-blue-800">{licitacao.titulo}</h2>
      <p className="text-sm text-gray-600 mt-2">Data de Abertura: {licitacao.dataAbertura}</p>
      <span
        className={`inline-block mt-3 px-3 py-1 rounded-full text-sm ${
          licitacao.status === 'Aberta'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-200 text-gray-600'
        }`}
      >
        {licitacao.status}
      </span>
    </div>
  )
}
