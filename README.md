Frontend (Next.js 15, App Router) do Portal da Transparência. Consome a API do backend
(`portal-transparencia-pref`, Spring Boot) através de um proxy interno server-side — o browser
nunca fala direto com o backend.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

Definidas em `.env.local` (não versionado) pra desenvolvimento local, e no painel do provedor de
hospedagem (hoje: Netlify → Site settings → Environment variables) pra produção.

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base do backend (ex.: `https://api.dominio.com.br`). Usada pelo Route Handler proxy (`src/app/api/[...path]/route.ts`, `src/app/users/[...path]/route.ts`) pra saber pra onde repassar as chamadas — apesar do prefixo `NEXT_PUBLIC_`, só é lida no servidor nesses arquivos. |
| `INTERNAL_GATEWAY_KEY` | Segredo compartilhado com o backend. **Sem prefixo `NEXT_PUBLIC_` de propósito** — só o proxy (server-side) pode ver esse valor, nunca o browser. Precisa ser **idêntico** ao valor de `app.internal-gateway.key` (env var `INTERNAL_GATEWAY_KEY` no perfil de produção do backend) — ver `PLANO-SEGURANCA-ARQUITETURA.md`, Fase 3, no repositório do backend. Sem isso (ou com valores diferentes dos dois lados), todo `/api/**` do backend responde 401/403. |

## Deploy

Hospedado na **Netlify**, com deploy automático a cada push na branch `main` (repositório já
conectado). Não existe `netlify.toml` — a Netlify detecta o projeto Next.js automaticamente
(build command, publish dir, runtime Node pra SSR/ISR/Route Handlers/Server Actions).

**Antes do primeiro deploy real** (quando o backend for publicado numa VPS): atualizar
`NEXT_PUBLIC_API_URL` no painel da Netlify pra URL real (hoje está com um valor de exemplo, só
pra não quebrar o build) e configurar `INTERNAL_GATEWAY_KEY` (ainda não existe lá) com o mesmo
valor gerado no backend. Até lá, qualquer push pra `main` publica o site com as páginas que
dependem do backend fora do ar (erro ao buscar dados), já que o proxy não tem pra onde apontar de
verdade.

Armazenamento de mídia/arquivos usa Cloudflare R2, mas isso é resolvido inteiramente pelo backend
(`FileStorageService`/`R2FileStorageServiceImpl`) — o frontend nunca acessa R2 diretamente, só
consome URLs/streams através do proxy interno.
