import LicitacaoCard from '@/components/licitacao/LicitacaoCard'
import { Licitacao } from '@/interfaces/Licitacao'
import React from 'react'


const licitacoesFake: Licitacao[] = [
  {
    id: '001',
    numero: '02/2025',
    modalidade: 'Pregão Eletrônico',
    tipo: 'MENOR PREÇO (Registro de preço)',
    objeto: 'Aquisição de materiais de informática',
    dataAbertura: '20/04/2025',
    dataSituacao: '22/04/2025',
    dataPublicacao: '21/04/2025',
    valorEstimado: 17000000,
    situacao: 'aberta',
  },
  {
    id: '002',
    numero: '02/2025',
    modalidade: 'Pregão Eletrônico',
    tipo: 'MENOR PREÇO (Registro de preço)',
    objeto: 'Aquisição de materiais de informática',
    dataAbertura: '20/04/2025',
    dataSituacao: '22/04/2025',
    dataPublicacao: '21/04/2025',
    valorEstimado: 17000000,
    situacao: 'aberta',
  },
  {
    id: '003',
    numero: '02/2025',
    modalidade: 'Pregão Eletrônico',
    tipo: 'MENOR PREÇO (Registro de preço)',
    objeto: 'Aquisição de materiais de informática',
    dataAbertura: '20/04/2025',
    dataSituacao: '22/04/2025',
    dataPublicacao: '21/04/2025',
    valorEstimado: 17000000,
    situacao: 'aberta',
  },
  {
    id: '004',
    numero: '02/2025',
    modalidade: 'Pregão Eletrônico',
    tipo: 'MENOR PREÇO (Registro de preço)',
    objeto: 'Aquisição de materiais de informática',
    dataAbertura: '20/04/2025',
    dataSituacao: '22/04/2025',
    dataPublicacao: '21/04/2025',
    valorEstimado: 17000000,
    situacao: 'aberta',
  }
]

export default function Licitacoes() {
  return (
    <div className="max-w-6xl mx-auto p-2">
      <h1 className="text-3xl font-bold mb-4">Licitações</h1>
      <div className="grid gap-2">
        {licitacoesFake.map((item, index) => (
          <LicitacaoCard key={index} licitacao={item}></LicitacaoCard>
        ))}
      </div>
    </div>
  )
}
