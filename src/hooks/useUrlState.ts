'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

// Estado simples (ex: aba ativa) que mora num único parâmetro da URL em vez de useState —
// sobrevive a F5 e é compartilhável, igual página/filtro/ordenação de usePageableResource.
export function useUrlState<T extends string>(chave: string, valorPadrao: T) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const valor = (searchParams.get(chave) ?? valorPadrao) as T

  function setValor(novoValor: T) {
    const novosParams = new URLSearchParams(searchParams.toString())

    if (novoValor === valorPadrao) {
      novosParams.delete(chave)
    } else {
      novosParams.set(chave, novoValor)
    }

    const query = novosParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return [valor, setValor] as const
}
