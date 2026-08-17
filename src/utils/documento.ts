interface OpcoesHrefDocumento {
  admin?: boolean
  origemLabel?: string
  origemHref?: string
}

// `caminhoArquivo` (vindo da API) é opaco pro frontend — path interno de armazenamento
// (disco em dev, chave no bucket R2 em produção), nunca uma URL navegável. A única forma
// correta de baixar/exibir o arquivo é pelo endpoint de download do próprio módulo,
// GET {basePath}/{id}/arquivo, que existe em todo módulo "documento genérico" e funciona
// nos dois storages. Helper único: se o backend um dia passar a servir alguns documentos
// direto de uma URL pública (CDN), muda só aqui.
export function urlArquivoDocumento(basePath: string, id: number | string): string {
  return `/api/${basePath.replace(/^\/+/, '')}/${id}/arquivo`
}

// Mesma ideia do urlArquivoDocumento, pros poucos módulos (Relatório de Gestão Fiscal,
// Relatório de Execução Orçamentária) que servem o mesmo registro em 3 formatos
// (GET {basePath}/{id}/pdf | /word | /xls) em vez de um único /arquivo.
export function urlFormatoDocumento(basePath: string, id: number | string, formato: 'pdf' | 'word' | 'xls'): string {
  return `/api/${basePath.replace(/^\/+/, '')}/${id}/${formato}`
}

// Monta o link pra rota dedicada de visualização de PDF (/documento no público,
// /admin/documento no painel) — navegação normal de página (mesma guia), não modal
// nem link externo. origemLabel/origemHref (só no público) viram o item intermediário
// do breadcrumb da página de destino, já que /documento é uma rota genérica sem como
// saber sozinha de onde o clique veio.
export function hrefDocumento(src: string, titulo: string, opcoes: OpcoesHrefDocumento = {}): string {
  const { admin = false, origemLabel, origemHref } = opcoes
  const base = admin ? '/admin/documento' : '/documento'
  const params = new URLSearchParams({ src, titulo })
  if (origemLabel) params.set('origemLabel', origemLabel)
  if (origemHref) params.set('origemHref', origemHref)
  return `${base}?${params.toString()}`
}
