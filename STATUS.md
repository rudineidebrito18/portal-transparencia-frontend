# Status do Projeto — Portal da Transparência (Frontend)

> Ponto de retomada: o que existe, os padrões a seguir, o que falta. Histórico detalhado de
> bugs/decisões de cada sessão fica no `git log`, não aqui.

## 1. Visão geral

Frontend Next.js (App Router) que consome um backend Spring Boot local
(`http://localhost:8080/api`, spec OpenAPI em `http://localhost:8080/v3/api-docs`).
Repositório do backend: `~/Documentos/ProjetoPref/portal-transparencia-pref` (repare no
`ProjetoPref/` no meio do caminho — já apareceu documentado errado sem esse segmento).

`.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK=true
```

Com `USE_MOCK=true`, os `*.service.ts` **do site público mais antigo** (`obras`, `institucional`
etc.) caem num mock local com `@faker-js/faker` em vez de bater no backend — então "funciona no
`npm run dev`" não confirma que o endpoint real existe ou tem esse formato. Módulos criados a
partir da fase do painel admin (tudo em `src/modules/admin/*` e módulos públicos mais recentes
como `secretarias`) não têm mock — sempre chamam o backend real. Sempre conferir o spec/código do
backend antes de criar algo novo (seção 3).

## 2. Módulos implementados

### Site público

A maior parte das seções do hub `/transparencia` (`src/modules/transparencia/data/secoes.ts`)
já está implementada seguindo os padrões da seção 3. Itens sem `href` no hub = "Em breve"
(endpoint ainda não existe no backend ou não foi priorizado — não é esquecimento).

Módulos com padrão bespoke (fogem do CRUD genérico, vale saber antes de mexer):
- `/obras` — bespoke paginado (`usePageableResource`), filtro real via `GET /obras/filtro`
  (`numero`, `status`, `tipo`, `unidadeId`, `fornecedorId`, `paralisada`); aba "Paralisadas"
  virou filtro de verdade, não mais client-side.
- `/concursos` — bespoke paginado (`usePageableResource`), filtro real via `GET
  /concursos/filtro` (`numero`, `ano`, `descricao`, `dataAberturaInicial`,
  `dataAberturaFinal`), `ConcursoFiltro.tsx` no padrão `FiltroCard`.
- `/gestao-fiscal` — segue com abas client-side (`GestaoFiscalView.tsx`, `useUrlState`,
  usuário pediu explicitamente pra manter assim em vez de virar 5 rotas). As 4 abas que
  não tinham filtro (Execução Orçamentária, RGF, Empresas em Dívida Ativa, Empresas
  Inidôneas/Suspensas) viraram bespoke paginado de verdade, filtro via `GET
  /gestao-fiscal/{recurso}/filtro` (cada uma com seu próprio `*Filtro.tsx` no padrão
  `FiltroCard`) — antes pediam `size: 500` fixo e devolviam array puro, sem paginação nem
  filtro nenhum. A 5ª aba (Renúncia Fiscal) já tinha filtro desde a migração pro
  `FiltroCard` (Grupo B).
- `/licitacoes`, `/contratos`, `/servidores` — detalhe em Server Component (`[id]/page.tsx`
  async, `notFound()` + `not-found.tsx`), não hook client-side.
- `/secretarias` + `/secretarias/[id]` — lista client-side com busca/filtro de vigência via
  `useUrlState`; detalhe é Server Component que faz 6 chamadas em paralelo (unidade + 5
  sub-recursos: decretos, documentos tipados, ex-gestores, ordenadores, setores) porque o
  backend não agrega isso na resposta da unidade. Detalhe reorganizado em abas (Informações
  do Órgão / Ex-Gestores / Ordenadores / Setores / Decretos, via `useUrlState` — mesmo padrão
  pill-button de `GestaoFiscalView.tsx`), com os 3 documentos tipados (Termo/EDTC/Declaração
  E-SIC) como botões de download acima das abas (desabilitado com "não disponível" se aquele
  tipo não foi cadastrado). Card da lista (`SecretariaCard.tsx`) mostra e-mail/telefone/
  horário/endereço com ícone em vez de atribuições truncadas, com CTA "Mais informações".
  Selo de "gestor verificado" é só o ícone `MdVerified` verde, sem texto
  (`SelinhoVerificado.tsx`, reaproveitado no card e no detalhe) — só no site público, o
  badge de texto do admin não foi mexido (fora do escopo pedido). Grid da lista em 3 colunas
  (`sm:grid-cols-2 lg:grid-cols-3`) via novo prop `gridClassName` em `AsyncList` (default
  inalterado, não afeta as outras páginas públicas que usam o componente). **`[id]/loading.tsx`
  novo fez o Next.js envolver a rota num `<Suspense>` implícito — reproduziu a pegadinha de
  Suspense-trava-no-preview (ver abaixo) numa rota que antes não tinha esse problema
  (Server Component sem Suspense explícito antes); confirmado correto via `curl` direto no
  servidor (HTML final com o conteúdo certo), não via preview.** **Bug real encontrado pelo
  usuário no navegador de verdade (não a pegadinha de preview)**: `secretariasService.listar()`
  (público) nunca tinha sido migrado quando a paginação de `GET /geral/unidades` foi
  corrigida no admin, mais cedo nesta mesma sessão — ficou esquecido por não estar na lista
  de módulos daquela rodada. Quebrava com `data.map is not a function` assim que alguém
  abria `/secretarias` de verdade. Corrigido do mesmo jeito que os outros casos "sem UI de
  paginação": pede `size: 200` e usa só `.content`. Os 5 sub-recursos (decretos, documentos,
  ex-gestores, ordenadores, setores) seguem array puro, não foram afetados (confirmado via
  `curl` direto no backend). **Foto do gestor trocada de `<img>` puro pra `next/image`**
  (`SecretariaCard.tsx`, `SecretariaDetalhe.tsx`) — usuário reportou "qualidade baixa" na
  foto; investigação confirmou que não é downgrade no upload (`FileStorageServiceImpl.salvar`
  no backend só faz `Files.copy()`, sem nenhuma lib de imagem — o arquivo original é salvo e
  servido sem alteração), é o front pedindo pro navegador espremer um JPEG de ~9.3MB/
  4912×7360px num avatar de 40–96px via CSS puro. `next/image` funciona direto com a URL
  relativa (`/api/geral/unidades/{id}/foto`) porque `next.config.ts` já reescreve `/api/*`
  pro backend — não precisou configurar `images.remotePatterns`. Confirmado via `curl` no
  endpoint `/_next/image`: mesma foto cai pra ~11KB/256×384 já otimizada. Esse é o primeiro
  uso de `next/image` no projeto (resto do site usa `<img>` cru, warning do eslint
  `@next/next/no-img-element` aceito/ignorado nos outros lugares) — se o mesmo problema
  aparecer no card de outros módulos (Obras, Fornecedor etc.) ou na tela de detalhe do admin
  de Unidades, o mesmo padrão serve.
- `/estrutura-organizacional`, `/diarias-legislacao` — PDF estático via `PdfViewer`, sem
  backend (`/test.pdf` placeholder).
- `/organograma` (2026-08-05) — **não é mais PDF**, virou diagrama HTML/CSS
  (`src/components/OrganogramaDiagrama.tsx`) com a estrutura real da Prefeitura de Lago
  dos Rodrigues (Lei Municipal nº 88/2009, alterada pela Lei nº 164/2016) — este sistema
  substitui o portal atual dessa prefeitura, então não é dado de exemplo de outro
  município. Conteúdo veio de um print do organograma do site antigo (o PDF de origem é
  gerado client-side via `jsPDF`+`dom-to-image` na aplicação deles, não dá pra baixar via
  `curl`/fetch — sem headless browser neste ambiente pra reproduzir a exportação).
  Hierarquia simplificada em relação à imagem original: lá, Assessorias e os 5 órgãos de
  apoio (CPL, Pregoeiro, Tesouraria, Junta Militar, Setor de Identificação) apareciam em
  duas fileiras separadas só por causa da largura da imagem; aqui viraram um grupo único
  (mesmo nível hierárquico, todos vinculados ao Gabinete do Prefeito), com quebra de
  linha responsiva via `flex-wrap` em vez de fileiras fixas. Assessorias/CPL/Pregoeiro/
  etc. são texto fixo no componente (não têm cadastro de `Unidade` própria no backend,
  organograma "dificilmente muda" nessa parte, decisão do usuário). **Gabinete do
  Prefeito e Secretarias Municipais, ao contrário, são 100% dinâmicos**
  (`secretariasService.listar()`, Server Component, `async function`): Gabinete ocupa
  posição fixa/especial no diagrama (entre Vice-Prefeito e as assessorias), então é
  achado por nome normalizado (sem acento, `includes()` nos dois sentidos — tolerante a
  nome cadastrado diferente do exato "Gabinete do Prefeito"); Secretarias não tem lista
  fixa nenhuma — é literalmente `unidades.filter(u => u.id !== gabinete?.id)`, então
  cresce sozinha conforme o admin cadastra novas secretarias, sem precisar tocar no
  componente de novo. Testado contra o backend real: as 4 unidades cadastradas em dev
  (Gabinete do Prefeito, Saúde, Educação, e uma "Secretaria de Teste" que nem sabíamos
  que existia no ambiente) apareceram automaticamente, cada uma linkada pra
  `/secretarias/{id}`. Lista vazia (nenhuma secretaria cadastrada ainda) mostra uma
  mensagem em vez de grupo vazio. `/estrutura-organizacional` continua com PDF
  placeholder, não mexida nessa rodada.
- **`/competencias` (novo, 2026-08-05) — pendência de backend, front+admin já prontos.**
  Referência de Lago dos Rodrigues tinha um anchor "COMPETÊNCIAS" na mesma página do
  organograma, mas apontava pra um PDF quebrado no site deles. Decisão: em vez de
  replicar o link quebrado, virou módulo genérico novo — mesmo padrão dos outros 27
  (`slug: 'competencias'`, `categoria: 'Institucional'`, `basePath:
  '/institucional/competencias'`, `comIntervalo: false`, `papelMinimoEdicao:
  'ROLE_MANAGER'`, registry.ts). Front construído por completo seguindo `legislacao`
  como molde exato (`criarServicoDocumentoGenerico`/`criarUseDocumentosGenerico`/
  `criarMockDocumentoGenerico` — só 4 arquivos finos, ~10 linhas cada): `src/modules/competencias/`
  + `src/app/competencias/{page,loading,error}.tsx`. **Admin não precisou de nenhum
  arquivo novo** — só a linha no `registry.ts` já basta, `/admin/modulos/competencias`
  funciona via a rota dinâmica `[slug]` + `GenericCrudPage` que já existiam. Linkado em
  `Header.tsx` (dropdown "A PREFEITURA"), `Footer.tsx`, `mapa-do-site/page.tsx`,
  `secoes.ts` (hub, seção "Informações Institucionais") e um link cruzado no fim do
  `OrganogramaDiagrama.tsx`. **Endpoint não existe no backend ainda** — testado (`GET
  /institucional/competencias/filtro` devolve `500`, não `404`, provavelmente o
  catch-all de exceção de novo, ver seção de RBAC mais acima) — pedido completo
  documentado em `prompt-backend-competencias.md` (scratchpad da sessão). Front já
  degrada bem enquanto isso: `ErrorState` na tela pública, filtro/paginação funcionam
  assim que o endpoint existir, sem precisar tocar em nada de novo.
- `/diario-oficial` — fluxo de publicação mais simples (busca com filtros); o site público só
  lê `EdicaoDiario` já publicada. O fluxo de aprovação/assinatura em si é admin (seção seguinte).

### Painel administrativo (`/admin/*`)

Login via `POST /users/login` (fora do prefixo `/api`). JWT não carrega roles nem id —
`detectarPapeisEId` (`src/modules/auth/auth.service.ts`) usa `GET /api/admin/users` como sonda
(200 = `ROLE_ADMINISTRATOR`, 403 = `ROLE_MANAGER`). `middleware.ts` barra `/admin/*` sem cookie
só por UX — a proteção real é o backend (Spring Security barra `POST`/`PUT`/`DELETE` sem sessão
válida). RBAC em `src/modules/auth/permissoes.ts` (`podeCriar`/`podeEditar`/`podeExcluir` por
`GrupoModulo`).

Layout (`src/app/admin/(painel)/layout.tsx` + `AdminSidebar.tsx`): container `h-screen
overflow-hidden`, `<main>` com `overflow-y-auto` — só o conteúdo rola, a sidebar fica travada na
altura da tela (o menu interno dela já tinha `overflow-y-auto` próprio, mas só passou a
funcionar de verdade depois dessa mudança). Manter esse padrão em qualquer ajuste de layout do
painel — não voltar pro `min-h-screen` na raiz, que faz a página inteira crescer e arrasta a
sidebar junto no scroll.

| Área | Rota | Grupo de permissão | Observação relevante |
|---|---|---|---|
| Motor de CRUD genérico (~27 módulos "padrão", seção 6.7 do prompt do backend) | `/admin/modulos/[slug]` | por módulo (`registry.ts`) | rota dinâmica única, evita duplicar página por recurso |
| Gestão de usuários | `/admin/usuarios` | admin-only | soft-delete (desativar/reativar, não exclui de verdade); auto-proteção pra própria conta; bespoke paginado (sem `/filtro` dedicado). **`GET /api/admin/users` também é usado como sonda de detecção de papel** (ver `src/modules/auth/auth.service.ts` `detectarPapeisEId` — não existe endpoint `/me`, então o frontend testa se o usuário consegue listar usuários pra inferir `ROLE_ADMINISTRATOR`) — se esse endpoint mudar de contrato de novo, quebra a detecção de admin em todo o painel silenciosamente (ver "bug crítico" na seção 2.1 abaixo) |
| Auditoria | `/admin/auditoria` | admin-only | **cobertura completa desde 2026-08-05** — módulos bespoke (licitações, obras, RH específico, diário oficial etc.) passaram a gerar registro igual aos módulos genéricos. Contrato de resposta/filtro (`AuditLog`/`FiltroAuditoria`) não mudou, confirmado via OpenAPI + teste real (criar/excluir um Cargo gerou log na hora) — só texto da tela foi atualizado, nenhuma mudança de tipo/service |
| Avisos | `/admin/institucional/avisos` | `institucional` | JSON puro, `InstitucionalCrudPage` genérico |
| Notícias | `/admin/institucional/noticias` | `institucional` | multipart (`dados`+`imagem` opcional), form próprio (não usa o genérico) |
| Fornecedores | `/admin/geral/fornecedores` | `geral` | bespoke paginado (`usePageableResource`), filtro via `GET .../filtro` (`nome`, `cnpj`); `GeralSimplesCrudPage.tsx` genérico foi removido (só Fornecedores usava, virou página própria) |
| Secretarias (Unidade + 5 sub-recursos) | `/admin/geral/unidades` + `/admin/geral/unidades/[id]` | `geral` | **Unidade voltou a ser JSON puro em 2026-08-05** (era multipart até então) — bespoke paginado (`GET` base já aceita `nome`/`vigencia` como query params direto, sem `/filtro` separado); detalhe com abas pros 5 sub-recursos; Documentos tipados são 3 slots fixos (Termo/EDTC/Declaração E-SIC), reenviar substitui; excluir a unidade dá `409` se tiver sub-recurso vinculado (sem cascade) — excluir os 5 primeiro. **Gestor virou recurso próprio** (`gestorAtual` na Unidade, aba "Gestores" no detalhe) — ver seção 2.6 |
| Perfil do Prefeito / Vice-Prefeito | `/admin/geral/prefeito` + `/admin/geral/vice-prefeito` | `geral` | singleton (upsert, 404 antes de configurado), multipart com foto opcional (mantém a atual se omitida); dois recursos independentes, sem vínculo com `Unidade`; formulário compartilhado (`AutoridadeConfigPage.tsx`), só título/service mudam. Ver seção 2.5 |
| Tabela de Valores de Diária | `/admin/geral/tabela-valores` | `geral` | multipart; **o OpenAPI documenta esse endpoint como JSON por engano, é multipart de verdade** |
| E-SIC — Configuração | `/admin/esic/config` | `esic-ouvidoria` | singleton (upsert, 404 antes de configurado) |
| E-SIC — Formulários recebidos | `/admin/esic/formularios` | `esic-ouvidoria` | somente leitura; bespoke paginado, filtro via `GET .../filtro` (`tipoSolicitacao`, `nome`, `email`, `dataInicial`, `dataFinal`) — `GET .../tipo` foi removido pelo backend, não usar mais |
| Ouvidoria — Configuração | `/admin/ouvidoria/config` | `esic-ouvidoria` | singleton (upsert, 404 antes de configurado) |
| Ouvidoria — Formulários recebidos | `/admin/ouvidoria/formularios` | `esic-ouvidoria` | somente leitura; bespoke paginado, filtro via `GET .../filtro` (`finalidade`, `nome`, `email`, `dataInicial`, `dataFinal`) — espelha E-SIC Formulários; **GET agora exige login MANAGER+** (antes era público, bug de privacidade corrigido pelo backend em 2026-08-04, ver seção 2.4) |
| Servidores, Cargos, Diárias | `/admin/rh/{servidores,cargos,diarias}` | `rh` | bespoke paginado nos 3 (Cargos migrou de lista simples pra bespoke paginado em 2026-08-04, filtro via `GET /recursos-humanos/cargos/filtro` — `cargo`, `valorBrutoMin`, `valorBrutoMax`; ver seção 2.4) |
| Folha de Pagamento | `/admin/rh/folha` | `rh` | **sem `PUT`/`DELETE`** — lançamento é definitivo. Aba "Por mês" (`folha.service.ts` `listarPorMes`) já migrada pra `Page` (`GET .../folha/por-mes?mes=&ano=`, pede `size: 1000` e usa só `.content`, sem UI de paginação) |
| Concursos | `/admin/rh/concursos` + `[id]` (anexos) | `padrao` (não `rh`!) | única exceção do grupo RH — segue a regra geral de MANAGER; bespoke paginado (admin + público), filtro via `GET .../filtro` (`numero`, `ano`, `descricao`, `dataAberturaInicial`, `dataAberturaFinal` — sem `status`); anexos por concurso continuam array simples (não paginado, é sub-listagem naturalmente pequena) |
| Convênios | `/admin/convenios` | `obras-repasses` | multipart (`dto`+`pdf`); bespoke paginado, filtro via `GET .../filtro` (`numero`, `convenente`, `dataAssinaturaInicial`, `dataAssinaturaFinal`) — não confundir com o módulo público de Convênios (Transferências/Acordos), que é outro recurso e já estava correto |
| Emendas Parlamentares | `/admin/emendas-parlamentares` | `obras-repasses` | JSON paginado, filtro por tipo OU ano (não combinável) |
| Obras Públicas | `/admin/obras` + `/admin/obras/[id]` (Medições/Anexos/ART) | `obras-repasses`, **exceto ART = `padrao`** | campos calculados da obra (`totalMedicao`, `saldoObra` etc.) dependem do módulo Licitações (contratos), ainda não implementado — ficam em 0/negativo até lá, não é bug. Bespoke paginado (admin + público), filtro via `GET .../filtro` (`numero`, `status`, `tipo`, `unidadeId`, `fornecedorId`, `paralisada`) — público migrou de "sem paginação"/filtro em memória pra filtro real no backend; Medições/Anexos/ART continuam array simples (sub-recurso pequeno, sem paginação) |
| Licitações (Licitação + Contratos + Aditivos + Órgãos) | `/admin/licitacoes` + `/admin/licitacoes/[id]` (Documentos/Contratos/Órgãos) + `/admin/licitacoes/contratos/[contratoId]` (Documento/Aditivos) | `licitacoes` | 3 níveis (licitação → contrato → aditivo/documento); editar/excluir Contrato na própria aba; Aditivo edita com reenvio opcional de PDF; RBAC combinada: editar é `MANAGER`, excluir é admin-only (`licitacoes` fora do `EDITAR_ADMIN_ONLY`, dentro do `EXCLUIR_ADMIN_ONLY` em `permissoes.ts`); status/tipo de procedimento vêm do backend como texto (não a chave do enum) — `enumMapping.ts` reverte pra popular `<select>` de edição e colorir o Badge. **Licitação não tem mais `DELETE`** (exigência do TCE, preserva sequência/histórico) — troca por `PATCH .../visibilidade` (ocultar/mostrar da consulta pública, admin-only, botão com ícone de olho); toda licitação tem `numeroSequencial` (nº oficial do TCE, mostrado em destaque na lista e no detalhe) e `visivel`; filtro `visivel` em `/buscar` é admin-only (403 pra MANAGER) — só aparece na UI pra quem é `ROLE_ADMINISTRATOR` (`FiltroLicitacaoAdmin`, separado do `FiltroLicitacao` público de propósito). `GET /licitacoes/contratos/aditivos` (listagem por contrato) também virou sempre paginado — como aditivos por contrato são poucos, o service só pede uma página grande (`size: 100`) e devolve `.content`, sem UI de paginação. **Aba "Órgãos" nova (2026-08-04)**: `LicitacaoOrgao` (`GET`/`POST`/`PUT`/`DELETE /licitacoes/{id}/orgaos`), padrão PNCP de compra compartilhada — 1 `GERENCIADOR` + N `PARTICIPANTE`s, `unidadeId` + `ordenador` (texto livre, snapshot) + `tipo`; backend valida com `409` (só 1 gerenciador, unidade não duplicada) — mensagem do backend já sobe direto pro `erroForm` via `e.message`. Sem paginação (volume baixo por licitação). Ver seção 2.4 |
| Diário Oficial — Configuração | `/admin/diario-oficial/config` | `diario-oficial` | singleton multipart; **brasão e logo são partes obrigatórias sempre** — não tem como editar só texto sem reenviar as duas imagens (backend, não é bug do front) |
| Diário Oficial — Publicações | `/admin/diario-oficial/publicacoes` (fila paginada com filtro por status + criar) + `/admin/diario-oficial/publicacoes/[id]` (status + timeline de logs + aprovar/rejeitar/retomar/excluir) | `diario-oficial` | pipeline assíncrono real (validação → composição do documento oficial com cabeçalho/rodapé/QR code → aguarda aprovação humana → assinatura digital ICP-Brasil de verdade via DSS → publica → indexa no Meilisearch); página de detalhe faz polling a cada 3s enquanto o processamento automático está rodando; existe um job de reconciliação no backend que retoma sozinho solicitações travadas há +15min — já vimos ele falhar de verdade numa fixture por não conseguir alcançar o TSA externo (freetsa.org) a partir do ambiente local, não é bug do front. **Dois excluir admin-only na tela de detalhe** (só aparecem se status `FALHOU`/`PUBLICADO`): "Excluir da fila" (`DELETE .../publicacoes/{id}`, só tira da lista) e "Excluir edição publicada" (`DELETE /edicoes/{numero}`, só quando `PUBLICADO` — apaga PDF + índice no Meilisearch de verdade, redireciona pra lista depois); `diario-oficial` foi adicionado ao `EXCLUIR_ADMIN_ONLY` em `permissoes.ts` pra isso |
| Anticorrupção (Empresas em Dívida Ativa + Empresas Inidôneas/Suspensas) | `/admin/anticorrupcao/empresas-divida-ativa` (CRUD completo) + `/admin/anticorrupcao/empresas-inidoneas` (CRUD completo) | `anticorrupcao` (admin-only edit/exclude) | bespoke paginado (`usePageableResource`, filtro via `GET .../filtro` com `nome`/`razaoSocial`/`cnpj` ou `empresa`/`cnpj`/`status` + `dataInicial`/`dataFinal`), multipart `dados`+`pdf` (pdf sempre opcional, nome da parte é `pdf`, não `arquivo`); aparece na sidebar mesclado na categoria "Fiscal e Orçamentário" (mesma UI da Renúncia Fiscal), mas o grupo de permissão é `anticorrupcao`, não `fiscal-orcamentario` — só a categoria visual é compartilhada |

