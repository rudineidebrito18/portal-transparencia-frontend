'use client'

import { MdSwapVert } from 'react-icons/md'

import Select from '@/components/ui/Select'
import { formatarDataHora } from '@/utils/date'
import { useConteudoInstitucionalUrlState } from '../hooks/useConteudoInstitucionalUrlState'
import ConteudoInstitucionalFiltro from './ConteudoInstitucionalFiltro'

interface Props {
  variant: 'noticia' | 'aviso'
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

// Filtro + ordenação — sem botão de exportar (o painel original de Notícias/Avisos nunca teve
// um, diferente do padrão "documento genérico"). Mesmo papel de DocumentoGenericoControles
// (shared/), mas simplificado pro shape de ConteudoInstitucional.
export default function ConteudoInstitucionalControles({
  variant,
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'data,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useConteudoInstitucionalUrlState(ordenacaoPadrao)

  return (
    <>
      <ConteudoInstitucionalFiltro valoresIniciais={filtros} onFiltrar={setFiltros} variant={variant} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong>{' '}
          {variant === 'aviso' ? 'avisos encontrados' : 'notícias encontradas'}
          <span className="text-text-muted"> · atualizado em {formatarDataHora(new Date(atualizadoEm))}</span>
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="data,desc">Mais recentes</option>
            <option value="data,asc">Mais antigos</option>
            <option value="titulo,asc">Título (A-Z)</option>
          </Select>
        </div>
      </div>
    </>
  )
}
