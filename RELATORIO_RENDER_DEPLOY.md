# RELATORIO_RENDER_DEPLOY.md — Navio Barber 2.0

**Data:** 2026-11-12

## 1. O que foi encontrado
- **Estado informado:** API `navio-barber-api` publicada/LIVE em `https://navio-barber-api.onrender.com`; frontend `apps/web` ainda não publicado (tela New Web Service / criação manual prevista). Banco Supabase existente.
- **Configuração repo:** monorepo npm workspaces + Turbo; Root Directory deve ser **vazio (raiz)** para builds.
- **API (antes):** `build`=`tsc --noEmit`, `start`=`node src/server.ts` — estratégia não robusta para produção (dependia de runtime TS). Health endpoints `/health`, `/healthz` implementados.
- **Web:** Next.js 15; proxy `/api/trpc` para API; auth Better Auth em rotas Next (`/api/auth/[...]`). Build de produção Next validado localmente.

## 2. O que foi corrigido
- **API produção:** `apps/api/tsconfig.build.json` adicionado; build emite JS em `apps/api/dist/` via `tsc -p tsconfig.build.json --noCheck` (tipagem garantida por `typecheck` separado); `start` = `node dist/server.js`; fallback `start:ts` mantido para compatibilidade controlada. `dist` ignorado pelo Git.
- **Documentação:** `GUIA_DEPLOY_NAVIO_BARBER.md` atualizado com comandos Render corretos para API e Web.

## 3. Configuração recomendada — Render

### Serviço: `navio-barber-api` (existente — NÃO modificar sem necessidade)
| Item | Valor |
|---|---|
| Root Directory | *(vazio / raiz do repo)* |
| Build Command | `npm ci && npx prisma generate && npx turbo run build --filter=@navio-barber/api...` |
| Start Command | `npm run start --workspace=@navio-barber/api` (ou `node apps/api/dist/server.js`) |
| Health Check Path | `/health` (ou `/healthz`) |
| Runtime | Node 20+ (recomendado alinhar ao `engines`/CI), HTTPS gerenciado pelo Render |

### Serviço: `navio-barber-web` (a criar — opção 2, manual)
| Item | Valor |
|---|---|
| Root Directory | *(vazio / raiz do repo)* |
| Build Command | `npm ci && npx prisma generate && npx turbo run build --filter=@navio-barber/web...` |
| Start Command | `npm run start --workspace=@navio-barber/web -- -H 0.0.0.0 -p $PORT` |
| Instância | Web Service Node (SSR/Next server) |

## 4. Variáveis de ambiente (nomes exatos) — preencher no Render
**Web (`navio-barber-web`):**
- Obrigatórias: `NODE_ENV=production`, `DATABASE_URL` (Supabase existente), `BETTER_AUTH_SECRET` (>=32 chars, forte), `BETTER_AUTH_URL` (`https://<url-publica-definitiva-do-web>`), `NEXT_PUBLIC_APP_URL` (igual), `API_URL=https://navio-barber-api.onrender.com`.
- Opcionais: `NEXT_PUBLIC_API_URL` (fallback legado do proxy), `REDIS_URL`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, legados `NEXTAUTH_*` (avaliar). `PORT` injetado pelo Render.
- **Atenção:** `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL` dependem do hostname final; pode exigir set após criação + redeploy.

**API:** manter variáveis existentes; não substituir sem verificar impacto. Validar `PORT`/`HOST` (`0.0.0.0`), `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`/origens conforme arquitetura.

## 5. Comunicação frontend/API, CORS, HTTPS, Supabase
- Browser → Web (HTTPS) → `/api/trpc` (same-origin) → proxy server-side → `API_URL` (`https://navio-barber-api.onrender.com`) → tRPC API. Cookies/sessão Better Auth no domínio do web.
- CORS do proxy controlado por `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL`. API standalone não expõe CORS amplo; acesso primário via proxy.
- `DATABASE_URL` com SSL para Supabase. **Nenhuma migration/db push/reset executada.**

## 6. Deploy e validação realizados
- **Deploy executado por mim:** **não** (sem acesso/credenciais/autorização Render). **Serviços duplicados:** não criados.
- **Validações locais:** build web OK, build API (dist) OK, `GET /health` 200 contra `dist/server.js` e contra `src/server.ts`, typecheck/lint/test/build monorepo OK.
- **Logs/health em produção:** não coletados (sem acesso). Após deploy manual, verificar logs Render, `GET https://navio-barber-api.onrender.com/health` e UI/login/tRPC no web.

## 7. Bloqueios / ações humanas
- Criar/configurar `navio-barber-web` no Render com comandos/envs acima (acesso ao dashboard/conta).
- Confirmar URL pública definitiva e ajustar `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL` + redeploy se necessário.
- Fornecer/inserir segredos no Render de forma segura (sem chat). Não alterar `navio-barber-api` nem Supabase sem validação de impacto.
- Se o serviço API existente ainda usa start antigo, atualizar para `dist` start/build é recomendado em janela controlada (não realizado automaticamente).

## 8. Arquivos modificados (deploy prep)
- `apps/api/package.json`, `apps/api/tsconfig.build.json`, `GUIA_DEPLOY_NAVIO_BARBER.md` (e ajustes web/proxy já publicados em `ceff324`).