Estagiários/Terceirizados e Fiscal de Contratos usam o motor de CRUD genérico (não têm entrada
própria na tabela acima). Todos os módulos bespoke planejados estão implementados — não há mais
nenhum item "em breve" na sidebar.

**Lacunas de backend já resolvidas** (commits `b498a64`, `95830a0`, `d986dbf`, `2520a21`,
`cfc007b`, `50663b4`, `26cf489`, `3d70b68` no repo do backend, 2026-07-20/21 — frontend já
atualizado e testado contra elas):
- `EmpresaDividaAtivaServiceImpl.atualizar` (`PUT /api/gestao-fiscal/empresas-divida-ativa/{id}`)
  apagava o PDF existente sempre que o `PUT` não vinha com arquivo novo — corrigido pra só mexer
  no arquivo dentro do `if (pdf != null && !pdf.isEmpty())`, mesmo padrão de
  `ConvenioServiceImpl.atualizar`. Confirmado via `curl` e pela UI (editar sem reenviar arquivo
  agora preserva o PDF atual).
- Licitação, Contrato e Aditivo ganharam `PUT` (`ROLE_MANAGER`, `DELETE` continua
  `ROLE_ADMINISTRATOR`); Contrato ganhou `DELETE` (cascateia documentos e aditivos).
- Aditivo: `POST`/`PUT` viraram multipart (`dados` + `arquivo` opcional) — upload de PDF real,
  `caminhoPdf` some do request e passa a ser preenchido pelo backend a partir do arquivo.
- Bug do `GET /api/licitacoes/{licitacaoId}/contratos/filter` (ignorava `licitacaoId`)
  corrigido — segue sem uso no frontend (usamos `/{licitacaoId}/contratos` direto).
- Path de Fiscal de Contratos: `/api/licitacao/...` → `/api/licitacoes/...` (plural, consistente
  com o resto do módulo) — `basePath` ajustado em `registry.ts`.
- `GET /api/edicoes/publicacoes` (listagem paginada, filtro por `status`) e
  `GET /api/edicoes/publicacoes/{id}/logs` (timeline de `LogEtapaProcessamento`) — desbloqueou a
  fila de aprovação e o histórico de etapas na tela de detalhe.
- `DELETE /api/licitacoes/{id}` removido (exigência do TCE) — substituído por
  `PATCH .../visibilidade`; `numeroSequencial` (TCE) e `visivel` novos no response;
  `visivel` filtrável em `/buscar`, admin-only. **Observação**: `DELETE` nesse path agora
  devolve `500` em vez de `404`/`405` — não afeta o frontend (não chamamos mais esse endpoint),
  mas vale o backend investigar se isso é intencional.
- `GET /api/gestao-fiscal/empresas-divida-ativa` e `GET /api/gestao-fiscal/empresas-inidoneas`
  passaram de array puro pra `Page<T>` (agora exigem `pageable`), sem aviso prévio — quebrou o
  módulo Anticorrupção logo depois de commitado (a página ficava só com o cabeçalho, sem tabela
  nem erro visível, porque `Page` não é array e `.length` de um objeto não é `0` nem `>0`).
  Também surgiu `GET .../filtro` nos dois recursos (`nome`/`razaoSocial`/`cnpj`/`dataInicial`/
  `dataFinal` na dívida ativa; `empresa`/`cnpj`/`status`/`dataInicial`/`dataFinal` nas inidôneas).
  Aproveitado pra migrar os dois de "sem paginação" pra "bespoke paginado" de vez, com filtro de
  verdade na UI — ver tabela de módulos acima.
- `EmpresaInidoneaSuspensaController`/`Service` ganharam `PUT /api/gestao-fiscal/empresas-inidoneas/{id}`
  (multipart `dados`+`pdf`, mesmo padrão condicional de PDF do `atualizar` de Dívida Ativa — só
  mexe no arquivo se `pdf` vier preenchido). Frontend ganhou o botão "Editar" nessa tela.
  Confirmado via leitura do controller/service e teste na UI (editar nome sem reenviar PDF
  preserva o "Ver PDF"; `PUT` retornou `200`).

**Lacuna de backend ainda pendente** (decisão consciente, adiada — não é bug):
- Fiscal de Contratos continua sem vínculo (FK) com Contrato/Licitação — é um cadastro de
  documento avulso genérico (`{descricao, data, caminhoArquivo}`), apesar do nome sugerir que
  seria ligado a um contrato específico. Só vira trabalho se virar requisito de produto.

## 2.1 Rodada de paginação em massa (2026-07-23) — concluída

Backend adicionou paginação/filtro em ~12 módulos que devolviam `List` pura — cada `GET`
afetado passou de array puro pra `Page<T>`, quebrando qualquer tela que lia a resposta
como array (geralmente sem erro visível: a tela ficava só sem tabela nem mensagem de
vazio).

**Corrigido e testado**: e-SIC Formulários, Fornecedor, Unidade, Convênio (admin), Obra
Pública (admin+público), Aditivo de Contrato (admin+público), Concurso (admin+público),
Usuários (admin), Folha de Pagamento ("Por mês"), RGF e RREO (público) — ver observações
na tabela de módulos acima. Módulos com filtro real no backend ganharam UI de filtro +
`usePageableResource`; sub-listagens naturalmente pequenas sem `/filtro` dedicado só
desembrulham `.content` pedindo uma página grande (`size: 200`–`500`), sem UI de
paginação nova. Dois endpoints novos do Diário Oficial (não-breaking): "Excluir da
fila"/"Excluir edição publicada", admin-only.

**Bug crítico corrigido**: `detectarPapeisEId` (`auth.service.ts`) descobre se quem
logou é admin chamando `usuariosService.listar()` e fazia `.find(...)` direto esperando
array — como `GET /api/admin/users` também virou `Page<T>`, `.find` falhava, caía no
`catch` e **todo login de admin era rebaixado silenciosamente pra Gerente** (perdia
botões de editar/excluir em qualquer grupo admin-only). Corrigido pra ler
`pagina.content`. Se botões de admin sumirem sem motivo aparente, checar esse arquivo
primeiro.

`GET /api/licitacoes` (bare) foi removido pelo backend, mas nenhum arquivo do frontend
chamava esse path (já usava `/licitacoes/buscar`) — confirmado, nada a fazer.

## 2.2 Filtros públicos + bug de Secretarias (2026-07-24) — concluído/atualizado

**Filtro/busca nas telas públicas sem nenhum** (`/contratos`, `/obras`, `/concursos`,
`/avisos`, `/noticias`) — só Obras e Concursos tinham suporte no backend.
- **Obras e Concursos**: implementados — `ObraFiltro.tsx` (Número, Status, Tipo, Unidade,
  Fornecedor, "Só paralisadas") e `ConcursoFiltro.tsx` (Número, Ano, Descrição, Abertura
  início/fim), padrão `FiltroCard`. Criado `src/modules/fornecedores/` (módulo público
  mínimo, só faltava o service — GET já é `permitAll()` no backend).
- **Contratos e Avisos/Notícias**: sem suporte no backend — pedido documentado em
  `prompt-backend-filtros-contratos-avisos.md` (generalizar filtro de Contrato pra
  listagem global + intervalo de data; adicionar `titulo`+intervalo em Avisos/Notícias).
  Nota à parte: `StatusLicitacao` real do backend tem mais valores do que o mapa
  hardcoded do frontend (`src/modules/contratos/status.ts`) — rótulo errado pra parte
  dos contratos, não bloqueante.

**Bug relatado "filtro de `/secretarias` não funciona"** — backend confirmado filtrando
certo via `curl`/`fetch`; código revisado sem bug encontrado. Mais provável que o teste
original tenha coincidido com os servidores fora do ar (ambos caídos no início desta
sessão). Considerar resolvido a menos que reapareça num teste novo.

## 2.3 Auditoria de filtro em todo o hub `/transparencia` (2026-07-24) — concluído

Levantamento completo (~50 combinações rota/aba de `secoes.ts`) cruzado contra o backend
real. Quase tudo já estava filtrado (Licitações, Diárias, Servidores, Emendas, Obras,
Concursos, Tabela de Valores, todos os módulos de "documento genérico"). Lacunas reais:
- **4 abas de Gestão Fiscal** (Execução Orçamentária, RGF, Dívida Ativa, Inidôneas) —
  backend já tinha `/filtro` pronto, só faltava a UI. Implementado nesta rodada.
- **`/contratos` e `/avisos`/`/noticias`** — sem suporte no backend, já cobertos pelo
  pedido da seção 2.2.
- **`/cargos`** — `GET /recursos-humanos/cargos` sem filtro nem paginação (lacuna nova) —
  adicionado ao mesmo pedido de backend.
