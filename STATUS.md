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

## 2.10 Acessibilidade, navegação e infraestrutura (2026-08-05) — concluído

Leva de 11 commits do mesmo dia (cronologicamente **antes** das seções 2.4–2.9, mas
documentados aqui porque ficaram de fora do STATUS.md na hora — resultado de uma sessão
em outra máquina, ver seção 4). Cobre acessibilidade, consolidação visual e alguns gaps
de navegação/formulário do hub público.

**Acessibilidade** (`5b37fe6`, `cf181a0`, `1f94b81`, `75b2602`, `31c27d3`, `a1665ad`):
- `src/components/AcessibilidadeMenu.tsx` — menu novo (contraste, tamanho de fonte,
  Libras), montado dentro de `Header.tsx`, substituiu um widget flutuante antigo.
- `src/components/VLibrasWidget.tsx` — passou por 3 iterações no mesmo dia até estabilizar:
  (1) injeção via `useEffect` (perdia o preload scanner do navegador), (2) markup
  estático renderizado no servidor (igual ao snippet oficial do gov.br) + `try/catch`
  em torno de `VLibras.Widget()`, (3) problema novo: `RootLayoutSwitch` re-renderiza a
  cada troca de rota (`usePathname()`), resetando o `<div vw>` que o plugin usa —
  tentativa de corrigir com um `VLibrasReinit.tsx` (reinvocava `window.onload()`)
  quebrava se o avatar 3D já estivesse aberto (reinstanciar `Widget()` corrompia o
  estado). **Solução final**: `VLibrasReinit.tsx` deletado, `VLibrasWidget.tsx` envolto
  em `React.memo` — o componente nunca re-renderiza com a navegação, então o DOM do
  plugin nunca é tocado. Montado uma vez em `src/layouts/PublicLayout.tsx`.
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

Usuário decidiu não adotar o UserWay (widget de acessibilidade de terceiro) — preferiu
manter e refinar o `AcessibilidadeMenu.tsx` já existente. Quatro ajustes:

- **Abre no hover** — mesmo padrão de `DropdownMenuItem.tsx` (`group-hover`/
  `group-focus-within`), mantendo o clique como reforço (fecha ao clicar fora, continua
  aberto depois que o mouse sai). O painel deixou de ser renderizado condicionalmente
  (`{aberto && ...}`) e passou a usar `invisible`/`visible` sempre montado, senão hover
  via CSS não tem como funcionar.
- **"Libras" virou link informativo** pro site oficial do projeto
  (`https://www.vlibras.gov.br/`, mesmo domínio já usado pelo script do plugin em
  `VLibrasWidget.tsx`) em vez de clicar programaticamente no botão nativo do widget —
  função `abrirLibras()` removida.
- **Item "Contraste" ativo** ganhou fundo escuro + texto branco (antes só mostrava um
  "Ativo" discreto sobre o mesmo fundo claro dos outros itens, sem indicar visualmente
  que mudava o site inteiro).
- **Tema de Alto Contraste virou escuro+amarelo** (antes era um "alto contraste claro":
  fundo branco, texto preto). `html.alto-contraste` em `globals.css` agora escurece
  `--color-neutral`/`--color-neutral-light`/`body` e clareia `--color-text-secondary`
  (cascateia pelos tokens que os componentes já usam), e força `<a>`/`<h1-3>` pra amarelo
  via seletor de tag com `!important` (precisa disso porque tag selector tem
  especificidade menor que a classe Tailwind que normalmente define a cor).
  **Limitação consciente**: não repontou `--color-primary` pra amarelo — esse token
  também define `bg-primary`, usado em botões/abas com `text-white` fixo junto (ex.
  "Aplicar" dos filtros); virar amarelo ali daria botão amarelo com texto branco, pior
  contraste que o normal. Então elementos com fundo de marca própria (botões primary,
  badges de status, abas ativas) continuam com a cor de marca original mesmo em alto
  contraste — não é uma cobertura 100%, é o equilíbrio entre melhorar de verdade sem
  reescrever cor de cada componente do site (mudança bem maior, fora de escopo aqui).

