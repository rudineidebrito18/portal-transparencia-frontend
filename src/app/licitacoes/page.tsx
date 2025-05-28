import LicitacaoCard from '@/components/LicitacaoCard'
import { Licitacao } from '@/interfaces/Licitacao'
import React from 'react'


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
  },
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
  },
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
            <LicitacaoCard key={index} licitacao={item}></LicitacaoCard>
          ))}
        </div>
      </div>
  )
}
