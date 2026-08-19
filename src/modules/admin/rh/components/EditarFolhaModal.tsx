'use client'

import { FormEvent, useEffect, useState } from 'react'
import { MdClose } from 'react-icons/md'

import { FolhaPagamentoRequest } from '../types'

const classeInput =
  'w-full bg-admin-surface-2 border border-admin-border rounded-lg px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-faint focus-visible:ring-2 focus-visible:ring-admin-accent/50 focus-visible:border-admin-accent outline-none transition-all'
const classeLabel = 'block text-xs font-semibold uppercase tracking-wide text-admin-text-faint mb-1.5'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

interface FolhaEditavel {
  id: number
  mes: number
  ano: number
  salarioBruto: number
  desconto: number
  cargoId?: number
}

interface CargoOpcao {
  id: number
  cargo: string
}

interface Props {
  aberto: boolean
  folha: FolhaEditavel | null
  // Cargos do servidor dono do lançamento — sem isso não tem como escolher/validar o cargo.
  cargos: CargoOpcao[]
  salvando: boolean
  erro: string | null
  onSalvar: (dados: FolhaPagamentoRequest) => void
  onFechar: () => void
}

// Edição de lançamento de folha — admin-only, exige confirmação explícita porque cada
// lançamento é tratado como definitivo por padrão (risco de fraude/adulteração de prova).
export default function EditarFolhaModal({ aberto, folha, cargos, salvando, erro, onSalvar, onFechar }: Props) {
  const [mes, setMes] = useState(1)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [salarioBruto, setSalarioBruto] = useState(0)
  const [desconto, setDesconto] = useState(0)
  const [cargoId, setCargoId] = useState<number | ''>('')

  useEffect(() => {
    if (folha) {
      setMes(folha.mes)
      setAno(folha.ano)
      setSalarioBruto(folha.salarioBruto)
      setDesconto(folha.desconto)
      setCargoId(folha.cargoId ?? (cargos.length === 1 ? cargos[0].id : ''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folha])

  if (!aberto || !folha) return null

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSalvar({ mes, ano, salarioBruto, desconto, salarioLiquido: salarioBruto - desconto, cargoId: cargoId || undefined })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onFechar} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="editar-folha-titulo"
        className="relative w-full max-w-md rounded-2xl border border-admin-border-strong bg-admin-surface-2 shadow-admin-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="editar-folha-titulo" className="text-base font-bold text-admin-text">Editar lançamento</h2>
          <button
            onClick={onFechar}
            aria-label="Fechar"
            className="p-1.5 rounded-lg text-admin-text-faint hover:bg-admin-surface-3 hover:text-admin-text transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {cargos.length > 1 && (
            <div>
              <label className={classeLabel} htmlFor="editar-cargo">Cargo</label>
              <select
                id="editar-cargo"
                required
                value={cargoId}
                onChange={e => setCargoId(Number(e.target.value))}
                className={classeInput}
              >
                <option value="" disabled>Selecione...</option>
                {cargos.map(c => (
                  <option key={c.id} value={c.id}>{c.cargo}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={classeLabel} htmlFor="editar-mes">Mês</label>
              <select id="editar-mes" value={mes} onChange={e => setMes(Number(e.target.value))} className={classeInput}>
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={classeLabel} htmlFor="editar-ano">Ano</label>
              <input
                id="editar-ano"
                type="number"
                required
                value={ano}
                onChange={e => setAno(Number(e.target.value))}
                className={classeInput}
              />
            </div>
            <div>
              <label className={classeLabel} htmlFor="editar-bruto">Salário bruto</label>
              <input
                id="editar-bruto"
                type="number"
                step="0.01"
                min={0}
                required
                value={salarioBruto}
                onChange={e => setSalarioBruto(Number(e.target.value))}
                className={classeInput}
              />
            </div>
            <div>
              <label className={classeLabel} htmlFor="editar-desconto">Desconto</label>
              <input
                id="editar-desconto"
                type="number"
                step="0.01"
                min={0}
                required
                value={desconto}
                onChange={e => setDesconto(Number(e.target.value))}
                className={classeInput}
              />
            </div>
          </div>

          {erro && <p className="text-sm text-admin-error">{erro}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onFechar}
              disabled={salvando}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-admin-text-muted hover:bg-admin-surface-3 hover:text-admin-text transition-colors disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-4 py-2 rounded-lg admin-gradient-accent text-white text-sm font-semibold shadow-admin-glow hover:brightness-110 transition-all disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
