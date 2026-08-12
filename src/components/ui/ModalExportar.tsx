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
}

interface FormatoDisponivel {
  id: 'csv' | 'json' | 'xml' | 'pdf'
  rotulo: string
  extensao: string
}

const FORMATOS: FormatoDisponivel[] = [
  { id: 'csv', rotulo: 'CSV', extensao: '.csv' },
  { id: 'json', rotulo: 'JSON', extensao: '.json' },
  { id: 'xml', rotulo: 'XML', extensao: '.xml' },
  { id: 'pdf', rotulo: 'PDF', extensao: '.pdf' }
]

// Modal de exportação dos dados atuais (somente o que está na tela, não busca nada):
// mostra uma prévia em tabela com os registros da página e os formatos de download
// acima. Fecha com Escape/clique no overlay/×, como o ConfirmDialog do painel.
export default function ModalExportar<T>({
  aberto,
  titulo,
  itens,
  colunas,
  nomeBaseArquivo,
  aoFechar
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
        className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border/30">
          <div>
            <h2 id="modal-exportar-titulo" className="text-base font-bold text-text-primary">
              {titulo}
            </h2>
            <p className="text-sm text-text-secondary/70">
              {itens.length} registro(s) na tela — exportação apenas do que está sendo exibido.
            </p>
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all active:scale-95"
            >
              <MdDownload size={16} />
              {formato.rotulo}
            </button>
          ))}
        </div>

        {/* TABELA PRÉVIA (só o conteúdo da página atual) */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-text-secondary">
              <thead>
                <tr className="border-b-2 border-border/40">
                  {colunas.map(col => (
                    <th
                      key={col.chave}
                      scope="col"
                      className="text-left px-3 py-2 font-bold text-text-primary whitespace-nowrap"
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