`tsc --noEmit`/`eslint` limpos. Testado via `curl`: link do VLibras presente no HTML,
página renderizando normal.

**Complemento (mesmo dia)**: `AcessibilidadeMenu.tsx` adicionado também dentro do `<ul>`
principal do menu mobile (`Header.tsx`, envolto em `lg:hidden` — só aparece abaixo de
`lg`, não duplica na barra desktop), fechando a lacuna que a varredura mobile (seção
2.12) tinha documentado como pendência consciente. Ouvidoria/SIC/Acesso admin da topbar
continuam sem equivalente mobile (fora de escopo deste pedido).

Também trocado `hover:bg-neutral-dark` (cinza claro `#cbd5e1`, achado "ruim" pelo
usuário) por `hover:bg-primary/10` nos 13 links dos dropdowns do header (`Header.tsx` —
A Prefeitura/RH/LRF/Publicações — e `SecretariasDropdownItems.tsx`), tema normal e alto
contraste. Conferido que o Alto Contraste já cobria esses dropdowns sem precisar de CSS
novo: o painel (`DropdownMenuItem.tsx`) usa a classe `bg-white` (pega pelo override
`.bg-white` já existente) e os itens são `<a>` de verdade (pegos pelo `a { color:
#ffd400 !important }` já existente) — só a cor de hover do tema normal precisava de
ajuste.

