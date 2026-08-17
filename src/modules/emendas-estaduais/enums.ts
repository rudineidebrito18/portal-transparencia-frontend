// Mesmo enum FonteEmenda do backend (compartilhado com emendas federais) — só os valores que
// fazem sentido no contexto estadual aparecem como opção no formulário aqui.
export enum FonteEmenda {
  MA_ESTADUAL = 'MA_ESTADUAL',
  MA_FEDERAL = 'MA_FEDERAL'
}

export const FonteEmendaDescricao: Record<FonteEmenda, string> = {
  [FonteEmenda.MA_ESTADUAL]: 'Portal da Transparência do Maranhão',
  [FonteEmenda.MA_FEDERAL]: 'Emenda federal no orçamento estadual'
}

export enum OrigemCadastroEmenda {
  MANUAL = 'MANUAL',
  API = 'API'
}

export const OrigemCadastroEmendaDescricao: Record<OrigemCadastroEmenda, string> = {
  [OrigemCadastroEmenda.MANUAL]: 'Cadastrado manualmente',
  [OrigemCadastroEmenda.API]: 'Sincronizado com fonte oficial'
}
