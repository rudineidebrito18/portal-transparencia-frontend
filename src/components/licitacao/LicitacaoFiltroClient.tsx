'use client'

import { useLicitacoes } from '@/hooks/useLicitacoes'
import { FiltroLicitacao, Licitacao } from '@/interfaces/Licitacao'
import { dataDentroIntervalo } from '@/utils/date'
import { useState } from 'react'
import LicitacaoCard from './LicitacaoCard'
import LicitacaoFiltro from './LicitacaoFiltro'

export default function LicitacaoFiltroClient() {

  const { licitacoes, loading } = useLicitacoes()

  const [resultado, setResultado] = useState<Licitacao[]>([])

  const lista = resultado.length > 0 ? resultado : licitacoes

  const filtrar = (filtros: FiltroLicitacao) => {

    const filtradas = licitacoes.filter(item => {

      if (filtros.modalidade && item.modalidade !== filtros.modalidade)
        return false

      if (filtros.numero && !item.numero.includes(filtros.numero))
        return false

      if (
        filtros.objeto &&
        !item.objeto.toLowerCase().includes(filtros.objeto.toLowerCase())
      )
        return false

      if (
        !dataDentroIntervalo(
          item.dataPublicacao,
          filtros.dataInicio,
          filtros.dataFim
        )
      )
        return false

      return true
    })

    setResultado(filtradas)
  }

  if (loading) {
    return <p>Carregando licitações...</p>
  }

  return (
    <>
      <LicitacaoFiltro onFiltrar={filtrar} />

      <div className="grid gap-2">
        {lista.map(item => (
          <LicitacaoCard key={item.id} licitacao={item} />
        ))}
      </div>
    </>
  )
}