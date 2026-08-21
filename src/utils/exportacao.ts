// jsPDF/jspdf-autotable NÃO são importados estaticamente aqui de propósito — o Next.js roda
// componentes client no servidor na primeira renderização (SSR), então um import estático
// no topo do arquivo entraria no bundle do servidor mesmo a função nunca rodando lá (achado
// real: bundle do Worker Cloudflare estourou 19MB por causa disso, jsPDF sozinho tem 29MB em
// disco). import() dinâmico dentro de exportarPDF garante que só carrega quando alguém de
// fato clica em "Exportar → PDF", no navegador.

// Definição de coluna para exportação. `chave` é o campo no item; `formatar` permite
// transformar o valor para exibição (datas dd/MM/yyyy, moeda, etc.). Se ausente,
// usa o valor cru do campo.
export interface ColunaExportacao<T = unknown> {
  chave: keyof T & string
  rotulo: string
  formatar?: (item: T) => string
}

interface LinhaNormalizada {
  chave: string
  rotulo: string
  valor: string
}

function valorTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return ''
  return String(valor)
}

// Converte os itens na forma comum a todos os formatos: linhas de {chave, rotulo, valor}.
// JSON usa `chave` (nome do campo original, útil pra consumo programático); CSV/XML/PDF
// usam `rotulo` (nome amigável pro cidadão).
function normalizarLinhas<T>(itens: T[], colunas: ColunaExportacao<T>[]): LinhaNormalizada[][] {
  return itens.map(item =>
    colunas.map(col => ({
      chave: col.chave,
      rotulo: col.rotulo,
      valor: col.formatar ? col.formatar(item) : valorTexto(item[col.chave])
    }))
  )
}

function baixarBlob(conteudo: BlobPart, nomeArquivo: string, tipoMime: string) {
  const blob = new Blob([conteudo], { type: tipoMime })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function nomeArquivoComExtensao(nomeBase: string, extensao: string): string {
  const limpo = nomeBase.trim().replace(/[^\w-]+/g, '-').replace(/-+/g, '-')
  return `${limpo || 'exportacao'}.${extensao}`
}

// --- CSV ---

function escaparCsv(valor: string): string {
  // Separação por ";" (padrão brasileiro pro Excel). Campos com ; " ou quebra de
  // linha precisam de aspas; aspas internas dobram.
  if (/[";\n\r]/.test(valor)) {
    return `"${valor.replace(/"/g, '""')}"`
  }
  return valor
}

export function exportarCSV<T>(itens: T[], colunas: ColunaExportacao<T>[], nomeBase: string): void {
  const linhas = normalizarLinhas(itens, colunas)
  const cabecalho = colunas.map(c => c.rotulo).join(';')
  const corpo = linhas.map(l => l.map(c => escaparCsv(c.valor)).join(';')).join('\r\n')

  // BOM UTF-8: sem ele o Excel abre com acentos corrompidos.
  const conteudo = `\uFEFF${cabecalho}\r\n${corpo}\r\n`
  baixarBlob(conteudo, nomeArquivoComExtensao(nomeBase, 'csv'), 'text/csv;charset=utf-8')
}

// --- JSON ---

export function exportarJSON<T>(itens: T[], colunas: ColunaExportacao<T>[], nomeBase: string): void {
  const linhas = normalizarLinhas(itens, colunas)
  const objetos = linhas.map(l =>
    Object.fromEntries(l.map(c => [c.chave, c.valor]))
  )
  const conteudo = JSON.stringify(objetos, null, 2)
  baixarBlob(conteudo, nomeArquivoComExtensao(nomeBase, 'json'), 'application/json;charset=utf-8')
}

// --- XML ---

function escaparXml(valor: string): string {
  return valor
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Nome do elemento XML derivado do campo original (identificadores simples, sem
// caracteres especiais) — evita elemento com acento/espaço, que é inválido em XML.
function nomeElementoXml(chave: string): string {
  return chave.replace(/[^a-zA-Z0-9_]/g, '_')
}

export function exportarXML<T>(itens: T[], colunas: ColunaExportacao<T>[], nomeBase: string): void {
  const linhas = normalizarLinhas(itens, colunas)
  const partes: string[] = ['<?xml version="1.0" encoding="UTF-8"?>', '<registros>']
  for (const linha of linhas) {
    partes.push('  <registro>')
    for (const campo of linha) {
      partes.push(`    <${nomeElementoXml(campo.chave)}>${escaparXml(campo.valor)}</${nomeElementoXml(campo.chave)}>`)
    }
    partes.push('  </registro>')
  }
  partes.push('</registros>')
  baixarBlob(partes.join('\n'), nomeArquivoComExtensao(nomeBase, 'xml'), 'application/xml;charset=utf-8')
}

// --- PDF (jsPDF + autotable) ---

export async function exportarPDF<T>(itens: T[], colunas: ColunaExportacao<T>[], nomeBase: string): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ])

  const linhas = normalizarLinhas(itens, colunas)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

  autoTable(doc, {
    head: [colunas.map(c => c.rotulo)],
    body: linhas.map(l => l.map(c => c.valor)),
    styles: {
      fontSize: 9,
      cellPadding: 5,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [15, 64, 102],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250]
    },
    margin: { top: 40 }
  })

  doc.setFontSize(10)
  doc.setTextColor(80)
  doc.text(
    `Exportado em ${new Date().toLocaleString('pt-BR')} — ${linhas.length} registro(s)`,
    40,
    25
  )

  doc.save(nomeArquivoComExtensao(nomeBase, 'pdf'))
}
