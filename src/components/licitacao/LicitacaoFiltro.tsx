'use client'
import { FiltroLicitacao } from '@/interfaces/Licitacao'
import { useState } from 'react'
import { MdEvent, MdFormatListBulleted, MdSearch } from 'react-icons/md'

interface Props {
  onFiltrar: (filtros: FiltroLicitacao) => void
}

export default function LicitacaoFiltro({ onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroLicitacao>({
    modalidade: '',
    numero: '',
    objeto: '',
    dataInicio: '',
    dataFim: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value }))
  }

  const handleFiltrar = () => {
    onFiltrar(filtros)
  }

  return (
    <div className="bg-[--color-neutral-light] p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-text-secondary mb-4 flex items-center gap-2">
        <MdFormatListBulleted /> Filtros de Licitação
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Modalidade */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Modalidade</label>
          <select
            name="modalidade"
            value={filtros.modalidade}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          >
            <option value="">Todas</option>
            <option value="Pregão Eletrônico">Pregão Eletrônico</option>
            <option value="Tomada de Preço">Tomada de Preço</option>
            <option value="Concorrência">Concorrência</option>
          </select>
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Número</label>
          <input
            name="numero"
            value={filtros.numero}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="Ex: 02/2025"
          />
        </div>

        {/* Objeto */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">Objeto</label>
          <input
            name="objeto"
            value={filtros.objeto}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="Buscar por objeto"
          />
        </div>

        {/* Data de início */}
        <div>
          <label className="text-sm text-text-secondary mb-1 flex items-center gap-1">
            <MdEvent /> Publicado de
          </label>
          <input
            type="date"
            name="dataInicio"
            value={filtros.dataInicio}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>

        {/* Data de fim */}
        <div>
          <label className="text-sm text-text-secondary mb-1 flex items-center gap-1">
            <MdEvent /> até
          </label>
          <input
            type="date"
            name="dataFim"
            value={filtros.dataFim}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>

        {/* Botão */}
        <div className="flex items-end">
          <button
            onClick={handleFiltrar}
            className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded flex items-center gap-2 w-full justify-center"
          >
            <MdSearch /> Buscar
          </button>
        </div>
      </div>
    </div>
  )
}
