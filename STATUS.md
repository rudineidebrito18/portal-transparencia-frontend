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

O backend rodou uma auditoria grande e adicionou paginação/filtro em ~12 módulos que antes
devolviam `List` inteira, além de mudanças pontuais em Licitações e Diário Oficial (changelog
completo recebido do agente do backend). Cada `GET` afetado passou de array puro (`[...]`) pra
`Page<T>` (`{content, totalElements, totalPages, number, size, ...}`) — qualquer tela que lia a
resposta como array quebrava (`.length`/`.map` num objeto não bate, geralmente sem erro visível:
a tela só ficava sem tabela nem mensagem de vazio).

**Tudo corrigido e testado** (dois commits, ver `git log`): e-SIC Formulários, Fornecedor,
Unidade, Convênio (admin), Obra Pública (admin + público), Aditivo de Contrato (admin +
público), Concurso (admin + público), Usuários (admin), Folha de Pagamento (aba "Por mês",
admin + público), Relatório de Gestão Fiscal e Relatório de Execução Orçamentária (público) — ver
observações de cada um na tabela de módulos acima. Módulos com filtro real no backend ganharam UI
de filtro + `usePageableResource`; sub-listagens naturalmente pequenas sem `/filtro` dedicado
(Aditivo por contrato, Folha por mês, os 4 endpoints de `gestao-fiscal`) só desembrulham
`.content` pedindo uma página grande (`size: 200`–`500`), sem UI de paginação nova.

Também implementados os dois endpoints novos do Diário Oficial (feature nova, não era breaking
change): "Excluir da fila" (`DELETE /edicoes/publicacoes/{id}`) e "Excluir edição publicada"
(`DELETE /edicoes/{numero}`), ambos admin-only, na tela de detalhe da solicitação — ver a
observação de "Diário Oficial — Publicações" na tabela de módulos.

**Bug crítico encontrado e corrigido no meio do caminho**: `src/modules/auth/auth.service.ts`
(`detectarPapeisEId`) descobre se quem logou é admin chamando `usuariosService.listar()` e
testando se a chamada teve sucesso (só admin pode listar usuários) — e fazia `.find(...)` direto
no retorno esperando um array. Como `GET /api/admin/users` também virou `Page<T>`, `.find` falhava
(`Page` não tem `.find`), a exceção caía no `catch` e **todo login de admin era silenciosamente
rebaixado pra permissão de Gerente** (perdia botões de editar/excluir em qualquer grupo
admin-only, tela `/admin` mostrava "Gerente" pro usuário admin). Corrigido pra ler `pagina.content`
com `size: 500`. Se em algum teste futuro os botões de admin sumirem sem motivo aparente, checar
esse arquivo primeiro.

**Confirmado que NÃO precisava de ação**: `GET /api/licitacoes` (bare, sem filtro) foi removido
pelo backend, mas nenhum arquivo do frontend chamava esse path — tanto o service público quanto o
admin já usavam `GET /licitacoes/buscar` (`Page<LicitacaoResumo>` + `usePageableResource`) desde
antes desta rodada.

Ver também a pegadinha de sandbox sobre páginas públicas com `<Suspense>` travando na ferramenta
de preview (seção 4) — isso limitou a verificação visual do lado público de Obras/Concursos/
Relatórios de Gestão Fiscal nesta sessão; a correção foi validada por leitura de código +
`tsc`/`eslint` limpos + `curl` direto no backend confirmando o formato da resposta + teste do
lado admin (mesmo hook, mesmo padrão de service) sempre que existia um equivalente admin.

Nenhuma pendência conhecida ficou aberta desta rodada.

## 2.2 Filtros públicos + bug de Secretarias (2026-07-24) — concluído/atualizado

Continuação do dia seguinte à rodada de paginação + redesign de Secretarias. Duas
pendências deixadas em aberto no fim daquela sessão, ambas fechadas nesta:

**1. Filtro/busca nas telas públicas que não tinham nenhum** (`/contratos`, `/obras`,
`/concursos`, `/avisos`, `/noticias`) — levantamento (2 agentes em paralelo, backend real
via `/v3/api-docs` + leitura de controller) mostrou que só Obras e Concursos já tinham
suporte a filtro no backend; Contratos e Avisos/Notícias não têm parâmetro de filtro
nenhum além de paginação (e `ativo`, no caso de Avisos/Notícias).
- **Obras e Concursos**: implementados de verdade — `ObraFiltro.tsx` (Número, Status, Tipo,
  Unidade, Fornecedor, "Só paralisadas", substituindo as abas antigas) e
  `ConcursoFiltro.tsx` (Número, Ano, Descrição, Abertura início/fim), ambos no padrão
  `FiltroCard`. Precisou criar `src/modules/fornecedores/` (novo módulo público mínimo,
  `fornecedor.service.ts`) porque só existia o service admin de Fornecedor — o GET já é
  `permitAll()` no backend (`SecurityConfiguration.java`), confirmado via `curl` sem token.
- **Contratos e Avisos/Notícias**: sem suporte no backend — não construí UI de filtro que
  finge funcionar. Pedido de backend documentado em
  `prompt-backend-filtros-contratos-avisos.md` (scratchpad da sessão, pra relay ao time de
  backend): generalizar o filtro de Contrato (hoje só escopado por `licitacaoId`) pra
  listagem global + trocar datas `equals` por intervalo; adicionar `titulo`+intervalo de
  data em Avisos/Notícias (controllers idênticos, um DTO serve os dois). Nota à parte
  incluída no pedido: `StatusLicitacao` real do backend tem mais valores do que o mapa de
  exibição hardcoded do frontend (`src/modules/contratos/status.ts`) — rótulo errado pra
  parte dos contratos, não bloqueante.

