'use client'

import { useEffect, useState } from 'react'

import { folhaService } from '../folha.service'
import { FolhaPagamento } from '../types'

export function useFolhaServidor(servidorId: number) {
  const [data, setData] = useState<FolhaPagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setLoading(true)
      setErro(null)

      try {
        const folhas = await folhaService.listarPorServidor(servidorId)
        if (ativo) setData(folhas)
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
  }, [servidorId])

  return { data, loading, erro }
}
