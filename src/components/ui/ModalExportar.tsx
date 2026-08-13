'use client'

import { useEffect, useRef } from 'react'
import { MdClose, MdDownload } from 'react-icons/md'

import { exportarCSV, exportarJSON, exportarPDF, exportarXML, ColunaExportacao } from '@/utils/exportacao'

interface Props<T> {
  aberto: boolean
  titulo: string
  itens: T[]
  colunas: ColunaExportacao<T>[]
  nomeBaseArquivo: string
  aoFechar: () => void
  truncado?: boolean
}

interface FormatoDisponivel {
  id: 'csv' | 'json' | 'xml' | 'pdf'
  rotulo: string
  extensao: string
  cor: string
}

// Cor por formato só pra diferenciar visualmente os botões — sem significado semântico
// (ex: vermelho do PDF não indica erro/perigo aqui, é só identidade do formato).
const FORMATOS: FormatoDisponivel[] = [
  { id: 'csv', rotulo: 'CSV', extensao: '.csv', cor: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'json', rotulo: 'JSON', extensao: '.json', cor: 'bg-green-600 hover:bg-green-700' },
  { id: 'xml', rotulo: 'XML', extensao: '.xml', cor: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'pdf', rotulo: 'PDF', extensao: '.pdf', cor: 'bg-red-600 hover:bg-red-700' }
]

// Modal de exportação: `itens` já vem pronto do chamador (todos os registros que batem
// com os filtros/ordenação aplicados, buscados via buscarTudoParaExportar — não só a
// página atual). Mostra uma prévia em tabela e os formatos de download. Fecha com
// Escape/clique no overlay/×, como o ConfirmDialog do painel.
export default function ModalExportar<T>({
  aberto,
  titulo,
  itens,
  colunas,
  nomeBaseArquivo,
  aoFechar,
  truncado = false
}: Props<T>) {
  const fecharRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return

    fecharRef.current?.focus()

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoFechar])

  if (!aberto) return null

  function exportar(formato: FormatoDisponivel) {
    switch (formato.id) {
      case 'csv':
        exportarCSV(itens, colunas, nomeBaseArquivo)
        break
      case 'json':
        exportarJSON(itens, colunas, nomeBaseArquivo)
        break
      case 'xml':
        exportarXML(itens, colunas, nomeBaseArquivo)
        break
      case 'pdf':
        exportarPDF(itens, colunas, nomeBaseArquivo)
        break
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={aoFechar}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-exportar-titulo"
        className="relative w-full max-w-5xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/30">
          <div>
            <h2 id="modal-exportar-titulo" className="text-base font-bold text-text-secondary">
              {titulo}
            </h2>
            <p className="text-sm text-text-secondary/70">
              {itens.length} registro(s) — todos os resultados dos filtros aplicados.
            </p>
            {truncado && (
              <p className="text-sm text-amber-700 font-semibold mt-1">
                O resultado tem mais registros do que o limite de exportação ({itens.length}). Refine os filtros para exportar tudo.
              </p>
            )}
          </div>

          <button
            ref={fecharRef}
            onClick={aoFechar}
            aria-label="Fechar exportação"
            className="p-2 rounded-lg text-text-secondary hover:bg-neutral-light hover:text-primary transition-all"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* FORMATOS */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3 bg-neutral-light/60 border-b border-border/20">
          <span className="text-xs uppercase font-semibold text-text-muted mr-1">
            Baixar como:
          </span>
          {FORMATOS.map(formato => (
            <button
              key={formato.id}
              onClick={() => exportar(formato)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all active:scale-95 ${formato.cor}`}
            >
              <MdDownload size={16} />
              {formato.rotulo}
            </button>
          ))}
        </div>

        {/* TABELA PRÉVIA */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-text-secondary">
              <thead>
                <tr className="border-b-2 border-border/40">
                  {colunas.map(col => (
                    <th
                      key={col.chave}
                      scope="col"
                      className="text-left px-3 py-2 font-bold text-text-secondary whitespace-nowrap"
                    >
                      {col.rotulo}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itens.map((item, indice) => (
                  <tr key={indice} className="border-b border-border/20 hover:bg-neutral-light/50">
                    {colunas.map(col => (
                      <td key={col.chave} className="px-3 py-2 align-top">
                        {col.formatar
                          ? col.formatar(item)
                          : String(item[col.chave] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
