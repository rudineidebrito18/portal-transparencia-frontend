'use client'

import { useEffect, useMemo, useState } from 'react'

import { folhaService } from '../folha.service'
import { FolhaPagamentoServidor } from '../types'

const SIZE = 15

export function useFolhaPorMes(mes: number, ano: number) {
  const [registros, setRegistros] = useState<FolhaPagamentoServidor[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [pagina, setPagina] = useState(0)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setLoading(true)
      setErro(null)
      setPagina(0)

      try {
        const dados = await folhaService.listarPorMes(mes, ano)
        if (ativo) setRegistros(dados)
      } catch (e: unknown) {
        if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao carregar folha de pagamento')
      } finally {
        if (ativo) setLoading(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [mes, ano])

  const totalPaginas = Math.ceil(registros.length / SIZE) || 0

  const dataPagina = useMemo(
    () => registros.slice(pagina * SIZE, pagina * SIZE + SIZE),
    [registros, pagina]
  )

  const totalFolha = useMemo(
    () => registros.reduce((soma, r) => soma + r.salarioLiquido, 0),
    [registros]
  )

  return {
    data: dataPagina,
    totalRegistros: registros.length,
    totalFolha,
    loading,
    erro,
    pagina,
    totalPaginas,
    setPagina
  }
}
