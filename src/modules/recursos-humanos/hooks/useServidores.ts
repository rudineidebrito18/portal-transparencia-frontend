'use client'

import { usePageableResource } from '@/hooks/usePageableResource'
import { servidorService } from '../servidor.service'
import { FiltroServidor, Servidor } from '../types'

export function useServidores() {
  return usePageableResource<Servidor, FiltroServidor>({
    fetchFunction: servidorService.listar,
    initialSort: 'name,asc',
    size: 10
  })
}
