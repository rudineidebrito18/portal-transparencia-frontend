'use client'

import { Page } from '@/modules/shared/types/Page'
import { useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'

type UsePageableResourceProps<T, F> = {
  fetchFunction: (params: F & {
    page?: number
    size?: number
    sort?: string
  }) => Promise<Page<T>>
  initialFilters?: F
  initialSort?: string
  size?: number
}

export function usePageableResource<
  T,
  F extends object = Record<string, never>
>({
  fetchFunction,
  initialFilters = {} as F,
  initialSort = "dataPublicacao,desc",
  size = 10
}: UsePageableResourceProps<T, F>) {

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [filtros, setFiltros] = useState<F>(initialFilters)
  const [ordenacao, setOrdenacao] = useState<string>(initialSort)

  const debouncedFiltros = useDebounce(filtros, 500)

  useEffect(() => {
    setPagina(0)
  }, [debouncedFiltros])

  useEffect(() => {
    async function carregar() {
      setLoading(true)
      setErro(null)

      try {
        const response = await fetchFunction({
          ...debouncedFiltros,
          page: pagina,
          size,
          sort: ordenacao || undefined
        })

        setData(response.content)
        setTotalPaginas(response.totalPages)
        setTotalElements(response.totalElements)
        
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Erro ao carregar dados"

        setErro(message)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [pagina, debouncedFiltros, ordenacao, size, fetchFunction])

  return {
    data,
    loading,
    erro,

    pagina,
    totalPaginas,
    totalElements,
    setPagina,
    setFiltros,
    setOrdenacao,

    filtros,
    ordenacao
  }
}