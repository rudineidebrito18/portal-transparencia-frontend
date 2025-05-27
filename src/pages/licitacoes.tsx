import React from 'react'

interface Licitacao {
  numero: string
  modalidade: string
  objeto: string
  situacao: string
  data: string
  link: string
}

const licitacoesFake: Licitacao[] = [
  {
    numero: '01/2025',
    modalidade: 'Pregão Eletrônico',
    objeto: 'Aquisição de materiais de informática',
    situacao: 'Aberta',
    data: '25/05/2025',
    link: '#'
  },
  {
    numero: '02/2025',
    modalidade: 'Tomada de Preço',
    objeto: 'Construção de praça pública',
    situacao: 'Encerrada',
    data: '20/04/2025',
    link: '#'
  }
]

export default function Licitacoes() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Licitações</h1>
      <div className="grid gap-4">
        {licitacoesFake.map((item, index) => (
          <div
            key={index}
            className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-semibold">{item.numero} - {item.modalidade}</span>
              <span className={`px-3 py-1 text-sm rounded-full ${item.situacao === 'Aberta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {item.situacao}
              </span>
            </div>
            <p className="text-gray-600 mb-2">{item.objeto}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Data: {item.data}</span>
              <a
                href={item.link}
                className="text-blue-600 hover:underline font-medium"
              >
                Ver detalhes
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