**Complemento — header/nav/footer pretos no Alto Contraste**: usuário comparou com o
Alto Contraste de outra prefeitura (bomlugar.ma.gov.br/#altocontraste) — lá o header/nav/
footer inteiro vira preto sólido com links amarelos; no nosso, esses containers ficavam
com a cor de marca original (azul), só o resto do site escurecia. Adicionado
`html.alto-contraste .bg-primary { background-color: #000 !important }` — cobre topbar,
`<nav>` e `<footer>` (todos usam a classe `bg-primary`) e também botões/abas sólidas com
`text-white` fixo (viram preto+branco, contraste melhor que o original, não pior).
Deliberadamente **não** mexe na variável `--color-primary` (só a classe `.bg-primary`
específica) — a variável também alimenta `text-primary`, usado como cor de ícone em
vários "chips" (`bg-primary/10 text-primary`) espalhados pelo site; virar preto ali
sumiria o ícone contra card escuro. Seletor de amarelo ganhou `nav [role="button"]` —
os rótulos dos dropdowns do header ("A PREFEITURA", "SECRETARIAS" etc.) são `<div
role="button">` em `DropdownMenuItem.tsx`, não `<a>` de verdade, então o seletor `a`
sozinho não os alcançava. Testado via `javascript_tool`/`getComputedStyle`: nav e footer
`rgb(0,0,0)`, `<h1>` e rótulo de dropdown `rgb(255,212,0)` — bate com a referência.

**Complemento 2 (mesmo dia)**: usuário testou num navegador de verdade (print) e pediu 2
ajustes finos: (1) hover dos itens de dropdown (header + `AcessibilidadeMenu.tsx`) tava
difícil de ver no Alto Contraste — `hover:bg-primary/5`/`/10` é uma tinta azul
translúcida quase invisível sobre o painel já escurecido; virou branco translúcido
(`rgba(255,255,255,0.15)`) só dentro de `.alto-contraste`, funciona sobre qualquer fundo
escuro em vez de brigar com a cor de marca. (2) `AcessibilidadeMenu.tsx` não fechava ao
clicar em Contraste/Aumentar/Diminuir — corrigido via `onClick={() => setAberto(false)}`
no painel (bubbling, fecha em qualquer clique dentro, item nenhum precisa fechar por
conta própria — ver complemento 3 abaixo, mesmo padrão virou consistente nos dois
menus).

**Nota de ferramenta**: durante a depuração da seção 4 (pegadinhas de sandbox),
`getComputedStyle()` via `javascript_tool` reportou um valor errado pra um `<a>`
específico mesmo com `!important` inline confirmado no DOM — nenhum problema real de
CSS, o usuário confirmou com print de navegador de verdade que a implementação
funciona certinho (nav/footer pretos, links amarelos, "Contraste: Ativo" visível).

**Complemento 3 (mesmo dia)**: usuário achou mais 2 problemas depois de testar de novo:
- **Faixa morta no hover do `AcessibilidadeMenu`** — o painel tinha `mt-2` (8px de
  margem) entre o botão e o painel; ao mover o mouse do botão pro painel, o cursor
  atravessava esse espaço vazio e perdia o `:hover`, fechando o menu no meio do
  caminho. `DropdownMenuItem.tsx` nunca teve esse problema porque o submenu já era
  `top-full` sem margem (encostado no botão). Removido o `mt-2` do
  `AcessibilidadeMenu.tsx` — mesmo comportamento agora.
- **Dropdowns do header não fechavam ao clicar** — pedido original (antes do
  complemento 2 acima) era sobre `DropdownMenuItem.tsx` (A Prefeitura/Secretarias/RH/
  LRF/Publicações), não o `AcessibilidadeMenu` — mal-entendido corrigido. Adicionado
  `onClick={() => setIsOpen(false)}` no `<ul>` do submenu (bubbling do `<a>`/`<Link>`
  filho fecha o dropdown específico que foi clicado, sem precisar que cada chamador
  feche individualmente — `Header.tsx`/`SecretariasDropdownItems.tsx` não precisaram
  de nenhuma mudança). Aproveitado pra simplificar `AcessibilidadeMenu.tsx` pro mesmo
  padrão de delegação (removidos os `onClick={() => setAberto(false)}` individuais dos
  itens Sobre/Libras/Mapa do site e das funções `aplicarFonte`/`alternarContraste` —
  redundantes agora que o painel fecha tudo de uma vez).

**Complemento 4 (mesmo dia)**: usuário achou mais um bug — alternar entre desktop e
mobile (ou vice-versa) fazia o Contraste parecer "preso": tinha que desativar e ativar
de novo pra sincronizar. Causa: `AcessibilidadeMenu.tsx` é renderizado **2 vezes** por
`Header.tsx` (topbar desktop `hidden lg:flex` + menu mobile `lg:hidden`, seção 2.12) —
cada instância tinha seu próprio `useState` de `fonte`/`altoContraste`, então ativar
numa não atualizava a outra (cada uma só lia o `localStorage` uma vez, no mount).
Corrigido tirando esse estado de dentro do componente: `Header.tsx` agora é o dono único
(`fonte`/`altoContraste` + `aplicarFonte`/`alternarContraste`, incluindo o efeito que lê
o `localStorage`), e `AcessibilidadeMenu.tsx` virou componente controlado (recebe
`altoContraste` + os 3 callbacks como props) — as duas instâncias renderizadas
refletem a mesma fonte de verdade agora, sem estado duplicado. `aberto` (dropdown
aberto/fechado) continua local em cada instância, isso é intencional.

Aproveitado o pedido do usuário ("não quero fácil acesso ao admin") pra remover o ícone
de engrenagem (`MdSettings`, `<Link href="/admin/login">`) da topbar — a rota
`/admin/login` continua existindo (não removida, só sem link visível no site público).

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

Usuário reportou erro 500 tentando subir PDF em vários módulos (13MB, mas o tamanho era
coincidência, não a causa). Investigação teve 3 pistas falsas antes da causa raiz real —
registradas aqui porque cada uma ensinou algo, mesmo não sendo o problema principal:

1. **Timeout de 10s do axios** — real, mas não a causa deste bug (era um bug diferente,
   já corrigido na seção 2.16: `FormData` agora tem 60s).
2. **Proxy do Next travando 30s em upload de 13MB** (`rewrites()` de `next.config.ts`,
   reproduzido tanto em `next dev --turbopack` quanto em `next start` de produção real —
   build limpo, testado isolado sem afetar o ambiente de dev, restaurado depois) — **isso
   é real e seria um problema em produção**, mas só aparece em arquivos grandes, e o
   usuário conseguia reproduzir o erro em qualquer tamanho. Registrado como pendência
   separada, não investigado a fundo ainda (não travava a sessão atual).
3. **`multipart/form-data;boundary=...;charset=UTF-8` sem espaços, rejeitado pelo
   Spring** — descoberto lendo o log do backend (`tail`/polling a cada 5s enquanto uma
   requisição ficava pendurada) e comparando com o que um `curl` direto no backend
   enviava (que sempre funcionou, por isso a suspeita inicial recaiu sobre o proxy do
   Next). O boundary `WebKitFormBoundary...` só existe em requisições geradas por um
   navegador de verdade — reproduzido de propósito usando o Claude Browser (Chrome via
   CDP) pra logar no admin e submeter o formulário real, confirmando que não era
   artefato de teste.

**Causa raiz real, confirmada comparando `/api/legislacao/lei` (funcionava) com
`/api/institucional/noticias` (falhava) usando a mesma técnica de teste**: 17 services
admin (`src/modules/**/*.service.ts`, 31 ocorrências) definiam manualmente
`headers: { 'Content-Type': 'multipart/form-data' }` (sem `boundary`) em chamadas do
axios com corpo `FormData`. Isso é um anti-padrão documentado do axios — só quebra em
navegador de verdade (nunca em `curl`/Node, por isso nunca foi pego antes): ao ver um
`Content-Type` já definido, o navegador completa o valor com o `boundary` que ele gerou
pra montar o corpo, mas sem espaço antes do parâmetro seguinte, produzindo
`multipart/form-data;boundary=----WebKitFormBoundaryXXXX;charset=UTF-8` — que o
`AbstractMessageConverterMethodArgumentResolver` do Spring rejeita
(`HttpMediaTypeNotSupportedException`, mapeado pro `GlobalExceptionHandler` como 500
genérico). **Correção**: remover o header manual em todos os 17 arquivos — o axios/
navegador monta o `Content-Type` inteiro sozinho, corretamente, quando você não
interfere. Script único (Python, regex) aplicou a mesma correção nos 31 pontos de uma
vez; `tsc`/`eslint` limpos depois.

**Segunda causa raiz, específica de Notícias** (só apareceu depois de corrigir a
primeira — o teste comparativo `/api/legislacao/lei` vs `/api/institucional/noticias`
com uma requisição JS manual, sem `Content-Type` nenhum, **ainda** falhava só na
Notícias): o backend, ao atender o pedido de simplificação da seção 2.17 (tirar
compatibilidade com `imagemUrl`/`imagem` legado), foi além e trocou
`POST/PUT /institucional/noticias` de multipart pra **JSON puro** (`@RequestBody
NoticiaRequestDto`, confirmado no `NoticiaController.java` e no `/v3/api-docs` real —
`content: application/json`, não mais `multipart/form-data`). O frontend ainda mandava
`dados` embrulhado num `FormData` (`montarFormDataDados`, pensado pra quando criar
precisava do campo `imagem` legado junto). Corrigido: `noticiaAdminService.criar()`/
`atualizar()` agora mandam `dados` direto como corpo JSON (`api.post(url, dados)`, sem
FormData nem header manual) — helper `montarFormDataDados` removido, não é mais usado
em lugar nenhum.

Verificado: `tsc`/`eslint` limpos; testado de ponta a ponta com o Claude Browser
autenticado como admin de verdade (`admin@prefeitura.dev`/`admin123`, credencial de dev
documentada na seção 4) — `POST /api/institucional/noticias` retornou 200 com o payload
JSON correto. Registros de teste criados durante o diagnóstico (notícias e leis) foram
excluídos via `DELETE` autenticado logo em seguida, sem deixar lixo no banco nem arquivo
órfão em `/home/pc/portal-uploads-dev`.

**Pendência registrada, não resolvida**: o proxy do Next.js (`rewrites()`) trava ~30s e
falha em uploads grandes (13MB reproduzido, 6MB passa), tanto em dev quanto em build de
produção real — vale investigar antes de ir pra produção de verdade (opções: configurar
timeout do proxy, ou apontar upload de arquivo direto pro backend, sem passar pelo
`rewrites()`, exigindo CORS liberado lá).

## 2.19 Regressão do próprio fix da seção 2.18 + timeout do proxy — INVESTIGAÇÃO EM ABERTO (2026-08-07)

**Regressão real, corrigida**: ao remover os headers manuais na seção 2.18, sobrou um
efeito colateral — `src/services/api.ts` define `Content-Type: application/json` como
default da instância inteira do axios (`axios.create({ headers: {...} })`). O axios só
substitui automaticamente um `Content-Type` que **ele próprio** definiu por chamada
quando detecta corpo `FormData`; um valor herdado do default da instância não é limpo
sozinho. Depois de tirar o override manual por chamada, toda requisição com `FormData`
passou a sair com `Content-Type: application/json` (herdado do default) — pior que o bug
original, rejeitado pelo backend com `Content-Type 'application/json' is not supported`.
**Corrigido**: o interceptor de request em `api.ts` agora chama
`config.headers.delete("Content-Type")` quando `config.data instanceof FormData`,
garantindo que nenhum `Content-Type` seja enviado nesses casos — só o navegador define.
Testado de ponta a ponta (criar notícia via JSON + subir imagem via multipart, os dois
contra o backend real): funcionou. Também apareceram durante a sessão 6 registros de
teste ("gnsrmn", ids 11-16 em Notícias) que não foram criados por mim — provavelmente
tentativas manuais do próprio usuário durante a investigação; não foram apagados,
ficaram para o usuário decidir.

**Timeout de 30s do proxy — investigação REAL mas INCOMPLETA, não confiar cegamente no
que está escrito abaixo em sessões futuras**: confirmado via código-fonte do Next.js
(`node_modules/next/dist/server/lib/router-utils/proxy-request.js:33` —
`proxyTimeout: proxyTimeout || 30000`) que o proxy de `rewrites()` tem um timeout
hardcoded de exatamente 30000ms, configurável só via uma flag `experimental.proxyTimeout`
em `next.config.ts` (existe desde a PR vercel/next.js#40289, ainda não promovida pra
fora do namespace `experimental` mesmo anos depois — aplicada aqui, `300000`, mas **sem
confirmação de que realmente resolve**, porque o teste de tempo real foi interrompido
pelo usuário antes de rodar).

Isso NÃO explica por si só por que 13MB demora tanto — usuário questionou corretamente:
"não deveria ser rápido subir um arquivo? por que 30s? não faz sentido" — e tem razão,
30s pra 13MB é ~0.4MB/s, mais lento que qualquer conexão razoável, quando o mesmo
arquivo direto no backend (sem passar pelo proxy) respondia em 0.13s (seção 2.16). Ou
seja: **aumentar o timeout só faz o proxy esperar mais, não resolve a causa real da
lentidão** — se o gargalo genuíno for do lado do proxy do Next (buffer ineficiente do
corpo multipart antes de repassar, por exemplo), a requisição pode continuar demorando
minutos de verdade em vez de só falhar em 30s, o que seria uma UX ruim mesmo
"funcionando". Última hipótese do usuário antes de pausar a sessão: **pode ser algo no
backend**, não confirmado nem descartado.

**`experimental.proxyTimeout: 300000` foi revertido (2026-08-07, sessão seguinte)** —
usuário apontou que só fazer o proxy esperar mais não é a causa do erro (concorda com o
próprio parágrafo acima) e pediu pra tirar. `next.config.ts` voltou a não ter a chave
`experimental`. A investigação da causa real da lentidão continua em aberto:
- Não foi determinado se é: (a) do proxy do Next em si (buffer/streaming do corpo
  multipart), (b) do backend levando mais tempo do que os 0.13s medidos anteriormente
  quando passa pelo fluxo completo (autenticação, gravação em disco em caminho diferente,
  etc. — os testes da seção 2.16 mediram o backend isolado, não necessariamente em
  condições idênticas), ou (c) outra coisa ainda não cogitada.
- **Próximo passo, quando retomar**: medir tempo real de upload de 13MB direto no
  backend vs. via proxy do Next (`time curl ...`) nas mesmas condições, pra isolar onde
  está o gargalo antes de aplicar qualquer configuração — aumentar timeout sem saber a
  causa só mascara o sintoma.

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