**2. Bug relatado: filtro de `/secretarias` "não está funcionando"** — investigado com os
dois servidores no ar (estavam ambos fora do ar no início desta sessão, sintoma de
"nada funciona" bate com isso). Backend confirmado filtrando certo via `curl` direto e via
`fetch()` no console do navegador pelo mesmo proxy `/api/*` que o app usa (`nome=Educa`
devolve só "Secretaria de Educação"). Código revisado por leitura
(`SecretariaFiltro.tsx`/`SecretariasListView.tsx`/`useSecretarias.ts`/
`secretariasService.listar`) sem nenhum bug encontrado. **Conclusão**: mais provável que o
teste original tenha coincidido com os servidores caídos, não um bug de código — considerar
resolvido a menos que o usuário confirme que ainda está quebrado num teste novo.

## 2.3 Auditoria de filtro em todo o hub `/transparencia` (2026-07-24) — concluído

Usuário pediu, além do item 1 da seção 2.2, filtro em **todos** os itens do hub
`/transparencia` onde for possível — não só Gestão Fiscal. Fiz o levantamento completo
(1 agente Explore cobrindo as ~50 combinações rota/aba alcançáveis a partir de
`src/modules/transparencia/data/secoes.ts`) e cruzei os poucos casos sem filtro contra o
backend real (`/v3/api-docs`). Resultado: quase tudo já estava filtrado (Licitações,
Diárias, Servidores, Emendas, Obras, Concursos, Tabela de Valores, e todos os módulos de
"documento genérico" — Convênios, Educação, Saúde, Recursos Humanos, Planejamento,
Prestação de Contas, Legislação, Fiscal de Contrato, Renúncia Fiscal). As únicas lacunas
reais:
- **4 abas de Gestão Fiscal** (Execução Orçamentária, RGF, Empresas em Dívida Ativa,
  Empresas Inidôneas/Suspensas) — backend tinha `/filtro` público pronto, só faltava a UI.
  Implementado nesta rodada (ver item novo na seção 2, bespoke module list).
- **`/contratos` e `/avisos`/`/noticias`** — sem suporte no backend, já cobertos pelo
  pedido de backend da seção 2.2 (`prompt-backend-filtros-contratos-avisos.md`).
- **`/cargos`** — `GET /recursos-humanos/cargos` não tem parâmetro nenhum, nem paginação
  (lacuna nova, descoberta nesta auditoria) — adicionado como 3ª seção no mesmo arquivo de
  pedido de backend.
- **`/folha-pagamento`** — só filtra por `mes`/`ano` no backend; a tela já expunha esse
  seletor mas fora do padrão visual — `FolhaPagamentoMesView.tsx` migrado pro `FiltroCard`
  (mês/ano continuam aplicando na hora, sem botão Aplicar — não é um filtro opcional tipo
  busca, é sempre um período selecionado; ganhou botão "Voltar pro mês atual" em vez de um
  Limpar tradicional). Não virou pedido de backend por ser baixo valor (não bloqueia nada,
  já usa a única dimensão de filtro que existe).
- `/esic`, `/ouvidoria` são páginas de informação (objeto único), filtro não se aplica;
  `/diarias-legislacao`, `/estrutura-organizacional`, `/organograma`, `/faq`, `/lgpd` são
  estáticas, sem backend.

Não fica pendência de "auditar o resto" pra próxima sessão — já foi feito.

**Complemento — header "N encontrados + Ordenar" (mesmo dia)**: `usePageableResource`
sempre devolveu `totalElements`/`ordenacao`/`setOrdenacao`, mas nem todo `*ListView.tsx`
renderizava esse header (só `DocumentoGenericoListPanel.tsx`, Diárias, Licitações,
Servidores, Tabela de Valores e Contratos já tinham). Adicionado nos que faltavam:
Concursos, Obras, os 4 itens de Gestão Fiscal, Avisos/Notícias (precisou passar
`totalElements`/`ordenacao`/`setOrdenacao` como prop nova em
`ConteudoInstitucionalListView.tsx`, compartilhado pelos dois) e o `<select>` de
ordenação em Emendas Parlamentares (que já tinha a contagem, só faltava o dropdown).
Sem mudança de tipo/service/backend — é só UI consumindo dado que o hook já calculava.

**Bug real encontrado pelo usuário nessa mesma rodada**: `obra.mock.ts` e
`concurso.mock.ts` (migrados pra `usePageableResource` mais cedo hoje) filtravam e
paginavam mas **ignoravam completamente o parâmetro `sort`** — o `<select>` de Ordenar
não fazia nada em dev (`NEXT_PUBLIC_USE_MOCK=true`), só contra o backend real. O
`gestaoFiscal.mock.ts` novo copiou esse mesmo padrão quebrado. Existe um helper
compartilhado pra isso desde antes (`ordenar()`/`paginar()` em
`src/modules/shared/mocks/mockUtils.ts`, já usado certo em `institucional.mock.ts` e
`emendaParlamentar.mock.ts`) — os 3 mocks quebrados foram migrados pra usá-lo. Vale
conferir qualquer mock novo/futuro que pagine em memória usa esse helper em vez de
reimplementar paginação na mão sem ordenar.

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

## 2.10 Diário Oficial: abas Legislação/Edições Não Eletrônicas/Quem Somos/Expediente/Ajuda (2026-08-05)

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
