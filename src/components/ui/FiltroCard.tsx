'use client'

import { ReactNode, useState } from 'react'
import { MdExpandLess, MdExpandMore, MdFilterList } from 'react-icons/md'

interface Props {
  subtituloPadrao: string
  filtrosAtivosCount: number
  children: ReactNode
}

// Card de filtro/busca padrão do site público — sempre começa fechado. Usado por todo
// *Filtro.tsx (Licitações, Servidores, Diárias, Emendas Parlamentares, Diário Oficial,
// Documento Genérico, Tabela de Valores, Secretarias). O grid de campos e os botões
// Limpar/Aplicar de cada tela ficam em `children`.
export default function FiltroCard({ subtituloPadrao, filtrosAtivosCount, children }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm mb-8 overflow-hidden">
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-neutral-light/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <MdFilterList size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-primary">Filtros de Busca</h2>
            <p className="text-xs text-text-secondary">
              {filtrosAtivosCount > 0
                ? `${filtrosAtivosCount} filtro(s) aplicado(s)`
                : subtituloPadrao}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {filtrosAtivosCount > 0 && !isExpanded && (
            <span className="bg-primary text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
              {filtrosAtivosCount}
            </span>
          )}
          {isExpanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-border/20 animate-in fade-in zoom-in-95 duration-200">
          {children}
        </div>
      )}
    </div>
  )
}
