'use client'

import { useLicitacoes } from '@/hooks/useLicitacoes'
import { FiltroLicitacao } from '@/interfaces/licitacao/Licitacao'
import { dataDentroIntervalo } from '@/utils/date'
import { useMemo, useState } from 'react'

import LicitacaoCard from './LicitacaoCard'
import LicitacaoFiltro from './LicitacaoFiltro'

export default function LicitacaoFiltroClient() {

  const { licitacoes, loading } = useLicitacoes()

  const [filtros, setFiltros] = useState<FiltroLicitacao>({})

  const listaFiltrada = useMemo(() => {

    return licitacoes.filter(item => {

      if (
        filtros.tipoProcedimento &&
        item.tipoProcedimento !== filtros.tipoProcedimento
      ) {
        return false
      }

      if (
        filtros.numeroInstrumento &&
        !item.numeroInstrumento.includes(filtros.numeroInstrumento)
      ) {
        return false
      }

      if (
        filtros.objeto &&
        !item.objeto
          .toLowerCase()
          .includes(filtros.objeto.toLowerCase())
      ) {
        return false
      }

      if (
        !dataDentroIntervalo(
          item.dataPublicacao,
          filtros.dataInicio,
          filtros.dataFim
        )
      ) {
        return false
      }

      return true
    })
    
    .sort((a, b) =>
      new Date(b.dataPublicacao).getTime() -
      new Date(a.dataPublicacao).getTime()
    )

  }, [licitacoes, filtros])

  if (loading) {
    return (
      <p className="text-center text-text-secondary">
        Carregando licitações...
      </p>
    )
  }

  return (
    <>
      <LicitacaoFiltro onFiltrar={setFiltros} />

      <div className="grid gap-4 mt-4">
        {listaFiltrada.map(item => (
          <LicitacaoCard key={item.id} licitacao={item} />
        ))}
      </div>
    </>
  )
}