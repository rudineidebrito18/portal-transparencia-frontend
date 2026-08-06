interface OpcoesHrefDocumento {
  admin?: boolean
  origemLabel?: string
  origemHref?: string
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
