'use client'
import { FiltroLicitacao, Licitacao } from '@/interfaces/Licitacao'
import { useState } from 'react'
import LicitacaoCard from './LicitacaoCard'
import LicitacaoFiltro from './LicitacaoFiltro'

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
    situacao: 'finalizada',
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
    situacao: 'finalizada',
  }
]

export default function LicitacaoFiltroClient() {
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>(licitacoesFake)

  const filtrar = (filtros: FiltroLicitacao) => {
    const resultado = licitacoesFake.filter(item => {
      const matchModalidade = filtros.modalidade === '' || item.modalidade === filtros.modalidade
      const matchNumero = filtros.numero === '' || item.numero.includes(filtros.numero)
      const matchObjeto = filtros.objeto === '' || item.objeto.toLowerCase().includes(filtros.objeto.toLowerCase())
      const matchData =
        (!filtros.dataInicio || new Date(item.dataPublicacao) >= new Date(filtros.dataInicio)) &&
        (!filtros.dataFim || new Date(item.dataPublicacao) <= new Date(filtros.dataFim))

      return matchModalidade && matchNumero && matchObjeto && matchData
    })

    setLicitacoes(resultado)
  }

  return (
    <>
      <LicitacaoFiltro onFiltrar={filtrar} />
      <div className="grid gap-2">
        {licitacoes.map((item, index) => (
          <LicitacaoCard key={index} licitacao={item} />
        ))}
      </div>
    </>
  )
}
