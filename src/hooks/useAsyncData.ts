'use client'

import { DependencyList, useEffect, useState } from 'react'

export function useAsyncData<T>(fetchFn: () => Promise<T>, deps: DependencyList, valorInicial: T) {
  const [data, setData] = useState<T>(valorInicial)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true

    async function carregar() {
      setLoading(true)
      setErro(null)

      try {
        const resultado = await fetchFn()
        if (ativo) setData(resultado)
      } catch (e: unknown) {
        if (ativo) setErro(e instanceof Error ? e.message : 'Erro ao carregar dados')
      } finally {
        if (ativo) setLoading(false)
      }
    }

    carregar()

    return () => {
      ativo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, erro }
}