- **`/folha-pagamento`** — só filtra `mes`/`ano`; `FolhaPagamentoMesView.tsx` migrado pro
  padrão visual `FiltroCard` (mês/ano continuam aplicando na hora, ganhou botão "Voltar
  pro mês atual" em vez de Limpar). Baixo valor pra virar pedido de backend.
- `/esic`, `/ouvidoria` são objeto único (filtro não se aplica); páginas estáticas
  (`/diarias-legislacao`, `/estrutura-organizacional`, `/organograma`, `/faq`, `/lgpd`)
  não têm backend.

**Header "N encontrados + Ordenar"** adicionado nas listagens que faltavam (Concursos,
Obras, os 4 de Gestão Fiscal, Avisos/Notícias, `<select>` de Emendas) — só UI consumindo
dado que o hook já calculava.

**Bug encontrado**: `obra.mock.ts`/`concurso.mock.ts` (e o `gestaoFiscal.mock.ts` novo,
que copiou o mesmo padrão) ignoravam completamente o parâmetro `sort` — o `<select>` de
Ordenar não fazia nada em mock (`NEXT_PUBLIC_USE_MOCK=true`). Migrados pro helper
compartilhado `ordenar()`/`paginar()` (`src/modules/shared/mocks/mockUtils.ts`, já usado
certo em outros mocks) — checar que qualquer mock novo que pagine em memória usa esse
helper em vez de reimplementar paginação na mão.

## 2.4 Adaptação aos 5 itens de prioridade alta do backend (2026-08-04) — concluído

Sessão em máquina nova (PC de casa, ver seção 4 sobre o ambiente) — backend implementou 5
pedidos de prioridade alta (commit `d3b28d8` do repo backend) e o frontend adaptou todos no
mesmo dia, testado direto contra o backend real (`curl` com token, não só leitura de código).
Nenhuma mudança de arquitetura, só consumo das novas capacidades.

1. **Cargos migrou de "lista simples" pra bespoke paginado** — `GET
   /recursos-humanos/cargos` virou `Page<Cargo>` (breaking) e ganhou `GET .../filtro`
   (`cargo`, `valorBrutoMin`, `valorBrutoMax`). Público (`/cargos`) e admin
   (`/admin/rh/cargos`) migrados pro padrão `usePageableResource` + `FiltroCard`/filtro
   inline, igual Fornecedores. Os 2 cards de resumo (`TabelaCargos.tsx`) recalculam a
   partir de `cargos` (agora só a página atual, não mais a lista inteira) — renomeados pra
   "nesta página" em vez de "total" pra não mentir sobre o escopo do número.
2. **Diárias ganhou `unidadeId`** — filtro (`GET /diarias/buscar?unidadeId=`) e cadastro
   (`POST`/`PUT` aceitam `unidadeId` opcional; resposta ganhou `unidadeNome`). `<select>`
   de Unidade adicionado no `DiariaFiltro.tsx` (público) e no form admin
   (`/admin/rh/diarias`), populado via `secretariasService`/`unidadesService` (mesmo
   padrão de `ObraFiltro.tsx`). Diárias antigas ficam com `unidadeId: null` — tratado como
   "Não vinculada" no `<select>` de edição e `—` na listagem.
3. **Avisos/Notícias ganharam filtro** (`GET /institucional/{avisos,noticias}/filtro?titulo=&dataInicial=&dataFinal=`)
   — fechava a lacuna que a seção 2.2 já tinha documentado como bloqueada por backend.
   `useAvisos`/`useNoticias` trocaram `Record<string, never>` por um `FiltroConteudoInstitucional`
   de verdade; `ativo: true` continua fixo no fetch (regra de negócio do site público, não
   vira filtro exposto na UI). Componente novo `ConteudoInstitucionalFiltro.tsx`
   compartilhado pelos dois (mesmo padrão dos outros `*Filtro.tsx`). Admin (`InstitucionalCrudPage`)
   não mexido — o pedido original era só do lado público.
4. **Licitações — `unidade` (string, nunca funcionou de verdade) virou `unidadeId`
   (Long)** em `GET /licitacoes/buscar` — breaking change. `FiltroLicitacao.unidade` foi
   removido do tipo (não existia UI pra ele mesmo, só o campo no tipo); `unidadeId` novo
   com `<select>` real no `LicitacaoFiltro.tsx` (público) e na barra de filtro do
   `/admin/licitacoes` (antes não tinha filtro de unidade nenhum ali). **Importante**: o
   campo "Unidade responsável" (texto livre) que já existia no cadastro de Licitação/Contrato
   continua exatamente igual — é uma entidade `String` solta na tabela, sem FK; o que mudou
   foi só o parâmetro de *busca*, que agora resolve via o novo relacionamento de Órgãos
   (item 5), não via esse texto livre.
5. **Licitações — recurso novo `LicitacaoOrgao`** (aba "Órgãos" no detalhe admin, ver linha
   da tabela de módulos acima) — modelo PNCP de compra compartilhada/SRP, foi além do
   pedido original ("só" generalizar o filtro de Contrato) porque o backend percebeu que
   `Licitacao.unidade`/`Contrato.unidade` sendo `String` livre sem FK inviabilizava filtro
   de verdade por ID.
6. **Contratos — filtro público novo, de vez** (`GET /licitacoes/contratos/filtro`, global,
   sem exigir `licitacaoId`) — `/contratos` não tinha filtro nenhum antes (STATUS.md já
   documentava isso como bloqueado por backend, seção 2.2). `ContratoFiltro.tsx` novo
   (número, exercício, fornecedor, unidade via `<select>`, status, gestor, objeto,
   intervalo de assinatura). `fornecedorId` do pedido original **não** veio — `Contrato.fornecedor`
   continua `String` livre (sem FK), só dá pra buscar por texto; se filtro exato por
   fornecedor virar necessidade real, é outra migration no backend.
7. **e-SIC e Ouvidoria — `GET /{recurso}/formulario[/filtro][/{id}]` agora exigem login
   `ROLE_MANAGER`+** (antes eram públicos — dado pessoal do cidadão que preencheu o
   formulário ficava exposto sem autenticação, bug de privacidade corrigido pelo backend).
   Confirmado que nenhum código público chamava esses GETs (só POST de envio, que continua
   público — exigência da LAI); os únicos consumidores já são as telas admin autenticadas,
   então não quebrou nada no frontend. **Ouvidoria ganhou tela admin nova**
   (`/admin/ouvidoria/formularios`) — não existia (STATUS.md linha da tabela dizia
   explicitamente "sem tela de formulários recebidos, backend não expõe listagem"), agora
   espelha `/admin/esic/formularios` (`FinalidadeOuvidoria`: `DENUNCIA`/`ELOGIO`/`RECLAMACAO`/
   `SOLICITACAO`/`SUGESTAO`, campos `nome`/`email` nulos quando `anonima: true`, `unidadeNome`
   e `caminhoArquivo` novos na resposta).

Resumo de breaking changes já corrigidos: `GET /licitacoes/buscar?unidade=` → `?unidadeId=`;
`GET /esic/formulario*` e `GET /ouvidoria/formulario*` exigem token agora; `GET
/recursos-humanos/cargos` virou `Page` em vez de array puro. Todos os mocks (`*.mock.ts`)
correspondentes foram atualizados junto — Cargos, Diárias, Licitações e Contratos ganharam
campos fake (`unidadeId` com um pool de 5 unidades fictícias) pra que o filtro por unidade
também funcione em `NEXT_PUBLIC_USE_MOCK=true`, não só contra o backend real.

## 2.5 Perfil do Prefeito e do Vice-Prefeito (2026-08-04) — concluído

Usuário pediu as telas públicas "Prefeito" e "Vice-Prefeito" (referência funcional: páginas
individuais do portal de Lago dos Rodrigues). Investigado antes de programar: `Unidade`
"Gabinete do Prefeito" (`id: 1`) existe, mas o `gestorNome`/`gestorCargo` dela é a **Chefe
de Gabinete**, não o Prefeito — não havia recurso de backend que modelasse Prefeito/Vice
como pessoa. Virou pedido de backend (`prompt-backend-prefeito-vice-prefeito.md`) em vez de
tela com conteúdo estático — implementado pelo backend no mesmo dia, exatamente no formato
sugerido: dois singletons independentes, sem vínculo/FK entre si nem com `Unidade`
(`GET`/`PUT /api/geral/prefeito` e `/api/geral/vice-prefeito`, mesmo upsert
404-antes-de-configurar de `EsicInfo`/`OuvidoriaInfo`, `PUT` multipart com `foto` opcional
igual `Unidade`).

Frontend consumindo, testado contra o backend real (`curl` com token, incluindo `PUT` sem
foto preservando a atual):
- **Módulo público novo** `src/modules/prefeitura/` — `Autoridade` (tipo canônico),
  `prefeituraService` fábrica (`criarServicoAutoridade('prefeito' | 'vice-prefeito')`, sem
  mock, chama sempre o backend real — mesma convenção de Secretarias/Fornecedores).
  `AutoridadeView.tsx` compartilhado entre as duas rotas (`/prefeito`, `/vice-prefeito`,
  flat, mesmo padrão de `/estrutura-organizacional`/`/organograma` — não `/prefeitura/*`
  aninhado, apesar da referência de Lago usar esse padrão).
- **`telefone` pode vir `null`** (campo opcional no backend) — `AutoridadeView` cai pro
  `telefone` da `Unidade` "Gabinete do Prefeito" como fallback (busca por `nome` exato via
  `secretariasService.listar`, degrada bem se não achar). `endereco`/`horarioAtendimento`
  **sempre** vêm da Unidade — `Autoridade` não tem esses campos (sem FK, decisão do
  backend), diferente de `telefone`/`email` que são campos próprios do recurso.
  Confirmado via `curl` que `GET /geral/unidades?nome=Gabinete do Prefeito` resolve certo.
- **Admin**: `AutoridadeConfigPage.tsx` compartilhado (`src/modules/admin/geral/components/`)
  entre `/admin/geral/prefeito` e `/admin/geral/vice-prefeito` — só título/cargo padrão/service
  mudam entre as duas. RBAC grupo `geral` (fora do `EDITAR_ADMIN_ONLY`, `podeEditar` já
  resolve pra `ROLE_MANAGER`+, batendo com o que o backend exige). `AutoridadeRequest` fica
  em `admin/geral/types.ts` (o tipo de leitura `Autoridade` é reexportado do módulo
  público, mesmo padrão de `Unidade`).
- Links adicionados: dropdown "A PREFEITURA" do `Header.tsx`, coluna Institucional do
  `Footer.tsx`, `mapa-do-site/page.tsx`, e seção "Informações Institucionais" do hub
  `/transparencia` (`secoes.ts`).

## 2.6 Gestor de Unidade virou recurso próprio com histórico (2026-08-05) — breaking, concluído

Backend aplicou o mesmo modelo do Prefeito/Vice-Prefeito (seção 2.5) ao gestor de cada
secretaria — mudança bem maior porque mexe direto em `Unidade`, que já era consumida em
vários lugares. Contrato antigo (`gestorNome`/`gestorCargo`/`gestorFotoUrl`/`gestorVerificado`
soltos na Unidade, editáveis só pelo `PUT` multipart da própria Unidade) não existe mais.

- **`POST`/`PUT /api/geral/unidades` voltaram a ser JSON puro** (eram multipart desde
  2026-07-16) — `unidadesService.criar`/`atualizar` perderam o parâmetro `foto`.
  `UnidadeRequest` perdeu os 3 campos de gestor.
- **`UnidadeResponseDto.gestorNome/gestorCargo/gestorFotoUrl/gestorVerificado` viraram 1
  campo aninhado**: `gestorAtual: GestorUnidade | null` (`id, nome, cargo, dataInicio,
  dataFim, fotoUrl, verificado, ativo, criadoEm` — `criadoEm` pode vir `null` nos
  registros migrados da era pré-histórico, confirmado em runtime). Todo lugar que lia os
  4 campos soltos (`SecretariaCard.tsx`, `SecretariaDetalhe.tsx`, admin
  `unidades/page.tsx` e `unidades/[id]/page.tsx`) passou a ler `unidade.gestorAtual?.*`.
- **`/geral/unidades/{id}/ex-gestores` → `/geral/unidades/{id}/gestores`**, e não é só
  troca de nome — o recurso virou histórico completo (inclui o vigente, não só os
  anteriores) com CRUD de verdade: `POST` cria e já ativa (desativa o anterior — não dá
  pra ter 2 ativos), `PUT` só corrige dados de um registro sem mexer em quem tá ativo,
  `PATCH .../ativar` reativa um antigo do histórico, `DELETE` é **admin-only** (MANAGER
  toma 403 — única exceção dentro do grupo `geral`, que pro resto dos sub-recursos de
  Unidade resolve MANAGER; a tela checa `isAdministrador(usuario)` direto em vez de
  `podeExcluir(usuario, 'geral')` só pro botão Excluir de gestor). `POST`/`PUT` são
  multipart (`dados` + `foto` opcional, mantém a atual se omitida).
- **`OrdenadorUnidade` não mudou** — `PessoaCargoUnidade`/`criarServicoPessoaCargo` (antes
  compartilhados entre `ex-gestores` e `ordenadores`) agora servem só Ordenador; Gestor
  ganhou tipo (`GestorUnidade`) e service (`gestorUnidadeService`) próprios em
  `unidadeSubrecursos.service.ts`.
- Aba do detalhe admin renomeada "Ex-gestores" → "Gestores", com formulário de
  criar/editar (nome, cargo, período, verificado, foto) + botão "Reativar" por registro
  inativo do histórico. Aba pública equivalente em `SecretariaDetalhe.tsx` também
  renomeada, mostrando o histórico completo com badge "Vigente"/selo de verificado.
- Testado direto contra o backend real (`curl` com token): `PUT` de Unidade JSON puro,
  `POST` de gestor (cria e ativa, confirmado que desativa o anterior), `PATCH ativar`
  trazendo o gestor original de volta, `DELETE` admin-only (`204`). Estado de dev
  restaurado ao original depois do teste.

## 2.7 Lightbox de foto (2026-08-05)

`src/components/ui/FotoAmpliavel.tsx` — componente novo, genérico: recebe os mesmos
props de um `next/image` normal (`src`, `alt`, `width`, `height`, `className`) e já
cuida de tudo (botão com hover mostrando ícone de lupa, overlay em tela cheia com
`next/image fill` pro tamanho grande, fecha com Esc ou clique fora, `role="dialog"` +
`aria-modal`). Sem lib nova — só `useState`/`useEffect`. Aplicado nas 3 fotos de
pessoa que já existiam: `SecretariaCard.tsx` (miniatura do gestor na listagem),
`SecretariaDetalhe.tsx` (foto grande do gestor vigente no hero + miniaturas do
histórico na aba Gestores) e `AutoridadeView.tsx` (Prefeito/Vice-Prefeito). Não
mexido em fotos de outros contextos (notícias, avisos etc.) — escopo foi só
"fotos de pessoa" a pedido do usuário.

## 2.8 Padrão de abertura de PDF: rota dedicada /documento (2026-08-05)

Pedido original do usuário: em toda página que linka um PDF, abrir o arquivo com o
visualizador nativo do navegador em vez de forçar download — já tem zoom/paginação/
impressão/download na própria barra de ferramentas dele, então um botão "Baixar"
próprio é redundante. A ideia passou por várias rodadas (modal, depois link em nova
guia, depois card expansível inline) até o usuário fechar no formato final: clicar em
"Ver documento" **navega pra uma página** que mostra o PDF embutido (mesma guia, não
nova aba, não modal, não expansão in-place) — o padrão que já existia em
`/estrutura-organizacional` só que agora genérico pra qualquer documento do sistema.
Registrado aqui só o resultado, não o histórico de idas e vindas:

- **`src/components/ui/PdfViewer.tsx`** é o motor único de exibição — cabeçalho com
  ícone+título seguido de `<iframe>` com o visualizador nativo do navegador, sem botão
  de baixar. Virou client component nessa rodada: antes de montar o iframe faz
  `fetch(src, { method: 'HEAD' })` — mostra "Carregando documento..." e, se a resposta
  não for `ok` (ou o fetch falhar), um estado de erro explícito em vez do iframe em
  branco (problema visto numa versão anterior: arquivo quebrado/removido ficava com o
  quadro em branco dentro da moldura, parecendo bug).
- **Duas rotas novas, só leem `?src=&titulo=` da query string e renderizam
  `PdfViewer`**: `src/app/documento/page.tsx` (público, com `PageHeader`/breadcrumb
  igual ao resto do site) e `src/app/admin/(painel)/documento/page.tsx` (herda a
  sidebar do painel automaticamente por estar dentro do route group
  `admin/(painel)`). Ambas são client components com `useSearchParams` dentro de
  `<Suspense>` (exigência do Next 15 pra esse hook). Botão "Voltar" usa
  `router.back()`.
- **`src/utils/documento.ts`** — helper `hrefDocumento(src, titulo, opcoes?)` que monta
  a URL (`/documento?...` ou `/admin/documento?...`) com os parâmetros
  URL-encoded. Todo trigger de PDF do sistema virou um `<Link href={hrefDocumento(...)}>`
  simples — nada de estado local, modal ou toggle. Isso também resolveu de graça o
  problema de células de tabela no admin (não dá pra expandir um iframe de 80vh dentro
  de uma `<td>`, mas navegar pra outra página a partir de um link numa célula é
  trivial) — os componentes antigos `AbrirPdf.tsx` (modal) e `AbrirPdfInline.tsx`
  (expansível) foram deletados, sem mais uso depois da troca.
- Cobre ~26 arquivos: público — `DocumentList.tsx`, `DocumentoGenericoCard.tsx` (cobre
  os ~28 módulos genéricos tipo Lei/Plano Estratégico/Competências/RGA etc. de uma
  vez), `ConcursoAnexos.tsx`, `ContratoDetalhe.tsx`, `ConvenioCard.tsx`,
  `EdicaoCard.tsx` e `UltimaEdicaoDestaque.tsx` (Diário Oficial),
  `EmpresaDividaAtivaCard.tsx`, `EmpresaInidoneaCard.tsx`,
  `RelatorioMultiFormatoCard.tsx` (só o formato PDF — Word/Excel continuam
  `<a download>` com `MdFileDownload`, não tem visualizador nativo do navegador pra
  esses formatos), `TabelaValoresCard.tsx`, `SecretariaDetalhe.tsx` (documentos
  institucionais); admin — `GenericCrudPage.tsx` (cobre os ~28 módulos genéricos),
  empresas em dívida ativa/inidôneas, convênios, tabela de valores, unidades
  (decretos + documento-slot), licitações e contratos (documentos + aditivos), obras
  (declarações + tabela de responsáveis), formulários da Ouvidoria, anexos de
  concurso, publicações do Diário Oficial. Os ajustes de `flex-wrap`/`col-span` feitos
  numa rodada intermediária (pra acomodar um card que expandia in-place) foram
  revertidos — não fazem mais sentido com o gatilho sendo um link simples.
- Em todo lugar, ícone é `MdVisibility` (não mais `MdFileDownload` nem
  `MdOpenInNew` — não abre em nova aba) e o rótulo genérico "PDF" virou "Ver
  documento" (ou "Ver anexo"/"Ver edição" conforme o contexto).
- `tsc --noEmit` e `npm run lint` limpos (só os 2 warnings pré-existentes de `<img>`
  em `diario-oficial/config/page.tsx`, sem relação). Testado com `curl`: `/documento`
  e `/admin/documento` respondendo 200 com `?src=&titulo=` reais, SSR de
  `/secretarias/1` confirmando `href="/documento?src=...&titulo=Termo"` no HTML, e
  páginas públicas/admin representativas de cada grupo (200 em todas).

## 2.9 Breadcrumb da rota /documento com o caminho de origem (2026-08-05)

Usuário reportou que `/documento` sempre mostrava "Início > título do documento" —
faltava o nível intermediário (de onde o clique veio), já que a rota é genérica e não
tem como saber sozinha o contexto de origem.

- `hrefDocumento(src, titulo, opcoes?)` ganhou `opcoes.origemLabel`/`opcoes.origemHref`
  (além de `opcoes.admin`, que já existia — a assinatura virou um objeto de opções em
  vez de 3 parâmetros posicionais). Quando presentes, viram query params extras
  (`&origemLabel=...&origemHref=...`) que `src/app/documento/page.tsx` lê pra montar
  `breadcrumbItems={[{label: origemLabel, href: origemHref}, {label: titulo}]}` em vez
  de só `[{label: titulo}]`. Rota admin não usa breadcrumb (o painel não tem esse
  padrão em nenhuma tela), então `origemLabel`/`origemHref` só se aplicam no público.
- Cada chamador manda a origem que já conhece do próprio contexto: `ConvenioCard.tsx`
  → "Convênios e Transferências"/`/convenios`; `EdicaoCard.tsx`/`UltimaEdicaoDestaque.tsx`
  → "Diário Oficial"/`/diario-oficial`; `TabelaValoresCard.tsx` → "Tabela de Valores das
  Diárias"/`/tabela-valores`; `ConcursoAnexos.tsx` → "Concursos e Seleções
  Públicas"/`/concursos`; `EmpresaDividaAtivaCard.tsx`/`EmpresaInidoneaCard.tsx` →
  "Gestão Fiscal" com `?categoria=divida-ativa`/`inidoneas`.
- Componentes reaproveitados em vários contextos ganharam um prop opcional `origem?:
  {label, href}` que o pai calcula e repassa (em vez de o componente genérico tentar
  adivinhar de onde veio):
  - `DocumentList.tsx` — usado por `ContratoDetalhe.tsx` (origem = a própria página do
    contrato, `Contrato Nº X/ano` @ `/contratos/{id}`, calculada a partir do prop
    `contrato` que o componente já recebia) e por `SecretariaDetalhe.tsx` na aba
    Decretos (origem = `unidade.nome` @ `/secretarias/{id}`, mesma origem usada nos
    links de documentos institucionais da mesma página).
  - `DocumentoGenericoCard.tsx` (usado por 25 dos ~28 módulos genéricos via
    `DocumentoGenericoListPanel.tsx`, que só repassa o prop adiante) — cada um dos 10
    componentes `*ListView.tsx` que envolvem o painel (`LegislacaoListView`,
    `CompetenciasListView`, `FiscalContratoListView`,
    `TransferenciaVoluntariaListView`, `RenunciaFiscalListView`,
    `DocumentoListView.tsx` de planejamento/prestação de contas/educação/saúde, e
    `DocumentoRHListView.tsx`) calcula sua própria origem — módulos de página única
    apontam pra própria rota (ex: "Legislação"/`/legislacao`); módulos dentro de hub
    com abas (Planejamento, Prestação de Contas, Educação, Saúde, Recursos Humanos)
    apontam pro hub com `?categoria={recurso}` usando o mesmo valor que o hub já usa
    internamente pra `useUrlState('categoria', ...)` (confirmado por módulo, não
    assumido).
  - `RelatorioMultiFormatoCard.tsx` (usado por `RelatoriosExecucaoOrcamentariaListView.tsx`
    e `RelatoriosGestaoFiscalListView.tsx`) — cada um passa "Gestão Fiscal" com
    `?categoria=execucao-orcamentaria`/`rgf` respectivamente (valores confirmados em
    `GestaoFiscalView.tsx`, que é quem de fato define as abas dessa página).
- `tsc --noEmit` e `npm run lint` limpos. Testado via `curl` no SSR: `/secretarias/1`
  e `/contratos/1` confirmando `origemLabel`/`origemHref` corretos no HTML gerado
  (ex: `origemLabel=Contrato+Nº+123%2F2025&origemHref=%2Fcontratos%2F1`).

## 2.10 Acessibilidade, navegação e infraestrutura (2026-08-05) — concluído

Leva de 11 commits do mesmo dia (cronologicamente **antes** das seções 2.4–2.9, mas
documentados aqui porque ficaram de fora do STATUS.md na hora — resultado de uma sessão
em outra máquina, ver seção 4). Cobre acessibilidade, consolidação visual e alguns gaps
de navegação/formulário do hub público.

**Acessibilidade** (`5b37fe6`, `cf181a0`, `1f94b81`, `75b2602`, `31c27d3`, `a1665ad`):
- `src/components/AcessibilidadeMenu.tsx` — menu novo (contraste, tamanho de fonte,
  Libras), montado dentro de `Header.tsx`, substituiu um widget flutuante antigo.
- `src/components/VLibrasWidget.tsx` — `RootLayoutSwitch` re-renderiza a cada troca de
  rota (`usePathname()`), resetando o `<div vw>` que o plugin usa; reinstanciar o
  `Widget()` pra corrigir quebrava se o avatar 3D já estivesse aberto. **Solução**:
  componente envolto em `React.memo` — nunca re-renderiza com a navegação, então o DOM
  do plugin nunca é tocado. Montado uma vez em `src/layouts/PublicLayout.tsx`.
- Skip-link (`href="#conteudo"`) direto no `PublicLayout.tsx`; `aria-label`/
  `aria-expanded`/`aria-current` em ~16 selects de ordenação, no `FiltroCard.tsx` e nas
  abas ativas de 9+ módulos com abas.
- `src/components/DropdownMenuItem.tsx` — era `<div onClick>` sem suporte a teclado e
  submenu só por hover; virou `role="button"` + `tabIndex` + `onKeyDown` +
  `group-focus-within`.
- Contraste WCAG AA: `text-secondary/50` (3.95:1, abaixo do mínimo) → `/60` (5.74:1) em
  **147 usos, 52 arquivos** — inclui os `*Filtro.tsx`/`FolhaPagamentoMesView.tsx`
  criados nesta mesma sessão (rótulos de campo).
- Novas páginas `/acessibilidade` e `/mapa-do-site`, linkadas no footer.

**`PageHeader` — consolidação de cabeçalho** (`cf181a0`): `src/components/PageHeader.tsx`
já existia mas **não tinha nenhum consumidor** (código morto, com estilo divergente do
que as páginas realmente usavam — `font-black` vs. `font-bold` em produção). Corrigido
pra bater com o padrão real e depois **migrado em 60 arquivos** (pares `page.tsx`/
`loading.tsx` de praticamente toda rota pública), trocando breadcrumb+h1+barrinha
duplicados à mão por `<PageHeader>`. Hoje **66 arquivos** referenciam o componente — é o
padrão a seguir em qualquer página nova. De quebra: `text-gray-800` → token
`text-text-secondary`, correção de comentário de cor invertido em `globals.css`, e 2
páginas estáticas novas (`/regulamentacao-lai`, `/carta-de-servicos`).

**Navegação morta + páginas de erro** (`89784ac`): `src/app/not-found.tsx` (404) e
`src/app/global-error.tsx` (500) novos, com a identidade visual do site (antes era o
genérico do Next). `Footer.tsx` reescrito (era só uma linha de copyright, virou +113
linhas de conteúdo real — links institucionais, redes, endereço). `Header.tsx` podado.
`src/components/Navbar.tsx` e `Hero.tsx` **deletados** (código morto, não referenciados
por nada).

**`b7ee6d6`** — bug de clique fantasma: o header fixo mantinha a altura da caixa mesmo
colapsado (`translateY` só reposiciona visualmente, não encolhe a box), então uma faixa
invisível do header continuava capturando clique no conteúdo logo abaixo do nav.
Corrigido com `pointer-events: none` no container + `pointer-events-auto` nos filhos de
verdade (topbar, logo+nav) — mais simples que recalcular a altura a cada scroll.

**Formulários públicos de e-SIC/Ouvidoria + gaps do hub** (`b629349`): até aqui só existia
o *service*/tipo pra enviar solicitação — não tinha formulário de verdade na tela
pública. Novos `src/modules/esic/components/FormularioEsicForm.tsx` e
`src/modules/ouvidoria/components/FormularioOuvidoriaForm.tsx` (ambos com opção de envio
anônimo), batendo em `POST /esic/formulario`/`POST /ouvidoria/formulario` (endpoints que
já existiam). Módulo público novo `src/app/transferencia-voluntaria/` (+
`src/modules/execucaoOrcamentaria` ganhou `useTransferenciaVoluntaria.ts`/service/mock)
pra cobrir a EC nº 105 (Transferências Especiais), que só existia do lado admin antes.
Busca por título e 4 abas antes órfãs (Educação, Prestação de Contas) adicionadas em
`TransparenciaHub.tsx`/`secoes.ts`.

**Timestamp, navegação cruzada, badges e glossário** (`6c80eea`): `usePageableResource`
ganhou `atualizadoEm`, exibido em ~26 listagens públicas ("N encontrados · atualizado em
..."). Novo `src/modules/shared/statusBadgeStyle.ts` unificando cor de badge de status
entre Contratos/Licitações/Obras (`SUSPENSO` estava cinza num módulo e vermelho noutro —
corrigido). Novo `src/modules/shared/components/GlossarioTermos.tsx` reaproveitado por
`GestaoFiscalGlossario.tsx`/`PlanejamentoGlossario.tsx` (siglas tipo RGF/RREO/LDO
explicadas). `SecretariaObras.tsx` — nova aba no detalhe de Secretaria mostrando as obras
daquela unidade (Obras é o único módulo cujo filtro aceita `unidadeId` até aqui).

**`c533fde`** — `npm audit fix`: só `package-lock.json` tocado, corrigiu 5 de 8
vulnerabilidades (axios, brace-expansion, form-data, js-yaml, tar) dentro do range semver
atual. As 3 restantes (postcss, sharp, next-internal) exigem `next@16` com `--force` —
não aplicado, fica como decisão consciente adiada (upgrade maior, fora de escopo de uma
correção de patch).

## 2.11 Diário Oficial: abas Legislação/Edições Não Eletrônicas/Quem Somos/Expediente/Ajuda (2026-08-06)

Pedido do usuário com screenshots do Diário Oficial de referência de Lago dos Rodrigues
como inspiração (não cópia — conteúdo e visual próprios). `/diario-oficial` era uma
página só (destaque + lista com filtro), virou abas seguindo o mesmo padrão de
`GestaoFiscalView.tsx` (`useUrlState('categoria', ...)` + pílulas). Pedido explícito do
usuário: **não** recriar os itens "Edição Atual"/"Edições Anteriores"/"Busca" da
referência porque já existem cobertos de outro jeito — viraram a aba padrão "Edições"
(`EdicoesTab.tsx`, só empacota o que já existia: `UltimaEdicaoDestaque` +
`DiarioOficialListView`).

- **`DiarioOficialView.tsx`** — 6 abas: Edições (padrão), Legislação, Edições Não
  Eletrônicas, Quem Somos, Expediente, Ajuda. `src/app/diario-oficial/page.tsx` virou só
  `PageHeader` + `Suspense` + `<DiarioOficialView />`, igual ao shell de
  `gestao-fiscal/page.tsx`.
- **Quem Somos / Expediente** — `DiarioOficialInfo` (o singleton que já existia só pro
  admin, `GET`/`PUT /diario-oficial`, editorChefe/redação/endereço) ganhou 2 campos:
  `periodicidade` e `quemSomos`. Confirmado via `curl` que `GET /diario-oficial` já é
  público (sem auth) — só faltava um consumidor no site público, adicionado em
  `diarioOficialInfoService.buscar()` (novo, em `src/modules/diario-oficial/`, o tipo
  `DiarioOficialInfo` migrou pra lá e o admin passou a reexportar em vez de duplicar).
  `periodicidade`/`quemSomos` ainda não existem no backend — campos opcionais no tipo,
  telas degradam com `EmptyState`/campo omitido até o backend implementar (pedido no
  prompt de backend). Admin `config/page.tsx` ganhou os 2 campos no formulário (só texto,
  não mexe no multipart de brasão/logo).
- **Legislação** — módulo genérico novo (`src/modules/diario-oficial/legislacao/`),
  reaproveita a mesma factory dos outros ~28 módulos (`criarServicoDocumentoGenerico`
  etc., idêntico ao `src/modules/legislacao/`) — é sobre legislação do próprio Diário
  Oficial (ex: a lei que o criou), diferente do módulo `/legislacao` (legislação
  municipal geral). Registry ganhou entrada `diario-oficial-legislacao` (categoria
  "Diário Oficial", `basePath: /diario-oficial/legislacao`) — CRUD admin auto-gerado em
  `/admin/modulos/diario-oficial-legislacao`. Endpoint não existe no backend ainda
  (confirmado `500` via `curl`) — no prompt de backend.
- **Edições Não Eletrônicas** — publicações físicas anteriores ao sistema eletrônico.
  Não usa a factory genérica porque tem 2 campos a mais (`volume`, `tipo` — reaproveita o
  mesmo enum `TipoEdicaoDiario` de `EdicaoDiario`, não criou um novo). Módulo bespoke
  completo em `src/modules/diario-oficial/` (types/service/mock/hook/Card/Filtro/
  ListView, mesmo padrão visual do `EdicaoCard.tsx`) + admin CRUD bespoke em
  `/admin/diario-oficial/edicoes-nao-eletronicas` (não usa o registry genérico pelo mesmo
  motivo). `AdminSidebar.tsx` — a seção "Diário Oficial" era um bloco fixo fora do loop
  de categorias do registry; virou merge dentro do loop (`categoria === 'Diário
  Oficial' && LINKS_DIARIO_OFICIAL_BESPOKE`), igual ao padrão já usado por RH/Licitações/
  Convênios/Anticorrupção, pra caber o novo módulo genérico "Legislação do Diário
  Oficial" na mesma seção sem duplicar cabeçalho. Endpoint não existe no backend ainda —
  no prompt de backend.
- **Ajuda** — accordion estático (mesmo padrão `<details>`/`<summary>` de
  `src/app/faq/page.tsx`) com conteúdo próprio inspirado nos tópicos da referência
  (assinatura digital, validade jurídica) **mais uma ferramenta real**:
  `VerificarAutenticidade.tsx` chama `GET /edicoes/{numero}/validar` — endpoint público
  que **já existia no backend** (é o destino do QR Code impresso na última página de
  cada edição) mas não tinha nenhum consumidor no front até agora; achado ao levantar o
  OpenAPI antes de planejar essa aba. Sem pedido de backend nesse item.
- `tsc --noEmit`/`npm run lint` limpos. Testado via `curl`: todas as 6 abas (`?categoria=`)
  200 no front, `GET /api/diario-oficial` e `GET /api/edicoes/1/validar` reais no backend
  (200, confirmando o que já funciona), `GET /api/diario-oficial/legislacao/filtro` e
  `GET /api/diario-oficial/edicoes-nao-eletronicas/filtro` confirmando `500` (recursos
  genuinamente pendentes de backend, não bug do front). Prompt de backend em
  `prompt-backend-diario-oficial.md`, enviado ao usuário.

## 2.12 Varredura de compatibilidade mobile (2026-08-06) — concluído

Usuário reportou abas sumindo no Diário Oficial no mobile (resolvido à parte — era
código só existente numa máquina de casa, não commitado ainda; já mesclado na seção
2.11) e pediu uma varredura geral do site público por problemas de mobile. Rodada de 3
agentes Explore em paralelo (grep sistemático em componentes públicos, componentes
customizados complexos, configuração global) achou o seguinte:

- **Achado principal — não existia meta tag de viewport no projeto inteiro**
  (`grep -rn "viewport" src/` não batia em lugar nenhum antes desta rodada). Sem
  `width=device-width, initial-scale=1`, o navegador mobile renderiza a página numa
  viewport virtual de ~980px e dá zoom out — isso sozinho explica sintomas de "elemento
  sumindo/ilegível no celular" independente do CSS responsivo estar certo por baixo (e
  explica por que o emulador headless usado pra testar o bug do Diário Oficial nunca
  reproduziu nada — ele define a viewport CSS diretamente, sem depender da meta tag).
  Corrigido com `export const viewport: Viewport = { width: 'device-width',
  initialScale: 1 }` em `src/app/layout.tsx` (API padrão do Next.js 15/App Router) — vale
  pro site inteiro (público e admin) por estar no root layout.
- `src/components/ui/PdfViewer.tsx` — iframe de PDF sem nenhuma saída caso não
  renderize (comum no Chrome/Safari mobile). Ganhou um link "Abrir em nova guia" sempre
  visível no cabeçalho, ao lado do título (que também ganhou `truncate` — títulos longos
  não estouravam o cabeçalho antes por acaso, não por design).
- **9 grids `grid-cols-2` sem breakpoint nenhum** (forçavam 2 colunas até em 320–375px)
  viraram `grid-cols-1 sm:grid-cols-2`: `ServidorCard.tsx`, `LicitacaoCard.tsx`,
  `ContratoCard.tsx`, `EmendaParlamentarCard.tsx`, `EmpresaDividaAtivaCard.tsx`,
  `InformacoesEsicView.tsx`, 3 grids internos de `LicitacaoFiltro.tsx`, 1 de
  `ServidorFiltro.tsx`. **Não mexido** (risco baixo, já escalona em `sm:`, decisão
  consciente de não expandir escopo): `DiariaCard.tsx`/`ObraCard.tsx`/`ConcursoCard.tsx`,
  que usam `grid-cols-2 sm:grid-cols-4`.
- `SecretariaDetalhe.tsx` (`PessoaCargoList`/`GestorList`, abas Ordenadores e Gestores) —
  nome (tamanho variável) ao lado de um intervalo de datas `whitespace-nowrap`, sem
  proteção contra nome comprido. Ganhou `min-w-0`+`truncate` no nome e `shrink-0` na
  data, nos dois componentes.

**Confirmado correto, sem necessidade de ação** (achados dos agentes): `OrganogramaDiagrama.tsx`
(já `flex-wrap`, testado mobile-safe), `FotoAmpliavel.tsx` (lightbox viewport-relative),
`VLibrasWidget.tsx` (sem conflito de posição com o botão hambúrguer), as 3 tabelas
públicas existentes (`TabelaCargos.tsx`/`FolhaPagamentoMesView.tsx`/`ServidorDetalhe.tsx`,
todas já com `overflow-x-auto`), `Footer.tsx` (grid responsivo), e nenhum `100vw`
hardcoded em lugar nenhum do projeto.

**Pendência consciente, fora de escopo desta rodada** (decisão do usuário): o menu de
Acessibilidade (`AcessibilidadeMenu.tsx` — contraste, tamanho de fonte, atalho de
Libras) e os links Ouvidoria/SIC/Acesso admin somem completamente no mobile hoje (ficam
numa barra `hidden lg:flex`, sem equivalente no menu hambúrguer — confirmado lendo
`Header.tsx`). Usuário está avaliando adotar o **UserWay** (widget de acessibilidade de
terceiros) em vez de expandir o componente atual pro mobile, então isso não foi
corrigido aqui — decidir isso antes de mexer nessa lacuna especificamente.

`tsc --noEmit`/`eslint` limpos. Testado: `curl` confirmando a meta tag no HTML de
`/obras`; componentes tocados reconferidos em viewport mobile (375×812) via
`read_page`/`get_page_text` no Browser pane.

**Bug de performance encontrado pelo usuário na sequência**: o campo de busca de
`TransparenciaHub.tsx` (`/transparencia`) usava `useUrlState` diretamente no
`onChange` do `<input>` — cada tecla digitada disparava `router.replace` (dentro de
`setValor` em `src/hooks/useUrlState.ts`), uma navegação do Next.js por caractere,
deixando a busca visivelmente travada. `useUrlState` foi desenhado pra estado que muda
pouco (aba ativa, filtro aplicado por um botão), não pra um campo de texto livre.
Corrigido com `useState` local pro valor imediato do input (filtragem roda em cima
dele, sem custo real — o array de itens é pequeno) + `useEffect` com `setTimeout` de
300ms sincronizando pra URL só depois de uma pausa na digitação — mantém a busca
compartilhável por link sem re-navegar a cada tecla. Vale conferir esse mesmo padrão em
qualquer outro campo de texto livre que hoje use `useUrlState` diretamente no
`onChange` (não achei outro caso na varredura desta rodada, mas o padrão errado é fácil
de repetir).

## 2.13 Refino do menu de Acessibilidade (2026-08-06)

Usuário decidiu não adotar o UserWay (widget de terceiro) — preferiu manter e refinar o
`AcessibilidadeMenu.tsx` já existente. Estado final, depois de várias rodadas de ajuste
fino guiadas por prints de navegador real do usuário:

- **Abre no hover** (mesmo padrão de `DropdownMenuItem.tsx`), clique reforça/fecha.
  Painel sempre montado (`invisible`/`visible`, não `{aberto && ...}`, senão hover via
  CSS não funciona) e **sem `mt-2`** entre botão e painel — com margem, o cursor perdia
  o `:hover` atravessando o espaço vazio entre os dois.
- "Libras" é link informativo pro site oficial (`vlibras.gov.br`), não aciona o widget
  programaticamente.
- Item "Contraste" ativo tem fundo escuro + texto branco (indica visualmente que muda o
  site inteiro).
- **Alto Contraste virou escuro+amarelo** (era fundo branco/texto preto — usuário
  comparou com outra prefeitura de referência que usa esse padrão). `html.alto-contraste`
  em `globals.css`: escurece `--color-neutral`/`body`, força `<a>`/`<h1-3>`/
  `nav [role="button"]` pra amarelo via seletor de tag (`role="button"` porque os
  rótulos de dropdown do header são `<div>`, não `<a>` de verdade), e escurece
  `.bg-primary` pra preto sólido (cobre topbar/nav/footer). Hover de dropdown usa branco
  translúcido (`rgba(255,255,255,0.15)`) em vez da tinta azul da marca — mais visível
  sobre fundo escuro. **Limitação consciente**: a variável `--color-primary` (não a
  classe `.bg-primary`) não foi repontada — evitaria botão amarelo+texto branco
  ilegível; elementos com fundo de marca própria (botões primary, badges, abas ativas)
  mantêm a cor original mesmo em alto contraste.
- Estado (`fonte`/`altoContraste`) centralizado em `Header.tsx` — o menu é renderizado 2x
  (desktop+mobile, seção 2.12) e cada instância tinha seu próprio `useState` antes,
  dessincronizando entre os dois (ativar num não refletia no outro até reload).
  `AcessibilidadeMenu.tsx` virou componente controlado.
- Dropdowns do header (`DropdownMenuItem.tsx`) ganharam `onClick` no `<ul>` do submenu
  pra fechar ao clicar num link (bubbling — nenhum chamador precisa fechar
  individualmente). Trocado `hover:bg-neutral-dark` (cinza pouco visível) por
  `hover:bg-primary/10` nos dropdowns do header, tema normal e alto contraste.
- Adicionado também no menu mobile (`Header.tsx`, `lg:hidden`) — Ouvidoria/SIC/Acesso
  admin da topbar continuam sem equivalente mobile (fora de escopo).
- Ícone de engrenagem (`/admin/login`) removido da topbar a pedido do usuário ("não
  quero fácil acesso ao admin") — rota continua existindo, só sem link visível.

`tsc --noEmit`/`eslint` limpos. Testado via `curl` + confirmação em navegador real do
usuário (nav/footer pretos, links amarelos, "Contraste: Ativo" visível).

## 2.14 Carta de Serviços vira módulo genérico de verdade (2026-08-06)

`/carta-de-servicos` já existia (seção 2.10, `cf181a0`) como "PDF estático, sem
backend" — `PdfViewer` direto no `page.tsx` apontando pra um `/test.pdf` placeholder
com `// TODO`, texto explicativo acima do PDF, tudo numa página só (usuário confirmou
que essa estrutura — texto acima do PDF, sem navegar pra uma segunda página só pra ver
o arquivo — é exatamente o que quer manter, ao contrário do portal de referência de
Lago dos Rodrigues que usa 2 páginas: lista → clique em "Visualizar" → PDF). Virou
módulo genérico de verdade, mesmo padrão de Legislação/Competências
(`criarServicoDocumentoGenerico`/`criarUseDocumentosGenerico`/`criarMockDocumentoGenerico`,
`src/modules/carta-servicos/`, registry `slug: 'carta-servicos'`, categoria
"Institucional") — admin ganha CRUD automático em `/admin/modulos/carta-servicos`, sem
precisar de nenhum arquivo novo (rota dinâmica genérica já existente).

**Única diferença do padrão "documento genérico" comum**: `CartaServicosListView.tsx`
não usa `DocumentoGenericoListPanel` (que renderiza cards com link "Ver documento" pra
`/documento`, ou seja, 2 páginas) — em vez disso, embute `PdfViewer` diretamente pra
cada documento, na mesma página, mantendo a estrutura que já existia e que o usuário
confirmou querer. Sem `FiltroCard`/busca de propósito (esse documento normalmente tem
1, no máximo 2-3 versões, busca por título seria ruído nesse volume).

Linkado nos mesmos lugares que Competências: dropdown "A Prefeitura" (`Header.tsx`),
`Footer.tsx`, `mapa-do-site/page.tsx` — já estava linkado no hub `/transparencia`
(`secoes.ts`) desde a criação da página estática original.

Endpoint não existe no backend ainda (confirmado, `/v3/api-docs` sem nenhum path
`carta`/`servico`) — pedido em `prompt-backend-carta-servicos.md` (scratchpad da
sessão). Front degrada com `ErrorState` até existir, mesmo comportamento de
Competências.

## 2.15 Notícias: múltiplas imagens + imagem principal (2026-08-07)

`ConteudoInstitucional` (tipo compartilhado por Notícias e Avisos,
`src/modules/institucional/types.ts`) tinha um único campo `imagemUrl?: string | null`
(só populado em Notícias). Usuário pediu suporte a várias imagens por notícia, com uma
marcada como "principal" — a que representa a notícia em qualquer lugar do site — e uma
exibição melhor na listagem `/noticias`.

**Isso é uma mudança de schema de backend**, não só de frontend — confirmado via
`/v3/api-docs` que `NoticiaRequestDto`/`NoticiaResponseDto`/`NoticiaController` não têm
nenhum campo de lista de imagens hoje. Pedido registrado em
`prompt-backend-imagens-noticias.md` (scratchpad da sessão): nova entidade
`NoticiaImagem` (mesmo padrão de `DocumentoLicitacao`/`AnexoObraPublica` — filho com
`@ManyToOne` de volta pro pai, cascade + orphanRemoval), sub-recursos
`POST/DELETE .../noticias/{id}/imagens` e `PUT .../imagens/{imagemId}/principal`, e
`NoticiaResponseDto.imagens: NoticiaImagemDto[]` (`imagemUrl` mantido como conveniência
derivada = URL da imagem principal, pra não quebrar consumidores antigos).

Frontend implementado por inteiro contra um mock local, pronto pra consumir o endpoint
assim que existir:

- **Tipos**: `ImagemNoticia` (`{id, url, principal}`) novo; `ConteudoInstitucional`
  ganha `imagens?: ImagemNoticia[]`, mantendo `imagemUrl` como legado/derivado.
- **Helpers** novos em `src/modules/institucional/utils.ts`: `imagemPrincipal(item)`
  (imagem marcada principal → primeira do array → `imagemUrl` legado → `null`) e
  `imagensGaleria(item)` (demais imagens, pra tira de miniaturas).
- **Mock** (`institucional.mock.ts`): Notícias ganham de 0 a 4 imagens fake
  (`picsum.photos`, seed determinística), uma marcada `principal: true`. Avisos
  continuam sem imagens — comportamento intocado.
- **Card público** (`ConteudoInstitucionalCard.tsx`): imagem principal via `next/image`
  (mesmo padrão de `FotoAmpliavel.tsx`, já usado nas fotos de gestores — imagens do
  backend passam pelo rewrite `/api/*`, same-origin, não precisa de `remotePatterns`);
  selo "+N fotos" sobre a miniatura quando há galeria; tira horizontal de miniaturas
  abaixo do texto reaproveitando `FotoAmpliavel` como lightbox (nenhum componente novo
  de zoom). `next.config.ts` ganhou `images.remotePatterns` só pro host `picsum.photos`
  (mock local).
- **Admin** (`src/app/admin/(painel)/institucional/noticias/page.tsx`, formulário
  bespoke): upload múltiplo com preview local (`URL.createObjectURL`, revogado ao
  trocar/cancelar/salvar pra não vazar memória) e seleção de imagem principal por
  estrela. Criar manda tudo num multipart só (`dados` + N partes `imagens` +
  `principalIndex`); editar age na hora sobre imagens já existentes — estrela chama
  `marcarPrincipal` e "×" chama `removerImagem` direto, sem esperar o Salvar — e só
  enfileira os arquivos novos, enviados via `adicionarImagem` no submit (mesmo espírito
  do sub-recurso de Aditivos Contratuais, seção 2 acima). `noticiaAdminService.criar`
  perdeu o parâmetro de imagem única; `atualizar` virou JSON puro (sem multipart) —
  imagens são geridas só pelos 3 métodos novos (`adicionarImagem`/`removerImagem`/
  `marcarPrincipal`).

Verificado: `tsc`/`eslint` limpos; execução direta do mock via `tsx` confirmou a forma
dos dados gerados (uma imagem principal por notícia, `imagemUrl` derivado
corretamente); contrato real do backend (`curl` em `/api/institucional/noticias/filtro`)
confirmado sem `imagens`, só `imagemUrl` — os helpers caem pro legado sem quebrar nada.
Não foi possível conferir visualmente a galeria/lightbox no Browser pane desta sessão
(mesma limitação de página com `usePageableResource` travando na composição da
ferramenta headless, já documentada abaixo em "Pegadinhas específicas deste sandbox" —
reproduzida também em `/avisos`, página não tocada nesta rodada, confirmando que não é
regressão desta mudança).

**Sugestão registrada, não implementada**: página de detalhe `/noticias/[id]` com
resumo truncado na listagem + "leia mais" — hoje a listagem mostra o texto inteiro sem
paginação de conteúdo; uma página própria daria mais espaço pra galeria de fotos e
deixaria a lista mais enxuta. Fica pra decisão futura do usuário.

## 2.16 Notícias, rodada 2: backend já implementou + página de detalhe + carrossel (2026-08-07)

Usuário testou o upload e bateu em `timeout of 10000ms exceeded` — causa raiz não era
específica de Notícias: `src/services/api.ts` tinha um único `timeout: 10000` (10s) pra
toda e qualquer requisição do axios, curto demais pra upload de arquivo maior/conexão
lenta (mesmo sintoma relatado em outro módulo com PDF). Corrigido no interceptor de
request: `if (config.data instanceof FormData) config.timeout = 60000` — só upload
multipart ganha mais tempo, chamadas JSON continuam com os 10s originais.

Ao testar upload de verdade contra o backend real, descobrimos que o **time de backend
já implementou** o sub-recurso de imagens pedido em `prompt-backend-imagens-noticias.md`
(seção 2.15) — confirmado no `/v3/api-docs` real: `NoticiaResponseDto.imagens[]`
(`{id, url, principal}`), `POST/GET/DELETE .../noticias/{id}/imagens[/{imagemId}]`,
`PUT .../imagens/{imagemId}/principal`. Só que o contrato ficou **diferente** do que o
frontend tinha implementado especulativamente contra mock, em 2 pontos reais — corrigidos
em `institucional.service.ts` (admin):

- `POST .../imagens` espera `principal` como **query param**, não como campo do
  `FormData` (`{ params: { principal }, headers: {...} }` no lugar de
  `formData.append('principal', ...)`).
- `criar`/`atualizar` notícia só aceitam **1 imagem** no multipart (campo legado
  `imagem`, não uma lista) — imagens extras entram uma a uma, depois, via
  `POST .../imagens`. `criar()` perdeu os parâmetros `imagens[]`/`principalIndex` que
  não existem no contrato real; o formulário admin agora sempre cria a notícia sem
  imagem no multipart inicial e faz upload de cada uma via `adicionarImagem` logo em
  seguida (mesmo fluxo usado na edição).
- Bônus, bug real encontrado ao comparar com o schema: `atualizar()` mandava a notícia
  como JSON puro, mas `PUT /institucional/noticias/{id}` exige `multipart/form-data`
  mesmo sem imagem nova (`dados` é a única parte obrigatória) — corrigido, ou teria
  quebrado contra o backend real assim que testado.

Usuário também pediu, olhando a tela real (`localhost:3000/noticias`, screenshot):
corpo mais largo, botão de detalhe no card, texto resumido pra cards do mesmo tamanho,
e um carrossel. Implementado:

- `src/app/noticias/page.tsx` e `avisos/page.tsx`: `max-w-4xl` → `max-w-6xl` (padrão já
  usado na maioria das páginas de listagem do site).
- **Novo componente reutilizável** `src/components/ui/ImagemCarrossel.tsx` — setas
  prev/next + dots, cada slide usa `FotoAmpliavel` (lightbox já existente) como irmão,
  não filho, das setas/dots, então não há conflito de clique nem propagação indevida pra
  um `<Link>` ancestral. Setas em opacidade baixa sempre visíveis no mobile (sem hover) e
  reveladas no hover a partir de `md:` (mouse) — dots sempre visíveis, servem de
  navegação por toque.
- `ConteudoInstitucionalCard.tsx` reescrito: troca a imagem principal + tira de
  miniaturas (seção 2.15) pelo `ImagemCarrossel` com todas as imagens da notícia (helper
  novo `imagensOrdenadas()` em `utils.ts`, substitui `imagensGaleria()` — bota a
  principal primeiro). Texto ganha
  `line-clamp-4` só pra Notícias (Avisos continua mostrando o texto inteiro — não tem
  página de detalhe, então cortar esconderia informação sem ter pra onde "ver mais").
  Card ganha `h-full` + `mt-auto` no botão "Ver detalhes", que junto com o `line-clamp`
  deixa os cards com altura uniforme dentro do grid.
- `ConteudoInstitucionalListView.tsx`: grid de 1 coluna virou
  `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (cards mais compactos + corpo mais largo
  pediam mais colunas); skeleton de loading e `EmptyState` (agora com `col-span-full`)
  acompanham o mesmo grid.
- **Página de detalhe nova** `src/app/noticias/[id]/page.tsx` (Server Component, mesmo
  padrão de `secretarias/[id]`: `notFound()` em 404 ou notícia inativa, `Breadcrumbs`,
  `loading.tsx`/`error.tsx` espelhando o precedente) — título, data, `ImagemCarrossel`
  grande (todas as imagens) e texto completo sem truncar. Novo `noticiaService
  .buscarPorId(id)` (`GET /institucional/noticias/{id}`, com suporte a mock via
  `institucionalMock.buscarPorId`, adicionado ao factory `criarServicoInstitucional` —
  reaproveitável por Avisos no futuro se um dia ganhar detalhe também).

Verificado: `tsc`/`eslint` limpos em todos os arquivos tocados; utilitários Tailwind
novos (`line-clamp-4`, `grid-cols-3`) confirmados presentes no CSS compilado (`curl` no
chunk `globals.css`). A página de detalhe é Server Component puro — confirmada
funcionando de ponta a ponta contra o **backend real** via `curl` em
`localhost:3000/noticias/2`: título, data e texto corretos, e a URL da imagem já vem no
formato novo do sub-recurso (`/api/institucional/noticias/2/imagens/2`), confirmando que
o backend já populou `imagens[]` de verdade pra pelo menos essa notícia. A listagem
(`/noticias`, Client Component com `usePageableResource`) segue sem confirmação visual
no Browser pane desta ferramenta — mesma limitação já documentada (seção 2.15 e
"Pegadinhas específicas deste sandbox"), agravada desta vez por um comportamento extra
estranho só nesta aba (navegação/`fetch()` dentro do browser retornando conteúdo da rota
antiga mesmo com `cache: 'no-store'`, enquanto `curl` de fora do browser sempre retornou
o conteúdo correto e atualizado) — não reproduzido fora da ferramenta, tratado como
artefato dela, não bug de código.

## 2.17 Notícias, rodada 3: bug real do lightbox + remoção do legado `imagemUrl` (2026-08-07)

Usuário gravou um screencast (`~/Vídeos/Screencast 2026-08-07 10:23:22.mp4`, sem ffmpeg
no ambiente pra extrair frames, então diagnosticado só pela descrição + leitura de
código): ao clicar pra ampliar uma imagem no carrossel, o lightbox "fica piscando em
sobreposição".

**Causa raiz real, confirmada por CSS spec**: `Card.tsx` tem `hover:-translate-y-0.5`
(um `transform` no hover). Qualquer ancestral com `transform` diferente de `none` cria
um novo *containing block* pra descendentes `position: fixed` — então o diálogo
`fixed inset-0` do `FotoAmpliavel.tsx` (antes renderizado inline, dentro da árvore do
Card), ao abrir com o mouse ainda em cima do card (que é justamente quando dá pra
clicar o botão de zoom, que só aparece no hover), passava a se posicionar relativo ao
*card* em vez da viewport — ficando pequeno/deslocado, sobrepondo o card, e piscando ao
entrar/sair do hover (o `transform` liga/desliga, mudando o containing block do diálogo
a cada vez). `FotoAmpliavel` é usado em vários lugares do site (fotos de gestores,
carrossel de notícias) — o bug só aparecia onde a miniatura fica dentro de um `Card`
com hover ativo (caso do carrossel dentro do card de notícia; as fotos de gestor não
ficam dentro de um `Card`, por isso nunca foi notado antes).

**Correção**: `FotoAmpliavel.tsx` agora renderiza o diálogo via `createPortal(...,
document.body)` — sempre um filho direto do `<body>`, imune a `transform` de qualquer
ancestral, presente ou futuro. Corrige o bug em todo lugar que usa o componente, não só
em Notícias.

Usuário também pediu pra tirar a compatibilidade com `imagemUrl` (legado): "não estamos
em produção ainda". Removido do frontend:

- `ConteudoInstitucional.imagemUrl` saiu do tipo (`types.ts`) — o campo só existia pra
  Notícias, e agora Notícias usa só `imagens[]`.
- `imagemPrincipal()`/`imagensOrdenadas()` (`utils.ts`) perderam o fallback pro
  `imagemUrl` legado.
- `institucional.mock.ts` parou de gerar o campo.

`prompt-backend-imagens-noticias.md` (scratchpad) ganhou uma seção "Atualização
(2026-08-07)" pedindo pro backend remover, sem se preocupar com compatibilidade (projeto
pré-produção): o campo `imagemUrl` de `NoticiaResponseDto`, o parâmetro `imagem`
(arquivo único legado) do multipart de `POST/PUT /institucional/noticias` — sugestão de
inclusive esses 2 endpoints deixarem de exigir multipart, já que nenhuma imagem é mais
enviada neles — e a coluna `imagemCaminho` em `Noticia`, se ainda existir separada de
`NoticiaImagem`.

**Nota de investigação, não é bug**: ao tentar confirmar visualmente o fix no Browser
pane, percebi cada `<h1>` de página de detalhe (`/noticias/2`, `/secretarias/1`) vindo
acompanhado de um segundo `<h1>` oculto (`offsetParent null`) com o título da respectiva
página de listagem. Reproduz até em `/secretarias/1`, rota antiga nunca tocada nesta
sessão — é comportamento do próprio Next.js 15.5.15 (App Router), provavelmente
prefetch/cache de segmento pro link de breadcrumb de volta pra listagem, não uma
regressão desta mudança. Não investigado mais a fundo por estar fora do escopo do que
foi pedido.

Verificado: `tsc`/`eslint` limpos (`grep` confirmou zero ocorrências de `imagemUrl`
restantes em `src/`). Fix do lightbox revisado por leitura de código e conferência do
`createPortal` na saída final do componente — comportamento de containing block de
`position: fixed` é regra de CSS spec, não depende de teste visual pra confirmar que
resolve.

## 2.18 Bug real de upload: Content-Type manual quebra multipart em navegador de verdade (2026-08-07)

Usuário reportou erro 500 tentando subir PDF em vários módulos. 3 pistas investigadas
antes da causa raiz real: timeout de 10s do axios (real, mas já corrigido antes —
`FormData` tem 60s desde a seção 2.16); proxy do Next travando em upload grande (real,
mas separado — ver seção 2.19); boundary do navegador sem espaço antes do parâmetro
seguinte (sintoma visível no log do backend, não a causa raiz).

**Causa raiz**: 17 services admin (31 ocorrências) definiam manualmente
`headers: { 'Content-Type': 'multipart/form-data' }` (sem `boundary`) em chamadas com
corpo `FormData` — anti-padrão do axios que só quebra em navegador de verdade (nunca em
`curl`/Node, por isso nunca foi pego antes): o navegador completa o `Content-Type` já
definido com o boundary que ele gerou, sem espaço antes do parâmetro seguinte,
produzindo `multipart/form-data;boundary=...;charset=UTF-8` — que o Spring rejeita
(`HttpMediaTypeNotSupportedException` → 500 genérico). **Correção**: header manual
removido nos 17 arquivos — o axios/navegador monta o `Content-Type` sozinho, corretamente,
quando você não interfere.

**Segunda causa, específica de Notícias**: o backend, ao atender o pedido de
simplificação da seção 2.17, foi além e trocou `POST/PUT /institucional/noticias` de
multipart pra **JSON puro**, mas o frontend ainda mandava `dados` embrulhado num
`FormData`. Corrigido: `criar()`/`atualizar()` mandam `dados` direto como corpo JSON.

Testado de ponta a ponta com Claude Browser autenticado como admin real
(`admin@prefeitura.dev`/`admin123`, seção 4) — `POST` retornou 200. Registros de teste
criados durante o diagnóstico foram excluídos via `DELETE` logo em seguida.

**Pendência registrada nesta rodada** (resolvida na seção 2.19): proxy do Next
(`rewrites()`) travando/falhando em upload grande.

## 2.19 Regressão do próprio fix da seção 2.18 + timeout/truncamento do proxy — RESOLVIDO (2026-08-07)

**Regressão do próprio fix da 2.18**: `src/services/api.ts` define
`Content-Type: application/json` como default da instância inteira do axios — remover o
header manual por chamada deixou esse default vazar pra requisições `FormData` (pior que
o bug original: `Content-Type 'application/json' is not supported`). **Corrigido**: o
interceptor de request agora chama `config.headers.delete("Content-Type")` quando
`config.data instanceof FormData`, garantindo que só o navegador defina esse header.

**Causa raiz do timeout em upload grande, confirmada pelo backend**: o proxy de
`rewrites()` do Next tem um buffer de ~10MB que **trunca o corpo silenciosamente** acima
disso (sem erro), daí o timeout de ~30s sem mensagem útil — Spring/Tomcat nunca foi o
gargalo (testado pelo backend simulando a chamada cross-origin real: uploads de
5–30MB direto no backend, 0.12–0.29s, sem platô). Uma tentativa intermediária de só
aumentar `experimental.proxyTimeout` foi revertida a pedido do usuário — só fazia o
proxy esperar mais, não resolvia a causa real da lentidão.

**Correção aplicada**: `api.ts` — upload (`FormData`, só no navegador,
`typeof window !== "undefined"`) sobrescreve `config.baseURL` pra
`process.env.NEXT_PUBLIC_API_URL` direto (o mesmo valor que o SSR já usa, sem proxy) em
vez do `/api` relativo que passa pelo `rewrites()`. Upload vai direto do navegador pro
backend, contornando o buffer; chamadas JSON continuam via `/api` normalmente.
`src/services/authApi.ts` é a única outra instância axios do projeto e não faz upload,
não precisou de mudança.

Isso vira chamada cross-origin de verdade — backend confirmou que CORS já cobre sem
nenhuma mudança do lado deles: preflight `OPTIONS` 200, POST/PUT liberados pra `/**`,
`Authorization`/`Content-Type` nos `allowedHeaders` (o navegador seta o boundary do
`multipart/form-data` sozinho — nunca setar isso manualmente no client, é o bug da seção
2.18), `allowCredentials` em `false` (autenticação é só `Bearer <token>`, nunca dependeu
de cookie).

**A favor**: arquivo acima do limite do backend (40MB) agora retorna `413` imediato
(~0.045s) com mensagem útil (`parseApiError` já extrai `errors[]` genericamente, toda
tela de upload já mostra isso via `ErrorState`/`erroForm` sem tratamento especial) — em
vez do truncamento silencioso + timeout sem mensagem de antes.

`tsc --noEmit`/`npm run lint` limpos. Não testado em navegador de verdade nesta sessão
(sem ferramenta de browser disponível) — lógica se apoia no mesmo padrão que o SSR já
usa com sucesso pro mesmo valor de env var, e o lado do backend já foi validado ponta a
ponta pelo próprio time de backend. Recomendado testar um upload real antes de
considerar 100% fechado.

## 2.20 Auditoria do hub `/transparencia` vs. o portal de referência (2026-08-07)

Usuário pediu comparação entre o menu completo do portal real de Lago dos Rodrigues
(PDF exportado da home) e o que `secoes.ts` já cobre, pra levantar o que falta. Achados
completos (~30 itens auditados) ficam só na conversa por ora — aqui só o que foi
resolvido nessa rodada, a "vitória rápida" (dado/rota já existia, só faltava linkar no
hub):

- **Diário Oficial não tinha item nenhum no hub**, apesar do módulo estar 100% pronto
  (seção 2.11) — adicionado em "Informações Institucionais" → `/diario-oficial`.
- **Licitações — Covid-19**: campo `covid` já existe em `LicitacaoDetalhe`/filtro público
  — item novo → `/licitacoes?covid=true`.
- **Dispensas** e **Inexigibilidade** — eram um item só ("Dispensas e inexigibilidade")
  sem link; viraram 2 itens separados (`TipoProcedimentoLicitacao.DP`/`.IN` já existem e
  são filtráveis, um valor por vez, então não dava pra manter num link só) →
  `/licitacoes?tipoProcedimentoLicitacao=DP` e `=IN`.
- **Ato de adesão** → `/licitacoes?tipoProcedimentoLicitacao=AARP` (idem, enum já existe).
- **Prazos de resposta — SIC** → `/esic` (`InformacoesEsicView` já renderiza
  `prazoRespostaDisponivel`/`prazoRespostaBusca`, só faltava o link no hub).
- Confirmado que `usePageableResource` lê **todo** query param da URL direto pro filtro
  inicial (`searchParams.forEach`, seção "PARAMS_RESERVADOS" exclui só `page`/`sort`/
  `categoria`) — por isso um deep link tipo `?covid=true` já filtra a lista certa no
  carregamento, sem precisar de nenhum código novo além do item no hub.
- `tsc --noEmit`/`npm run lint` limpos. Testado com `curl`: as 5 rotas novas/editadas
  200, e SSR de `/transparencia` confirmando os novos `href`s no HTML.

**Gaps reais identificados na auditoria (não implementados, nada a fazer aqui ainda —
aguardando priorização)**: Lista de Fiscais de Contrato (roster de pessoas, diferente do
módulo de documentos que já existe em `/fiscal-contrato`), Licitantes Sancionados
(diferente de Empresas Inidôneas), Relação de Licitantes Contratados, Aditivos de
Contratos como lista global (hoje só existe aninhado no contrato específico), PCA,
Chamamento Público, Ordem Cronológica, Ata de Registro de Preço como entidade própria,
Audiências Públicas, Relatório Anual Estatístico do SIC, Documentos Classificados/
Desclassificados, Dados Abertos de verdade (hoje `/lgpd` é só texto), Emendas
Parlamentares por esfera (Federal/Estadual/Municipal — hoje é uma lista só), Saúde
(lista de espera consultas/exames, estoque de medicamentos, conselho de saúde),
Educação/Assistência Social (conselho do FUNDEB, conselho de assistência social,
conselho municipal de educação).

## 2.21 Licitações/Contratos: 3 gaps da auditoria 2.20, com prints reais de referência (2026-08-07)

Usuário colou 15 screenshots do site de referência cobrindo especificamente o cluster
"Licitações e Contratos" da auditoria da seção 2.20. Os prints mudaram a estimativa de
esforço pra baixo em 2 dos 3 itens — o que parecia precisar de recurso novo no backend
na verdade já tinha os dados prontos, só faltava expor de outro jeito no front:

- **Aditivos de Contratos (lista global)** — o print "Listagem de Aditivos de
  Contratos" mostrou que é uma lista simples (Nº Ato Licitação, Nº Contrato, Assinatura,
  Objeto, Fornecedor). Descoberto via `curl` que `GET /licitacoes/contratos/aditivos`
  **já aceita ser chamado sem `contratoLicitacaoId`** (parâmetro documentado como
  opcional no OpenAPI) e retorna todos os aditivos paginados, endpoint já público (200
  sem token) — **zero mudança de backend**. Novo:
  `src/modules/contratos/aditivo.service.ts` (`aditivoGlobalService`, service público
  separado do `contratoService.listarAditivos` existente que é escopado por contrato),
  `hooks/useAditivosGlobal.ts`, `components/AditivoGlobalCard.tsx` +
  `AditivosGlobalListView.tsx`, rota `/aditivos-contratos`. Sem filtro dedicado — o
  endpoint só aceita paginação/ordenação quando chamado sem `contratoLicitacaoId`.
- **Fiscais de Contratos** — o print mostrou uma tabela (Nome do Fiscal, Nº Contrato,
  Vigência Inicial/Final, Fornecedor) com busca por nome. Confirmado via `curl` que
  `ContratoLicitacao.gestorContrato` (já existia no tipo, usado como "Gestor do
  Contrato" em `ContratoDetalhe.tsx`) **já é filtrável** em
  `GET /licitacoes/contratos/filtro?gestorContrato=...`. **Zero mudança de backend** —
  "Fiscais de Contratos" é só uma reprojeção do mesmo `contratoService.listarTodos` já
  usado por `/contratos`, com `gestorContrato` em destaque como "Nome do Fiscal" em vez
  de escondido dentro do detalhe. Novo: `hooks/useFiscaisContratos.ts`,
  `components/FiscalContratoFiltro.tsx` + `FiscalContratoCard.tsx` +
  `FiscaisContratosListView.tsx`, rota `/fiscais-contratos`. **Não confundir com**
  `/fiscal-contrato` (já existia) — esse é documento genérico (portaria de designação em
  PDF, ato normativo), o novo é o cadastro estruturado de nomes por contrato; são dois
  itens distintos no site de referência também.
- **Licitantes e/ou Contratados Sancionados** — print mostrou que, ao contrário do que a
  auditoria 2.20 supôs (achava que precisava de um modelo de sanção por licitação), é só
  documento genérico (Descrição/Data/Arquivo — "LICITANTES SANCIONADOS" por ano,
  "DECLARAÇÃO DE INEXISTÊNCIA..."), mesmo padrão de `legislacao`/`competencias`. Módulo
  novo completo em `src/modules/licitantes-sancionados/` (service via
  `criarServicoDocumentoGenerico`, mock, hook, ListView) + rota pública
  `/licitantes-sancionados` + entrada no registry (`slug: 'licitantes-sancionados'`,
  categoria "Licitações", `basePath: /licitacoes/licitantes-sancionados`) — CRUD admin
  auto-gerado em `/admin/modulos/licitantes-sancionados`. **Esse precisa de backend**
  (confirmado `500` via `curl` — endpoint não existe) — prompt em
  `prompt-backend-licitantes-sancionados.md`, enviado ao usuário.
- `secoes.ts` ("Licitações e Contratos") ganhou os 3 itens linkados, mais "Relação de
  licitantes contratados" como placeholder sem link (gap real, ainda sem página de
  referência pra desenhar o shape — aguardando print).
- `tsc --noEmit`/`npm run lint` limpos. Testado com `curl`: as 4 rotas novas/editadas
  (`/aditivos-contratos`, `/fiscais-contratos`, `/licitantes-sancionados`,
  `/admin/modulos/licitantes-sancionados`) 200, sem marcador de erro no HTML.

## 2.22 Auditoria de UI/UX, Design System e Acessibilidade (2026-08-09) — concluído

Pedido explícito do usuário: análise rigorosa de consistência visual, responsividade e
WCAG, com correção direta. Achados de que o projeto já estava bem cuidado (zero cor hex
solta fora de `globals.css`, skip-link, modo alto contraste, `PageHeader` consolidado —
seções 2.10/2.16) não foram mexidos. O que mudou:

- **Achado principal — 344 campos em 51 arquivos com `<label>` sem `htmlFor`/`id`**
  (WCAG 1.3.1/4.1.2: leitor de tela não anunciava o rótulo ao focar o campo). Corrigido
  em todo `*Filtro.tsx` do site público, `FormularioOuvidoriaForm.tsx`/
  `FormularioEsicForm.tsx`, e ~30 telas do painel admin — `id` reaproveita o `name` do
  campo quando existe, senão deriva da variável de estado. Um caso (`label` "Imagens" em
  `admin/institucional/noticias/page.tsx`, sem um único input adjacente) virou
  `<fieldset>`/`<legend>` em vez de um `htmlFor` forçado.
- **`eslint-plugin-jsx-a11y` ativado com `plugin:jsx-a11y/recommended`** em
  `eslint.config.mjs` — o `next/core-web-vitals` só trazia um subconjunto mínimo (sem
  `label-has-associated-control`), por isso o achado acima nunca apareceu no lint. Isso
  vai pegar regressões de acessibilidade automaticamente daqui pra frente. Corrigidas as
  7 violações que surgiram: `autoFocus` removido do campo de e-mail do login
  (`no-autofocus`); 3 padrões de "fecha o painel ao clicar em qualquer item filho"
  (bubbling de clique de `<Link>`/`<button>` reais, que já funcionam por teclado) em
  `AcessibilidadeMenu.tsx`, `DropdownMenuItem.tsx` e `FotoAmpliavel.tsx` — não
  reescritos, só documentados com `eslint-disable-next-line <regra> ` + comentário
  explicando por quê (**convenção a seguir**: se o lint apontar
  `click-events-have-key-events`/`no-static-element-interactions` num handler que só
  delega fechamento pra filhos reais já acessíveis, essa é a saída correta, não trocar
  a estrutura).
- **`:focus-visible` global** adicionado em `globals.css` pra `a`/`button`/
  `[role="button"]`/`[tabindex]` — a maioria dos links/nav/cards-como-link não tinha
  nenhum indicador de foco próprio. **Gotcha real, já corrigido**: a primeira versão
  dessa regra incluía `input`/`select`/`textarea` também, empilhando outline global +
  `focus-visible:ring-*` do Tailwind + `focus-visible:border-primary` ao mesmo tempo
  (confirmado via `getComputedStyle` real no navegador, não só leitura de código) — os
  três elementos de formulário foram **removidos** da regra genérica de propósito,
  porque já têm tratamento de foco próprio. Não readicionar sem verificar visualmente.
- Componentes novos **`src/components/ui/Button.tsx`, `Input.tsx`, `Select.tsx`** —
  reproduzem exatamente as classes que se repetiam copiadas/coladas em ~40
  `*Filtro.tsx`/`*ListView.tsx` (84+ botões `primary` quase idênticos, 24+ `outline`,
  10+ `ghost` tipo "Limpar"). `Button` tem `variant`
  (`primary`/`outline`/`danger`/`ghost`) e `size` (`sm`/`md`/`lg`); `Select` tem
  `fullWidth` (`false` nos selects de "Ordenar" das `*ListView.tsx`, que ficam em
  largura natural ao lado do rótulo). **Migrados 38 arquivos** (todo `*Filtro.tsx`
  público + `*ListView.tsx`/`*ListPanel.tsx`/`TabelaCargos.tsx`) — validado com
  screenshot antes/depois pixel-idêntico na prova de conceito (`ContratoFiltro.tsx`/
  `ContratoListView.tsx`) antes de estender pro resto via 3 agentes em paralelo.
  **Convenção a seguir em qualquer `*Filtro.tsx`/`*ListView.tsx` novo ou editado**: usar
  esses 3 componentes em vez de reimplementar a classe Tailwind na mão. **Não
  migrado** (fora de escopo desta rodada, mesma classe de duplicação existe lá também):
  botões ad-hoc dentro do painel admin (`GenericCrudPage.tsx`, `InstitucionalCrudPage.tsx`,
  páginas em `src/app/admin/(painel)/**` — Salvar/Cancelar de formulário) e o `<select>`
  de campos de formulário fora do padrão "Ordenar"/filtro.
- `text-[11px]` (fora da escala do Tailwind) → `text-xs` em ~40 arquivos (labels de
  campo de filtro + metadados de card/tabela). Sobrou intocado de propósito um
  `text-[10px]` isolado (etiqueta "Nova" em thumbnail de upload de notícia) — valor
  diferente, não fazia parte do achado.
- Área de toque mobile: paginação (`Pagination.tsx`) agora mede exatamente 44×44px
  (medido via `getBoundingClientRect`, não só CSS lido); itens do menu mobile
  (`Header.tsx`/`DropdownMenuItem.tsx`) ganharam `py-3 lg:py-2` — maior só abaixo do
  breakpoint `lg`, desktop continua compacto.
- Ajuste de contraste no mapeamento de cor por seção do hub `/transparencia`
  (`SecaoAcesso.tsx`, feature em andamento na mesma sessão): hover do ícone
  `accent-light` com texto branco dava só ~2,9:1 (abaixo do mínimo 3:1 do WCAG pra
  ícone/objeto gráfico) — hover passou a usar `accent-dark` como fundo (~6,7:1),
  mantendo a família de cor.
- `tsc --noEmit`, `next lint` (com a nova regra `jsx-a11y/recommended`) e `next build`
  completo limpos em toda a rodada. Verificação visual real via Playwright
  (`playwright-core`, não `chromium-cli` — ver seção 4) em telas simples e na mais
  complexa (Licitações, 12 campos), incluindo medição de bounding box e
  `getComputedStyle` do estado de foco — não só leitura de código.
- **Pendências conscientes, fora de escopo desta rodada** (mencionar se o usuário pedir
  para continuar): migrar os botões do painel admin pros novos componentes; considerar
  `tailwind-merge`/`clsx` se `Input`/`Select`/`Button` precisarem de mais overrides de
  `className` que colisão de utility (hoje resolvido caso a caso com props como
  `fullWidth` em vez de merge de classe).

## 2.23 Redesign visual — fase piloto (2026-08-09) — concluído, aguardando aprovação pra continuar

Pedido do usuário: modernização visual completa do site (identidade institucional, não
genérica). Dado o tamanho real (~55 rotas), acordado com o usuário fazer uma fase piloto
primeiro — Design System + Header/Footer/Home/Hero + 2 páginas-vitrine — pra aprovar a
direção antes de estender pro resto. Paleta base (azul-marinho `#1f3e73`/vermelho
`#e30613`/azul `#0074c8`) mantida por decisão do usuário, com liberdade de refino.

- **`globals.css`**: tokens novos sem renomear/remover nenhum existente (evita quebrar as
  ~80 classes `bg-primary`/`text-accent`/etc. já espalhadas pelo site e o bloco
  `html.alto-contraste`, que teria que ser auditado de novo se algo fosse renomeado):
  `--color-primary-hover`/`--color-secondary-hover` (alias de `-dark`, só clareza
  semântica), `--color-info`/`--color-info-light` (reaproveita `accent`), `--color-text-muted`
  (`#64748b`, com override pra `#cbd5e1` em `alto-contraste` — o valor normal ficava
  perto demais do mínimo de contraste em fundo quase preto). `--shadow-sm/md/lg` do
  Tailwind sobrescritos pra usar `--color-shadow-light/dark` (já existiam, criados numa
  rodada anterior, nunca referenciados em lugar nenhum — sombra de verdade tintada de
  marca agora em ~80 usos de `shadow-*` no site, sem tocar em nenhum componente). Regra
  global `prefers-reduced-motion: reduce` adicionada (FASE 13 do pedido do usuário).
- **Tipografia**: `next/font/google` (Public Sans — fonte do design system do governo
  federal americano/USWDS, feita pra interface institucional, foge da cara de "template
  de SaaS" tipo Inter) carregada em `layout.tsx`, mapeada em `--font-sans`. Self-hosted
  pelo Next (sem request externo em runtime). `PageHeader.tsx` (usado em ~60 páginas) e
  `SectionHeader.tsx` ganharam escala responsiva (`text-2xl sm:text-3xl` em vez de
  tamanho fixo) — melhoria propaga pra todo o site automaticamente.
- **`Header.tsx`**: `logoSectionHeight` 120→92px (header mais enxuto, pedido explícito da
  FASE 3 de não deixar alto), item de nav ativo agora destacado via `usePathname`
  (`bg-white/15`), hover dos links de nav trocado de bloco sólido `bg-secondary` pra
  `bg-white/10` arredondado (mais discreto). Bug real encontrado e corrigido: logo tinha
  `md:w-68` — classe inválida (68 não existe na escala padrão do Tailwind), nunca
  aplicava nada; virou `md:w-56`. Toda a lógica de scroll/resize/acessibilidade
  (`ResizeObserver`, `alto-contraste`, `AcessibilidadeMenu` duplicado topbar+mobile)
  intacta, só classes visuais mudaram.
- **`Footer.tsx`**: borda superior de 4px `border-secondary` (assinatura visual), ícones
  de contato em `accent-light`, espaçamento maior (`py-10`→`py-14`). **Cuidado real**:
  primeira versão usava `bg-gradient-to-b from-primary to-primary-dark` no `<footer>` —
  reveretido pra `bg-primary` puro porque o override de alto contraste
  (`html.alto-contraste .bg-primary`) casa por nome literal de classe, não por cor
  computada; um gradiente teria vazado azul no modo alto contraste sem nenhum erro
  visível no código.
- **`Hero.tsx`** (novo, `src/modules/home/components/Hero.tsx`): banda de identidade +
  3 acessos rápidos (Transparência/Licitações/Ouvidoria) acima do carrossel de notícias
  na Home. Motivo: o carrossel (`NoticiasCarousel.tsx`) já funcionava como hero de fato,
  mas dependia de existir notícia publicada — sem isso, um visitante novo não tinha
  nenhuma janela fixa de "onde estou". Fundo claro de propósito (carrossel já é
  `bg-primary` cheio logo abaixo; dois blocos azuis emendados pesava a página).
  Reaproveita `Card` em vez de estilizar do zero.
- **Páginas-vitrine**: `/transparencia` (`page.tsx` trocado pro `PageHeader` compartilhado
  em vez de repetir h1+barra na mão — duplicação que existia há tempo; `TransparenciaHub.tsx`
  ganhou contagem de resultados da busca, `aria-live="polite"`); `/licitacoes`
  (`LicitacaoFiltro.tsx`/`LicitacaoCard.tsx` migrados de `text-text-secondary/60` pro
  token novo `text-text-muted`). Os dois módulos já estavam bem construídos (Card, Badge,
  `FiltroCard` com contador de filtros ativos, cores por seção documentadas em
  `SecaoAcesso.tsx`) — não foram reescritos, só os pontos reais de inconsistência.
- **Validação**: `tsc --noEmit`, `next lint` (só os 2 warnings pré-existentes de
  `<img>` em `admin/diario-oficial/config`, não relacionados) e `next build` completos
  limpos, todas as ~85 rotas geradas sem erro. **Gotcha real desta sessão**: rodar
  `next build` com o `next dev --turbopack` já ligado (mesmo `.next/`) corrompeu o dev
  server (500 genérico em toda rota) — mesma classe de bug já documentada acima pra "dois
  `next dev` simultâneos", só que com `build`+`dev` concorrentes. Resolvido matando os 3
  processos (`next dev`, o `node` do binário, `next-server`) + `rm -rf .next` + `npm run
  dev` de novo. Confirmado depois via `curl` (200 em `/`, `/transparencia`, `/licitacoes`,
  `/servidores`, `/noticias`) e log do dev server sem erro/warning.
- **Fora de escopo desta rodada, de propósito** (piloto aprovado com o usuário antes de
  estender): as ~50 páginas restantes do site (todas as outras rotas de
  `src/app/**`), Hero/cards das demais seções internas, botões do painel admin (mesma
  pendência já registrada na seção 2.22), migração completa de `text-text-secondary/60`
  → `text-text-muted` no resto do site (só aplicada nos 2 arquivos da vitrine).

**Rodada 2, mesma sessão — "ousar mais"**: usuário achou o piloto conservador demais
("tenta ousar um pouco mais, mais moderno, não exagera"). Em vez de espalhar mais
efeitos, comprometi mais forte com um único gesto de assinatura no Hero: fundo
`bg-primary-gradient` cortado em diagonal via `clip-path` (só a camada de fundo, nunca o
wrapper de conteúdo — evita clipar texto/cards por engano), blob desfocado
(`bg-accent/25 blur-3xl`) num canto, tipografia bem maior (`text-4xl md:text-5xl
font-extrabold`), e os 3 cards de acesso rápido "flutuando" sobre o corte via margem
negativa. Essa mesma superfície de marca (`.bg-primary-gradient`, nova classe em
`globals.css`) foi reaproveitada em `NoticiasCarousel.tsx` e na banda de CTA final da
Home — 3 "momentos azuis" da página agora consistentes, sem repetir a diagonal em nenhum
outro lugar (ficaria com cara de template). Nav do Header trocou indicador de item ativo
de fundo sólido (`bg-white/15`) pra sublinhado (`border-b-2 border-secondary`) — leitura
mais contemporânea. **Cuidado real, resolvido antes de virar bug**: qualquer gradiente
num container que hoje é `bg-primary` puro quebra o alto contraste em silêncio, porque o
override `html.alto-contraste .bg-primary` casa por classe literal, não por cor
computada — por isso `.bg-primary-gradient` já nasceu com seu próprio override
(`html.alto-contraste .bg-primary-gradient { background-image: none !important;
background-color: #000 !important }`) em vez de escrever `bg-gradient-to-br
from-primary...` direto nos três componentes. `tsc`/`next lint` limpos; validado via
`curl` no dev server (200 em `/` e `/licitacoes`, sem erro no log).

## 2.24 Paleta "Fidelidade à marca" a partir da logo oficial (2026-08-09) — concluído

Usuário mandou a logo oficial da Prefeitura e pediu sugestão de paleta a partir dela.
Publiquei um artifact comparando 3 direções (A. fiel à marca, B. sóbria/baixo risco,
C. tríade por domínio) com swatches + preview aplicado; usuário escolheu **A**.

- **`globals.css`**: `--color-primary` `#1f3e73`→`#1e4d8c` (azul real da logo, menos
  "corporativo escuro"; contraste com texto branco ainda ~8,4:1, folga grande acima do
  mínimo AA), `--color-primary-light`/`-dark` recalculados pra manter a mesma relação
  proporcional. `--color-secondary` `#e30613`→`#e4262e` (quase igual, a logo já usa
  praticamente esse vermelho; ~4,55:1 com texto branco, passa AA com margem apertada).
  `--color-shadow-light/dark` (rgb usado nas sombras tintadas da seção 2.23)
  recalculado pro novo primary, senão desalinhava do resto da paleta.
- **Verde novo, token próprio**: `--color-tertiary`/`-light`/`-dark` (`#2fa84f` /
  `#4fc373` / `#1f7a38`), **não** um apelido de `--color-success` — um é identidade de
  marca (logo), o outro é estado semântico, mantidos independentes de propósito.
  `tertiary-dark` existe especificamente pro caso fundo-sólido-com-texto-branco (mesmo
  motivo do fix de `accent-light`→`accent-dark` já documentado em `SecaoAcesso.tsx`):
  `tertiary` puro com branco em cima dá só ~3:1, `tertiary-dark` dá ~5,4:1.
- **Achado real durante a validação**: o Tailwind v4 **poda tokens de `@theme` que não
  aparecem como classe literal em nenhum arquivo escaneado** — confirmado comparando
  `--color-info` (sobrevive, mas por acaso não tem uso real também — a explicar depois
  se for relevante) contra `--color-warning` (nunca teve uso, nunca é emitido no CSS
  compilado, isso já era assim **antes** desta sessão, não é regressão). `tertiary`
  simplesmente não aparecia no CSS até eu de fato referenciar as classes em algum
  arquivo. Corrigido usando o token de verdade: estendido `CorSecao`
  (`src/modules/transparencia/data/secoes.ts`) com `'tertiary'`, nova entrada em
  `CORES_SECAO` (`SecaoAcesso.tsx`), e a seção **"Obras Públicas"** (única reatribuída —
  as outras 11 seções continuam com a cor que já tinham) passou de `primary-dark` pra
  `tertiary` — candidato mais natural (infraestrutura/obras), sem forçar uma decisão de
  conteúdo em massa que seria escopo da opção C (não escolhida).
- Confirmado via `curl` no CSS compilado do dev server: `--color-tertiary` e
  `--color-tertiary-dark` presentes depois do uso real (antes, ausentes mesmo depois de
  matar os processos e `rm -rf .next` — não era cache, era poda por ausência de uso
  mesmo). `tertiary-light` segue sem uso real em nenhum componente, por isso não aparece
  no CSS ainda — comportamento esperado, não é bug.
- `tsc --noEmit` e `next lint` limpos; `/`, `/transparencia`, `/licitacoes` retornando
  200 no dev server, sem erro/warning no log.
- **Fora de escopo**: reatribuir as outras 11 seções do hub (decisão de conteúdo, não
  feita sem pedido explícito); usar `tertiary` em qualquer componente fora de
  `SecaoAcesso.tsx`/`ItemAcessoCard.tsx`.

## 2.25 Segunda passada visual — "ouse mais" (2026-08-09) — concluído

Usuário achou o resultado das seções 2.23/2.24 bom mas ainda conservador ("se comparado
com a versão anterior parecer só 'mais bonito', não ousou o suficiente") e pediu uma
segunda passada explicitamente mais ousada (gradientes, profundidade, glass "só onde faz
sentido", tipografia mais expressiva), inspirada em Stripe/Linear/Vercel/Notion/Apple/
gov.uk — sem virar futurista/extravagante nem perder legibilidade/acessibilidade.

- **Hero**: fundo virou um "mesh" de 3 blobs desfocados (`bg-accent/25`,
  `bg-tertiary/20`, `bg-secondary/15`) com deriva lenta via `@keyframes` (22-26s,
  `ease-in-out infinite` — plenamente coberto pelo `prefers-reduced-motion` global já
  existente, sem tratamento extra por componente). Palavra "Transparência" no headline
  ganhou `.text-gradient-brand` (gradiente branco→azul-claro via `background-clip:
  text`, com fallback `@supports` e override próprio pro alto contraste — só uma
  palavra, não o headline inteiro, perde legibilidade rápido em bloco maior). Os 3 cards
  de acesso rápido viraram glass (`Card` ganhou prop `glass`) e os ícones passaram de
  tinta plana pra badge em gradiente (`from-primary`/`from-secondary`/`from-tertiary`),
  um por card — mesma cor, mais peso visual.
- **Novo `.card-glass`** (`globals.css`): opacidade alta de propósito (90%, não os
  30-40% típicos de glassmorphism decorativo) — o texto de dentro precisa manter o
  mesmo contraste de um card branco sólido, o vidro é só acabamento (blur + borda
  clara), não redução de legibilidade. `@supports` com fallback sólido; override de
  alto contraste vira superfície escura sólida igual ao resto (mesma limitação já
  documentada sobre `text-primary` em chip sobre fundo escuro se aplica aqui).
- **Header**: nav vira `bg-primary/85 backdrop-blur-md` só depois que a logo já recolheu
  no scroll (não fica vidro o tempo todo) — desligado explicitamente quando
  `altoContraste` é `true` (condição no componente, não seletor CSS — `bg-primary/85` é
  uma classe diferente de `.bg-primary`, mesma pegadinha de sempre, resolvida na raiz
  desta vez em vez de mais um override).
- **`Card.tsx`**: hover ganhou `scale-[1.01]` e `hover:border-primary/25` além do
  shadow/translate que já tinha (sombra em si já sai tintada de azul desde a seção
  2.23, via `--shadow-*` global — não precisou de lógica por card).
- **`NoticiasCarousel`**: conteúdo agora troca com crossfade (`key={ativo}` +
  `.animate-fade-in`, 0.5s) em vez de troca abrupta; texto ganhou painel glass sutil
  (`bg-white/10 backdrop-blur-sm`) e o fundo ganhou o mesmo tratamento de textura de
  pontos + um blob do Hero, pra amarrar os dois momentos.
- **Licitações**: `Badge.tsx` ganhou prop opcional `dotClassName` (indicador sólido
  antes do texto) — cor nunca é só o dot, o texto do status continua sempre visível.
  Novo `STATUS_BADGE_DOT` em `statusBadgeStyle.ts` (espelha `STATUS_BADGE_STYLE`,
  mesma categoria/cor, só na versão -500 sólida) e `StatusLicitacaoDot` em
  `enums.ts`; usado em `LicitacaoCard.tsx`. Contratos/Obras não migrados (fora de
  escopo, mesmo módulo compartilhado, sem pedido explícito pra esses dois ainda).
- **Footer**: `bg-primary` → `.bg-primary-gradient` (já seguro pro alto contraste desde
  a seção 2.23); friso `border-t-4 border-secondary` virou uma barra de 4px com
  gradiente linear combinando as 3 cores de marca (`primary-light`→`secondary`→
  `tertiary`), classe `.hero-decor` (some no alto contraste, é só decoração).
- **Validação**: `tsc --noEmit` e `next lint` limpos; `/`, `/transparencia`,
  `/licitacoes` retornando 200 no dev server sem erro/warning no log; confirmado via
  `curl` no CSS compilado que todas as classes novas (`.hero-decor`, `.card-glass`,
  `.text-gradient-brand`, `.animate-blob-drift-*`, `.animate-fade-in`) e seus
  respectivos overrides de `html.alto-contraste` foram de fato emitidos (não só
  declarados — ver poda do Tailwind v4 documentada na seção 2.24).
- **Fora de escopo**: ItemAcessoCard (ícones de seção do hub `/transparencia`)
  continuam com tinta plana de propósito — grid denso de ~40 itens, gradiente em cada
  ícone pesaria a leitura; badge dot+pill não migrado pra Contratos/Obras.

## 2.26 Extensão pro resto do site público (2026-08-09) — concluído

Usuário aprovou a segunda passada (2.25: "ficou na medida certa") e liberou estender
pro resto do site. Como praticamente todo o site público já consumia os componentes
compartilhados (`Button`/`Input`/`Select`/`Card`/`Badge`/`PageHeader`/`Pagination`)
atualizados nas seções 2.23-2.25, e cor/sombra/radius vêm de `--theme` global, a maior
parte do site já herdava o visual novo automaticamente — o trabalho real aqui foi
fechar as pontas que ainda dependiam de padrão antigo, não redesenhar página por
página:

- **`text-text-secondary/60` → `text-text-muted`** em **66 arquivos** do site público
  (`src/modules/**`, `src/components/**`, `src/app/**` exceto `/admin`) — sweep
  mecânico via `sed`, mesmo padrão já validado em Licitações (seção 2.23). Admin
  continua de fora de propósito, mesma linha das pendências já registradas.
- **`/mapa-do-site`**: último `h1`+breadcrumb hand-rolado do site público, trocado pelo
  `PageHeader` compartilhado (mesmo ajuste já feito em `/transparencia` na 2.23).
- **Badge dot+pill (2.25) estendido pra Contratos e Obras** — os 2 outros consumidores
  do `STATUS_BADGE_STYLE` compartilhado, pendência registrada explicitamente na 2.25:
  novo `STATUS_BADGE_DOT` (já existia) espelhado em `contratoStatusDot()`
  (`contratos/status.ts`) e `StatusObraDot` (`obras/types.ts`); aplicado em
  `ContratoCard.tsx`, `ContratoDetalhe.tsx`, `LicitacaoContratos.tsx` (contrato dentro
  do detalhe de licitação) e `ObraCard.tsx` — este último não usava nem o componente
  `Badge` (span com classe copiada na mão), migrado pra `Badge` de verdade no processo.
- **Validação real, não só leitura de código**: `tsc --noEmit` e `next lint` limpos;
  `next build` completo (78 páginas estáticas + as dinâmicas) sem erro — rodado com o
  dev server **parado** de propósito (mesmo incidente da 2.23 se rodar os dois ao mesmo
  tempo). Dev server subido de novo depois, `.next` limpo; amostra de 10 rotas de
  módulos diferentes tocados confirmada via `curl` (200 em todas, um `000` isolado em
  `/` que era só corrida do primeiro request durante compilação do Turbopack — resolvido
  sozinho no retry, sem erro real no log).
- **Ainda fora de escopo**: painel admin inteiro (cor/token propagam automaticamente
  via CSS global, mas botões/badges do admin não foram migrados pros componentes
  compartilhados — pendência registrada desde a 2.22); ItemAcessoCard continua com
  tinta plana (2.25); nenhuma página ganhou hero/glass/gradiente própria — esse
  tratamento fica reservado pra Home de propósito, replicá-lo em todo lugar
  contradiria a "não exagera" que guiou as duas rodadas anteriores.

**Complemento no mesmo dia**: usuário perguntou se o público estava mesmo 100% migrado
antes de mexer no admin — auditoria real (não só releitura do que já tinha sido feito)
achou 2 lacunas genuínas que os sweeps anteriores não pegaram, ambas corrigidas:
`LicitacaoDetalhe.tsx` (badge de status na página de detalhe usava `StatusLicitacaoStyle`
mas nunca ganhou o dot da seção 2.25 — só `LicitacaoCard.tsx`/`LicitacaoContratos.tsx`
tinham sido cobertos); `EmpresaInidoneaCard.tsx` (`gestao-fiscal`) usava
`bg-red-100 text-red-700`/`bg-red-50 text-red-600` direto no código em vez do
`STATUS_BADGE_STYLE`/`STATUS_BADGE_DOT` compartilhado — migrado pra
`STATUS_BADGE_STYLE.cancelado`/`.error` (é uma lista de empresas inidôneas, sempre
estado negativo, não precisa de mapa próprio). De quebra, 3 tabelas de valor negativo
(`ServidorDetalhe.tsx`, `FolhaPagamentoMesView.tsx`, `TabelaCargos.tsx`, coluna de
desconto) usavam `text-red-600` cru — trocado por `text-error`. Confirmado por grep que
não sobra hex solto nem `bg-<cor>-<nº>`/`text-<cor>-<nº>` fora do sistema compartilhado
no site público (as poucas ocorrências restantes checadas uma a uma: `TipoEdicaoDiario`
é categoria, não status, fica com pílula plana de propósito; `text-yellow-400` em
`AcessibilidadeMenu.tsx` é o próprio amarelo do alto contraste, intencional). `tsc`/
`next lint` limpos, amostra de rotas confirmada via `curl`.

## 2.27 Redesign ousado do painel admin — rodada 1 (2026-08-09) — concluído, painel bespoke fora de escopo

Pedido do usuário: painel administrativo com cara de produto SaaS premium (Linear/
Vercel/Stripe/Raycast/Notion/Arc/fintechs como inspiração conceitual), "muito mais
liberdade criativa" que o site público, priorizando nesta ordem: Sidebar > Dashboard >
Topbar > Cards/KPIs > Gráficos > Tabelas > Formulários > Upload > Modais > Estados.

**Decisão de design não trivial, registrada aqui pra não ser revertida por engano**: o
painel virou um ambiente **permanentemente escuro** (não claro/escuro com toggle). O
pedido tinha uma seção explícita de "Dark Mode" pedindo pra avaliar se compensa
adicionar uma experiência própria (não simplesmente inverter cores) — decidido que sim
compensa ter uma experiência escura de verdade (é literalmente a estética padrão de
todas as referências citadas: Linear, Vercel, Raycast e Arc são escuros por padrão), mas
que um toggle claro/escuro completo com persistência é um projeto à parte, não incluído
aqui. Namespace de tokens `admin-*` inteiramente separado da paleta do site público em
`globals.css` (`--color-admin-bg/surface/surface-2/surface-3/border/text/accent/...` +
`.admin-gradient-accent`/`.admin-gradient-mesh`/`.admin-glass`) — zero risco de vazar
pro tema público, zero mudança de token existente.

- **`AdminSidebar.tsx`**: reescrita completa. Ícone por categoria (não por link
  individual — ~50 links, ícone genérico repetido não ajudaria), indicador de item
  ativo em barra de gradiente lateral (não preenchimento sólido), collapse/expand
  (72px↔288px, preferência persistida em `localStorage`), tooltip via CSS puro
  (`group-hover`, sem JS de posicionamento) quando colapsada, avatar de iniciais
  (derivadas do e-mail — `Usuario` não tem campo de nome/foto, não inventei um).
- **`AdminTopbar.tsx`** (novo): breadcrumb derivado da rota atual contra a lista real de
  navegação (mesma fonte que a sidebar usa), busca client-side sobre módulos/páginas
  reais (nenhum endpoint novo), indicador de ambiente lendo `NEXT_PUBLIC_USE_MOCK` (já
  existia, usado em ~15 services — não inventei essa variável), botão de colapsar a
  sidebar. **Sem notificações**: não existe fonte de dado real pra isso no backend hoje
  — um sino com contador fake seria exatamente o "não invente dados" que o próprio
  pedido probe para o Dashboard; melhor omitir que fingir.
- **Dashboard** (`src/app/admin/(painel)/page.tsx`): reescrito com KPIs reais —
  Licitações/Contratos/Servidores (total via `listar({size:1}).totalElements`, mesmo
  truque já usado em `DiarioOficialDestaque.tsx` do site público) e Obras em andamento
  (filtro real `StatusObra.EM_ANDAMENTO`). Cada KPI busca e falha independente
  (`Promise` isolada por card — um endpoint fora do ar não derruba os outros). Atividade
  recente puxa `auditoriaService.listar` de verdade (admin-only, mesma regra que já
  protegia a página de Auditoria). Nenhum gráfico foi adicionado: não existe lib de
  chart no projeto (`package.json` conferido) e nenhuma fonte de dado em série temporal
  óbvia sem desenho de API novo — instrução explícita do pedido era não inventar dado,
  então fica de fora até existir algo real pra mostrar.
- **`GenericCrudPage.tsx`** (maior alavanca real: ~29 dos módulos do registry passam por
  esse único arquivo) e **`InstitucionalCrudPage.tsx`** (Avisos/Notícias) e
  **`AutoridadeConfigPage.tsx`** (Prefeito/Vice-Prefeito) reescritos: tabela/formulário/
  upload no novo visual, `confirm()` nativo do navegador trocado por
  `ConfirmDialog.tsx` (novo, acessível — foco no cancelar ao abrir, Escape fecha,
  `role="alertdialog"`) nos três. Upload em `GenericCrudPage` ganhou dropzone de
  verdade (`onDragOver`/`onDrop`, não só decoração) além do clique.
- **Achado real, corrigido antes de virar bug visível**: `Pagination.tsx`/
  `EmptyState.tsx` do site público têm `bg-white`/`bg-primary` fixos — reaproveitá-los
  sem alteração dentro do novo shell escuro teria deixado uma barra branca sólida em
  toda tabela do admin (não "menos bonito", quebrado de verdade). Criados
  `AdminPagination.tsx`/`AdminEmptyState.tsx`/`AdminErrorState.tsx` (mesma lógica,
  tokens `admin-*`) em vez de tentar tornar os componentes públicos "cientes de tema" —
  mais simples e sem risco de regressão nas ~85 rotas públicas que os usam como estão.
- **Outro achado real**: primeira versão do upload de foto em `AutoridadeConfigPage.tsx`
  usava `file:admin-gradient-accent` — variante do Tailwind (`file:`) só combina com
  utility reconhecida, não com classe CSS escrita à mão; não teria gerado CSS nenhum.
  Trocado por `file:bg-admin-accent hover:file:bg-admin-accent-dark` (tokens reais).
- **`/admin/login`**: fora do layout `(painel)` (rota própria, sem sidebar/topbar) —
  também migrado pro visual escuro, senão seria a primeira tela que o admin vê antes de
  um dashboard completamente diferente. Confirmado que o `autoFocus` removido do campo
  de e-mail na auditoria de a11y (seção 2.22) **não** foi reintroduzido sem querer.
- **Validação**: `tsc --noEmit`, `next lint` e `next build` completo (78 rotas) limpos;
  dev server reiniciado do zero, `/admin/login`, `/admin`, uma rota de
  `GenericCrudPage`, `InstitucionalCrudPage` e `AutoridadeConfigPage` retornando 200
  sem erro no log; confirmado no CSS compilado que os tokens/classes `admin-*` novos
  foram realmente emitidos (mesma poda do Tailwind v4 documentada na seção 2.24 — sem
  uso real em JSX, não aparecem). Site público re-verificado (`/`, `/licitacoes`) pra
  confirmar que nada vazou entre os dois sistemas de tokens. **Não foi possível**
  testar o fluxo autenticado de verdade (login → dashboard → criar/editar/excluir)
  nesta sessão — sem backend rodando nem credenciais disponíveis no sandbox; validação
  ficou em build+tsc+lint+leitura de código, não em clique real na tela.
- **Fora de escopo desta rodada, de propósito — é a maior pendência real**: as páginas
  *bespoke* do admin que não passam por `GenericCrudPage`/`InstitucionalCrudPage`/
  `AutoridadeConfigPage` continuam com o visual antigo (claro) por dentro, agora
  encaixadas dentro do shell escuro novo — inconsistente, não quebrado. Lista completa:
  `admin/licitacoes/**`, `admin/obras/**`, `admin/rh/**` (servidores/cargos/diárias/
  folha/concursos), `admin/geral/unidades/**`, `admin/geral/fornecedores`,
  `admin/geral/tabela-valores`, `admin/esic/**`, `admin/ouvidoria/**`,
  `admin/diario-oficial/**`, `admin/anticorrupcao/**`, `admin/convenios`,
  `admin/emendas-parlamentares`, `admin/usuarios`, `admin/auditoria`, `admin/documento`.
  Mencionar se o usuário pedir pra continuar — é uma lista grande, mesmo padrão de
  fase piloto → aprovação → extensão que funcionou bem nas seções 2.23-2.26.

## 2.28 Admin bespoke: resto do painel migrado pro tema escuro (2026-08-09) — concluído

Usuário mandou print de 3 telas reais (Notícias, Usuários, Empresas Inidôneas) mostrando
fundo branco quebrado dentro do shell escuro novo, e apontou que a sidebar colapsada
"tá estranho". Os dois problemas eram reais, não só percepção:

- **Bug real na sidebar colapsada**: `AdminSidebar.tsx` só passava `icone` pros 3 itens
  de topo (Início/Usuários/Auditoria) — todo link individual dentro de categoria
  renderizava sem ícone nenhum, só invisível ocupando espaço quando colapsada (o texto
  já sumia via `{!colapsada && <span>}`, mas a linha continuava lá vazia). Corrigido:
  colapsada agora mostra só cabeçalho de categoria (virou `<button>` clicável com
  tooltip que expande a sidebar de novo) + os 3 itens de topo; links individuais somem
  de vez quando colapsada em vez de aparecer como buraco.
- **As 3 páginas dos prints eram reais exemplos de um problema maior**: das 28 páginas
  *bespoke* do admin fora do escopo da seção 2.27 (registradas lá explicitamente como
  pendência), nenhuma tinha sido migrada ainda — cada uma reaproveitava `Card`/`Badge`/
  `Pagination`/`EmptyState`/`ErrorState`/`Skeleton` do site público (`bg-white` fixo),
  que ficam quebrados dentro do `<main>` escuro do admin.

**Como foi feito**: migrei 3 arquivos à mão primeiro (Notícias — upload de múltiplas
imagens com marcação de principal, 2 `ConfirmDialog`; Usuários — ações de promover/
rebaixar/desativar/reativar; Empresas Inidôneas) pra confirmar a receita de conversão
com exemplos reais. Depois paralelizei as 22 páginas restantes em 5 agentes de
background, cada um com um recorte de arquivos disjunto e a receita completa (mapeamento
de classe por classe: containers, inputs, botões, tabela, badge→pill com dot, ações→
ícone, `confirm()` nativo→`ConfirmDialog`) — mesma estratégia que já tinha funcionado
pro rollout do site público (seção 2.22 menciona "3 agentes em paralelo" pro mesmo tipo
de tarefa).

- **4 dos 5 agentes terminaram limpo** (`tsc --noEmit` sem erro cada um): Anticorrupção+
  Geral (5 arquivos), ESIC+Ouvidoria+Convênios+Emendas (6), Diário Oficial+Documento+
  Auditoria (6), RH (6).
- **O 5º agente (Licitações+Obras) caiu no meio** por erro de conexão da API, bem na
  hora de começar o último arquivo (`obras/[id]/page.tsx`, avisado como "o mais
  complexo"). Os outros 4 arquivos dele (`licitacoes/page.tsx`, `licitacoes/[id]`,
  `licitacoes/contratos/[contratoId]`, `obras/page.tsx`) já estavam corretamente
  migrados — confirmado por grep (zero import de `@/components/ui/*`, dezenas de
  referências a `admin-*`). Migrei `obras/[id]/page.tsx` (829 linhas, 3 abas — Medições/
  Anexos/ART, cada uma com form+tabela+exclusão própria) manualmente. Reexportei
  `StatusObraDot` em `modules/admin/obras/types.ts` (re-export de 1 linha do que já
  existia em `modules/obras/types.ts` desde a seção 2.26) mas decidi **não usá-lo**
  nessa página — os valores de `StatusObraStyle`/`StatusObraDot` do site público são
  pílulas claras (`bg-yellow-100` etc.), ficariam sem vida no escuro; mapeei
  `StatusObra` pra `admin-info`/`admin-success`/`admin-error` direto, mesma lógica que
  pedi nos prompts dos agentes.
- **Confirmado por grep**: zero arquivo em `src/app/admin/**`/`src/modules/admin/**`
  ainda importando `@/components/ui/*` ou `@/components/Breadcrumbs`, exceto
  `admin/documento/page.tsx` — que usa `PdfViewer` (visualizador de PDF em si, não um
  container estilizado; legítimo manter).
- **Validação real**: `tsc --noEmit`, `next lint` e `next build` completo (78 rotas)
  limpos depois de tudo consolidado; dev server reiniciado do zero; amostra de 13 rotas
  de todos os clusters (licitações, obras incl. `/obras/1`, RH, diário oficial,
  auditoria, documento, unidades, convênios, esic, ouvidoria) confirmada via `curl` —
  200 em todas, sem erro no log. Site público reconferido (`/`, `/obras`) pra garantir
  que nada vazou entre os dois sistemas de tokens.
- **Decisões de design que os agentes tomaram sozinhos** (revisão rápida dos relatórios,
  todas consistentes com a receita): badges de categoria/tipo sem semântica boa/ruim
  (tipo de solicitação E-SIC, finalidade de ouvidoria, tipo de emenda, tipo de edição do
  Diário Oficial) viraram pill neutro sem dot; "Vigente" (unidades/gestores) usou
  `admin-info` em vez de `admin-success` pra não confundir com "Verificado"; status de
  publicação do Diário Oficial (`RECEBIDO`/`VALIDANDO`/`AGUARDANDO_APROVACAO`/
  `PUBLICADO`/`FALHOU`) ganhou mapa próprio pras 5 cores semânticas; ação extra "Anexos"
  em `rh/concursos` (que a receita não previa, só Editar/Excluir) virou 3º botão de
  ícone em vez de sobrar como link de texto solto.

**Painel admin está, com isso, 100% migrado pro tema escuro** — não sobra mais nenhuma
superfície `bg-white` fora de lugar. Segue de fora do escopo (não pedido): dark mode
como toggle (é ambiente único, decisão da seção 2.27), gráficos no Dashboard (sem lib
de chart no projeto, sem dado real óbvio pra mostrar), migração equivalente do
site público pro escuro (não faz sentido — é o site público, identidade institucional
clara é o objetivo ali, não um "modo escuro").

## 3. Como decidir o padrão de um módulo novo

```bash
curl -s http://localhost:8080/v3/api-docs | python3 -m json.tool   # spec atualizado
```

Formatos de DTO em uso, decida qual é **antes** de codar:

- **Documento genérico** — `{id, descricao, data, caminhoArquivo}` via
  `GET /{basePath}/{recurso}/filtro` + `GenericDocumentoFiltroDto`. Reaproveita
  `src/modules/shared/services/documentoGenerico.service.ts`
  (`criarServicoDocumentoGenerico`) — mais rápido, ~4 arquivos pequenos + rota.
- **Bespoke paginado** — DTO próprio, mas pagina/filtra no backend. `usePageableResource<T, F>`
  direto. Precedentes: `servidor`, `diarias`, sub-recursos de `convenios`.
- **Bespoke sem paginação** — `GET` retorna array completo, **ou** o backend pagina mas a tela
  não expõe UI de paginação (pede uma página grande — `size: 200`–`500` — e usa só `.content`,
  padrão usado quando a lista é naturalmente pequena/escopada, ex.: aditivos de um contrato,
  folha de um mês). `useAsyncData` + `AsyncList`. Precedentes: `gestao-fiscal`, `secretarias`.
- **Info singleton** — `GET` retorna um objeto único, não lista. `useAsyncData` com
  `valorInicial: null`. Precedentes: `esic`, `ouvidoria`, `prefeitura` (prefeito/vice-prefeito).
- **PDF estático, sem backend** — `src/components/ui/PdfViewer.tsx` direto no `page.tsx`, com
  o caminho marcado `// TODO`. Precedentes: `estrutura-organizacional`, `organograma`.
- **Multipart com sub-recursos filhos** (ex: Unidade/Secretarias, Obras) — página de detalhe
  `[id]/page.tsx` com abas por sub-recurso; cada sub-recurso normalmente só tem criar+listar+
  excluir (sem editar — exclui e recria); confirme os paths de exclusão direto no controller do
  backend, não confie só na descrição em prosa de quem passou o contrato (bespoke desse tipo já
  teve path errado documentado mais de uma vez).

Outras convenções:
- Rota do frontend espelha o basePath do backend 1:1.
- Estado compartilhável (aba ativa, filtros, página) sempre na URL via `useUrlState` /
  `usePageableResource`, nunca em `useState` puro.
- Tipo canônico de um recurso que existe tanto no site público quanto no admin mora no módulo
  público (`src/modules/<recurso>/types.ts`), e o admin reexporta de lá + define só os
  `*Request` — precedentes: `ObraPublica`, `Unidade`.
- Antes de assumir que um contrato multipart está certo, teste os campos opcionais (arquivo
  ausente, PDF ausente) via `curl` direto — pelo menos 3 módulos diferentes já tiveram bug real
  de backend especificamente no caminho "sem arquivo".
- **Enum vindo do backend pode ser a chave (`"EM_ANDAMENTO"`) ou a descrição textual (`"Em
  andamento"`/`"EM ANDAMENTO"`)** dependendo se a entidade Java tem `getDescricao()` custom ou
  deixa o Jackson serializar o enum puro — não dá pra assumir, sempre teste via `curl` antes de
  montar o `<select>` de edição. Quando é descrição, `<select value={form.campo}>` só casa a
  opção certa se você reverter a descrição de volta pra chave antes de popular o form (senão o
  form abre em branco/errado mesmo com o dado certo por baixo). Precedente resolvido em
  `src/modules/admin/licitacoes/enumMapping.ts` (`normalizarStatus`/`normalizarTipoProcedimento`)
  — mesma ideia serve pra qualquer módulo novo que caia nesse caso.
- Cuidado com comparação de tipo em filtro que vem da URL: `usePageableResource` guarda todo
  filtro como **string** (lido de `URLSearchParams`), mesmo que o tipo declarado em `FiltroX`
  seja `boolean`/`number`. Comparar direto com `=== false`/`=== 0` nunca bate (é sempre a string
  `"false"`/`"0"`) — já causou um bug real (filtro de visibilidade de Licitação travava em
  "ocultas", só saía com reload). Compare com `String(filtros.campo) === 'false'` ou similar.

## 4. Como retomar (rodar o ambiente)

**Prefira o perfil `postgres`, não `dev`** — banco real (Postgres via Docker), dados persistem
entre restarts, já vem populado com fixtures.

```bash
npm run dev                                                                          # frontend :3000

cd ~/Documentos/ProjetoPref/portal-transparencia-pref
docker compose up -d postgres meilisearch                                           # precisa docker
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres -DskipTests -Dmaven.test.skip=true  # backend :8080

curl -s http://localhost:8080/v3/api-docs                                           # confirma o backend e pega o spec atualizado
```

Perfil `dev` (H2 em memória, reseta a cada restart) serve pra testar algo isolado sem depender
de fixture — troque `postgres` por `dev` e pule o `docker compose up`.

Login: `admin@prefeitura.dev` / `admin123` (bootstrap automático no primeiro start, nos dois
perfis).

Playwright está disponível no ambiente (`node_modules/.bin/playwright`) — rodar um script de
teste precisa de `NODE_PATH=<repo>/node_modules node script.js` se o script morar fora do
projeto (ex: no scratchpad da sessão), senão a resolução de módulo não encontra o pacote.
**Numa sessão diferente (2026-08-09, ver seção 2.22)** isso não estava verdade — nem
`playwright` nem `chromium-cli` existiam no ambiente/projeto. O que funcionou: `npm install
playwright-core` **dentro do diretório do scratchpad** (não no projeto — evita mexer no
`package.json` só pra QA visual pontual) + `npx playwright install chromium` **sem**
`--with-deps` (a flag tenta `sudo apt-get`, que trava pedindo senha neste ambiente sem root;
sem ela, o binário do Chromium baixa normalmente em `~/.cache/ms-playwright` e roda headless
com `chromium.launch({ args: ['--no-sandbox'] })`). Ambiente pode variar por sessão/máquina —
confira o que está disponível antes de assumir qualquer um dos dois caminhos.

### Pegadinhas específicas deste sandbox (2026-07)

- **Node.js não está no PATH por padrão** neste ambiente (é gerenciado via nvm, mas o shell não
  sourced o nvm automaticamente pra sessões de ferramenta/ci). Antes de rodar `npm`/`npx`,
  confirme com `ls ~/.nvm/versions/node/` e prefixe: `export
  PATH="$HOME/.nvm/versions/node/<versão>/bin:$PATH"`. Pra rodar o dev server via ferramenta de
  preview (que não herda esse `export`), já existe um workaround em `.claude/` (não commitado de
  propósito, é específico da máquina):
  - `.claude/launch.json` aponta `runtimeExecutable` pra `.claude/dev-with-node.sh`.
  - `.claude/dev-with-node.sh` só exporta o PATH certo e faz `exec npm run dev`.
  Se `node_modules` não existir ainda, rode `npm install` primeiro (uma vez).
- **`/opt/portal` (raiz de upload padrão do backend, perfis `postgres`/`dev`) não é gravável**
  pelo usuário `pc` neste sandbox (é do `root`). Sem sudo disponível, suba o backend com um
  override pra um diretório que você tenha permissão de escrita, ex:
  `-Dspring-boot.run.arguments="--app.root.dir=$HOME/portal-uploads-dev"` (crie a pasta antes).
- O backend roda com **`spring-boot-devtools`** — reinicia sozinho quando detecta classe
  recompilada. Durante testes manuais isso pode causar um `ECONNREFUSED` de alguns segundos no
  meio de uma sequência de requests; não é bug do frontend nem do seu teste, só espere e repita.
- Há um **job de reconciliação** no pipeline do Diário Oficial que retoma sozinho solicitações
  travadas há mais de ~15min — pode mexer em dados de teste/fixture sem você ter feito nada (já
  vimos isso mudar o status de uma licitação de teste no meio de uma sessão). Não é bug seu, mas
  pode confundir se você não souber que existe.
- **Dois `next dev` rodando ao mesmo tempo corrompem o `.next/`** — cada processo escreve
  manifests no mesmo diretório, e a página passa a dar `500` com `ENOENT` em
  `app-build-manifest.json`/`build-manifest.json` mesmo depois de matar um dos dois (o cache
  já ficou inconsistente). Antes de subir `npm run dev`, confirme que não sobrou processo de
  sessão anterior: `ps aux | grep "next dev"` (não só `lsof -ti:3000` — se a porta já estava
  ocupada, o Next sobe sozinho numa porta seguinte tipo `3001`, e o processo antigo continua
  vivo escrevendo no mesmo `.next/` sem estar na porta que você está checando). Se acontecer,
  mate todos os processos `next dev`/`next-server` encontrados e rode `rm -rf .next` antes de
  subir de novo.
- **Páginas públicas que usam `<Suspense>` envolvendo um client component com
  `usePageableResource`/`useAsyncData`** (ex.: `/obras`, `/licitacoes`, `/avisos`) **travam pra
  sempre no fallback do Suspense** quando abertas pela ferramenta de preview (Claude Browser) —
  confirmado em 3 rotas diferentes, inclusive páginas nunca tocadas na sessão, com bundle correto
  (`NEXT_PUBLIC_USE_MOCK` compilado certo, código do serviço/mock presente) e zero erro no
  console/servidor mesmo depois de reiniciar o dev server e esperar 10s+. Páginas públicas sem
  esse padrão (ex.: `/transparencia`) carregam normal. É uma limitação da ferramenta de preview
  neste sandbox, não um bug do app — telas **admin** equivalentes (que são `'use client'` direto
  na página, sem `<Suspense>`) funcionam normalmente na mesma ferramenta. Pra validar mudança em
  view pública com esse padrão, confie na leitura do código + `tsc`/`eslint` limpos e na
  verificação do lado admin (mesmo hook, mesmo service) em vez de insistir no preview.
  **Também acontece com Server Components puros** se a rota ganhar um `loading.tsx` — Next.js
  passa a envolver a página num `<Suspense>` implícito mesmo sem nenhum client component
  fazendo fetch (confirmado em `/secretarias/[id]` depois de adicionar `[id]/loading.tsx`,
  rota que antes renderizava sem problema). Nesse caso, `curl` direto no servidor (sem passar
  pela ferramenta de preview) mostra o HTML final correto — use isso pra validar em vez do
  navegador quando a rota trava no fallback.

### Testando no navegador via ferramenta de preview (Claude Browser)

- `computer{action:"left_click", ref:...}` às vezes simplesmente não dispara o evento de clique
  em alguns botões (nenhum erro, só nenhuma request nova aparece em `read_network_requests`) —
  não é bug do app. Workaround confiável: `javascript_tool` com
  `document.querySelectorAll('button')` filtrando pelo texto e chamando `.click()` direto no
  elemento. Depois de um clique via JS, dê uma folga (`computer{action:"wait"}`, não `sleep` do
  Bash) antes de reler a página — o ciclo request→setState→render às vezes demora mais que o
  esperado num ambiente com HMR ativo.
- `computer{action:"screenshot"}` consistentemente dá timeout neste ambiente — não é confiável
  pra verificação visual. Prefira `get_page_text`, `read_page` (árvore de acessibilidade) e
  `javascript_tool` (ex.: `getBoundingClientRect()`, `scrollTop`, `innerText`) pra confirmar
  comportamento — inclusive dá pra provar coisas como "a sidebar não rola junto" de forma mais
  precisa que uma screenshot.
- `getComputedStyle()` via `javascript_tool` pode reportar um valor **desatualizado/errado pra
  um elemento específico**, mesmo depois de `!important` inline (o override mais forte que
  existe em CSS — se nem isso muda o valor lido, não é bug de CSS de verdade, é a leitura que
  tá errada). Caso real: `getComputedStyle(linkÍnicio).color` continuava reportando a cor antiga
  mesmo com `link.style.setProperty('color', ..., 'important')` confirmado no `outerHTML` e em
  `link.style.getPropertyPriority('color')` — enquanto os outros 9+ links da mesma página liam
  certo com a mesma técnica. Não vale a pena depurar mais fundo (não é algo que o app controla);
  se `getComputedStyle` der um resultado que não bate com o CSS estático (`grep` no CSS
  compilado, `.matches()` confirmando o seletor), desconfie da leitura antes de desconfiar do
  CSS.
- Diálogos nativos de `confirm()` (usados antes de excluir/ocultar) **travam a automação** — o
  clique no botão que dispara o `confirm()` nunca retorna. Pra testar esses fluxos, ou aceite
  que não dá pra automatizar esse clique específico (valide só que o handler dispara a request
  certa via outro caminho), ou limpe/reverta o dado de teste direto no backend depois.
- Sem `DELETE` em vários recursos agora (Licitação por exigência do TCE; Diário Oficial nunca
  teve), dado de teste criado durante verificação manual só sai do banco via SQL direto:
  `docker exec portal-prefeitura-postgres psql -U portal -d portal_prefeitura -c "DELETE FROM
  <tabela> WHERE id IN (...)"`. Sempre confirme via `curl` antes/depois de mexer direto no banco,
  e cuidado pra não apagar fixture de verdade (numeração baixa, tipicamente 1-4) — só limpar o
  que você mesmo criou na sessão.
