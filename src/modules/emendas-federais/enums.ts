export enum TipoEmenda {
  INDIVIDUAL = 'INDIVIDUAL',
  BANCADA = 'BANCADA',
  COMISSAO = 'COMISSAO',
  RELATOR = 'RELATOR'
}

export const TipoEmendaDescricao: Record<TipoEmenda, string> = {
  [TipoEmenda.INDIVIDUAL]: 'Individual',
  [TipoEmenda.BANCADA]: 'Bancada',
  [TipoEmenda.COMISSAO]: 'Comissão',
  [TipoEmenda.RELATOR]: 'Relator'
}

export enum FormaRepasseEmenda {
  TRANSFERENCIA_ESPECIAL = 'TRANSFERENCIA_ESPECIAL',
  TRANSFERENCIA_FINALIDADE_DEFINIDA = 'TRANSFERENCIA_FINALIDADE_DEFINIDA',
  CONVENIO = 'CONVENIO',
  FUNDO_A_FUNDO = 'FUNDO_A_FUNDO'
}

export const FormaRepasseEmendaDescricao: Record<FormaRepasseEmenda, string> = {
  [FormaRepasseEmenda.TRANSFERENCIA_ESPECIAL]: 'Transferência Especial',
  [FormaRepasseEmenda.TRANSFERENCIA_FINALIDADE_DEFINIDA]: 'Transferência com Finalidade Definida',
  [FormaRepasseEmenda.CONVENIO]: 'Convênio',
  [FormaRepasseEmenda.FUNDO_A_FUNDO]: 'Fundo a Fundo'
}

export enum FonteEmenda {
  CGU = 'CGU',
  TRANSFEREGOV = 'TRANSFEREGOV',
  SENADO = 'SENADO',
  MA_FEDERAL = 'MA_FEDERAL'
}

export const FonteEmendaDescricao: Record<FonteEmenda, string> = {
  [FonteEmenda.CGU]: 'Portal da Transparência (CGU)',
  [FonteEmenda.TRANSFEREGOV]: 'Transferegov',
  [FonteEmenda.SENADO]: 'Senado Federal',
  [FonteEmenda.MA_FEDERAL]: 'Orçamento do Estado do Maranhão'
}

export enum OrigemCadastroEmenda {
  MANUAL = 'MANUAL',
  API = 'API'
}

export const OrigemCadastroEmendaDescricao: Record<OrigemCadastroEmenda, string> = {
  [OrigemCadastroEmenda.MANUAL]: 'Cadastrado manualmente',
  [OrigemCadastroEmenda.API]: 'Sincronizado com fonte oficial'
}
