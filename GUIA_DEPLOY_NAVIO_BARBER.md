# GUIA DE DEPLOY E HOMOLOGAÃ‡ÃƒO â€” NAVIO BARBER 2.0

**Data:** 2026-11-08  
**Escopo:** preparaÃ§Ã£o tÃ©cnica para **homologaÃ§Ã£o** (staging). **NÃ£o** autoriza deploy em produÃ§Ã£o sem decisÃ£o/aprovaÃ§Ã£o do proprietÃ¡rio.

---

## 1. Arquitetura de ImplantaÃ§Ã£o (recomendada)

| Componente | FunÃ§Ã£o | ObservaÃ§Ãµes |
|---|---|---|
| **Frontend (Next.js 15)** | UI + rotas `/api/auth/*` (Better Auth) + proxy `/api/trpc/*` | Requer runtime Node compatÃ­vel com Next 15. Pode ser hospedado em plataforma que suporte Next (server/SSR) ou container Node. |
| **API tRPC (standalone)** | `apps/api` â€” `createHTTPServer` + tRPC | Processo Node persistente; expor via HTTPS (reverse proxy/LB). Endpoint de saÃºde: `GET /health` ou `/healthz`. |
| **PostgreSQL (Supabase)** | Banco principal (Prisma) | Usar connection string de pooler/direta conforme ambiente; `sslmode=require`. |
| **Redis** | Opcional (jobs: no-show/notificaÃ§Ãµes) | MVP pode iniciar sem Redis se jobs nÃ£o forem crÃ­ticos no staging. |

**Fluxo:** Browser â†’ Frontend (HTTPS) â†’ `/api/trpc/*` proxy server-side â†’ API (rede privada ou HTTPS) â†’ Supabase. Auth Ã© tratada no frontend via Better Auth (`BETTER_AUTH_URL` = origem pÃºblica).

> O repositÃ³rio **nÃ£o presume** provedor (Vercel/Railway/Render/Fly/etc.). Escolha conforme capacidade de rodar **dois serviÃ§os** (Next + API Node) e polÃ­ticas de rede/segredos.

---

## 2. ServiÃ§os NecessÃ¡rios (mÃ­nimo homologaÃ§Ã£o)

1. **Compute para Web** (Next.js) â€” 1 instÃ¢ncia.
2. **Compute para API** (Node) â€” 1 instÃ¢ncia; health check em `/health`.
3. **Supabase (PostgreSQL)** â€” projeto jÃ¡ existente ou staging dedicado.
4. **(Opcional)** Redis gerenciado se habilitar workers/jobs.

---

## 3. VariÃ¡veis de Ambiente

Use `.env.example` como base. **Nunca** commitar segredos.

### ObrigatÃ³rias (nÃºcleo)
| VariÃ¡vel | Onde | DescriÃ§Ã£o |
|---|---|---|
| `DATABASE_URL` | API, Web (server-side conforme uso), Prisma | Postgres com SSL |
| `BETTER_AUTH_SECRET` | API/Web (pacote auth) | **ObrigatÃ³rio e >= 32 caracteres** (validaÃ§Ã£o em `packages/auth`). Gerar com alta entropia: `openssl rand -base64 32`. Segredos curtos/baixa entropia fazem o processo falhar no startup. |
| `BETTER_AUTH_URL` | Web/API | **ObrigatÃ³rio na prÃ¡tica para produÃ§Ã£o (origem pÃºblica HTTPS do frontend).** `packages/auth` define `baseURL: process.env.BETTER_AUTH_URL!` (nÃ£o hÃ¡ fallback/validaÃ§Ã£o explÃ­cita como no secret). Em produÃ§Ã£o, **ausÃªncia** pode causar geraÃ§Ã£o incorreta de URLs/callbacks/cookies/origens pelo Better Auth. Configurar como `https://<dominio-publico-do-frontend>`. |
| `NODE_ENV` | Todos | `production` em homologaÃ§Ã£o/prod (habilita cookies `Secure` no Better Auth) |

### Recomendadas (deploy)
| VariÃ¡vel | Onde | DescriÃ§Ã£o |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Web | Mesma origem pÃºblica HTTPS do frontend (usada no proxy tRPC e deve coincidir com `BETTER_AUTH_URL`) |
| `API_URL` | Web (server) | URL da API tRPC alcanÃ§Ã¡vel pelo **servidor** Next.js para o proxy `/api/trpc/*` (ex.: `https://navio-barber-api.onrender.com`). **Preferencial**. NÃ£o Ã© lida pelo browser (o cliente usa `/api/trpc`). |
| `NEXT_PUBLIC_API_URL` | Web | Fallback legado do proxy server-side; manter por compatibilidade se jÃ¡ configurado. Evite usÃ¡-la para chamadas diretas do browser. |
| `PORT` | API | Porta do processo (default 3001; Render injeta automaticamente) |
| `HOST` | API | Bind (default `0.0.0.0` em container) |

### Opcionais
`REDIS_URL`, `FIREBASE_*` (push), `NEXTAUTH_*` (legado â€” avaliar remoÃ§Ã£o).

### ValidaÃ§Ã£o no startup
- `packages/auth/src/index.ts` **falha** se `BETTER_AUTH_SECRET` ausente/curto.
- Prisma falha sem `DATABASE_URL` vÃ¡lida.
- Em homologaÃ§Ã£o, validar manualmente que `BETTER_AUTH_URL` e `NEXT_PUBLIC_APP_URL` usam **HTTPS** e domÃ­nio correto.

---

## 4. ConfiguraÃ§Ã£o de DomÃ­nios e HTTPS

1. **Frontend:** `https://app-staging.<domÃ­nio>` (exemplo). Certificado TLS gerenciado pelo provedor/LB.
2. **API:** `https://api-staging.<domÃ­nio>` ou rede privada acessÃ­vel apenas pelo frontend. Se pÃºblica, proteger com TLS e restringir origem via rede/firewall quando possÃ­vel (tRPC hoje exposto sem CORS no standalone; o acesso primÃ¡rio do browser Ã© via **proxy** no Next).
3. **Better Auth:** `BETTER_AUTH_URL` **deve** ser a origem HTTPS do frontend; cookies `Secure` sÃ£o habilitados quando `NODE_ENV=production` (`packages/auth`).
4. **CORS do proxy:** `apps/web/src/app/api/trpc/[...path]/route.ts` usa `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL` (nÃ£o hardcode localhost em deploy correto).

---

## 5. InicializaÃ§Ã£o (ordem sugerida)

1. **Banco:** confirmar migrations aplicadas no ambiente alvo (**nÃ£o** executar migrations destrutivas sem autorizaÃ§Ã£o). `prisma migrate deploy` apenas se polÃ­tica aprovada.
2. **API:** `npm ci` (ou install conforme polÃ­tica), `npm run db:generate` se necessÃ¡rio, iniciar `node apps/api/src/server.ts` (ou script equivalente) com envs de produÃ§Ã£o. Verificar `GET /health` â†’ `{"ok":true,...}`.
3. **Web:** `npm run build` (raiz turbo) e `next start` em `apps/web` **ou** pipeline equivalente do provedor, com `NEXT_PUBLIC_API_URL` apontando para a API.
4. **Smoke test:** login, dashboard por role, navegaÃ§Ã£o principal, logout.

### Scripts existentes
- Raiz: `npm run dev|build|lint|typecheck|test|db:*` (ver `package.json`).
- API (`apps/api`): `dev` = `node src/server.ts`; `build` = `tsc -p tsconfig.build.json --noCheck` (emite JS em `dist/` para produção/Render; tipos em `typecheck`); `start` = `node dist/server.js`; `start:ts` = `node src/server.ts` (fallback controlado, não usar como start definitivo em produção); `typecheck` = `tsc --noEmit`.
- Web (`apps/web`): `build` = `next build`; `start` = `next start` (Render: `npm run start --workspace=@navio-barber/web -- -H 0.0.0.0 -p $PORT`).

**Render (Root Directory vazio/raiz):**
- **API (`navio-barber-api`):** Build `npm ci && npx prisma generate && npx turbo run build --filter=@navio-barber/api...` · Start `npm run start --workspace=@navio-barber/api` · Health `/health`.
- **Web (`navio-barber-web`):** Build `npm ci && npx prisma generate && npx turbo run build --filter=@navio-barber/web...` · Start `npm run start --workspace=@navio-barber/web -- -H 0.0.0.0 -p $PORT`.
- **Não usar `npm run dev` em produção.**

---

## 6. VerificaÃ§Ã£o de Funcionamento (checklist)

- [ ] `GET https://<api>/health` retorna 200.
- [ ] `https://<web>/login` carrega; sign-in com usuÃ¡rio de teste (ambiente staging).
- [ ] Dashboard ADMIN mostra mÃ©tricas/receita; BARBER sem receita e sem rotas admin.
- [ ] Chamadas tRPC via `/api/trpc/*` funcionam (sem 404/401 indevidos).
- [ ] Logout encerra sessÃ£o.
- [ ] `npm run build`, `lint`, `typecheck`, `test` verdes no commit de release.

---

## 7. Logs e Monitoramento (mÃ­nimo)

- Capturar stdout/stderr de **Web** e **API** no provedor.
- Alertar em falhas de health check `/health`.
- Registrar erros de auth (Better Auth) e 5xx do proxy/tRPC.
- (Futuro) Sentry/PostHog conforme roadmap do README.

---

## 8. Procedimento de Rollback

1. **AplicaÃ§Ã£o:** reverter para imagem/tag/commit anterior (mecanismo do provedor) e reiniciar Web/API.
2. **Banco:** **nÃ£o** reverter migrations automaticamente. Se uma migration causou incidente, seguir runbook aprovado pelo DBA/proprietÃ¡rio (backup/restore point-in-time no Supabase).
3. **Config:** manter versÃµes anteriores de variÃ¡veis de ambiente no cofre de segredos do provedor para restauraÃ§Ã£o rÃ¡pida.
4. **ValidaÃ§Ã£o pÃ³s-rollback:** smoke test (login, RBAC, tRPC).

---

## 9. PendÃªncias que Dependem do ProprietÃ¡rio/DecisÃ£o Externa

| PendÃªncia | Motivo |
|---|---|
| Escolha do provedor de hospedagem (Web + API) | NÃ£o presumido pelo repositÃ³rio |
| DomÃ­nios e certificados TLS | Infra/conta do proprietÃ¡rio |
| Segredos de produÃ§Ã£o (BETTER_AUTH_SECRET, DATABASE_URL staging/prod) | NÃ£o inventados; devem ser gerados/configurados com seguranÃ§a |
| ExecuÃ§Ã£o de `prisma migrate deploy` em staging/prod | Requer autorizaÃ§Ã£o/polÃ­tica de mudanÃ§a |
| `SUPER_ADMIN` no enum Prisma | Requer migration autorizada |
| Redis/Firebase/E-mail/Pagamentos | Opcionais conforme escopo de lanÃ§amento |
| Ajuste fino de cookies cross-subdomain (se web/api em domÃ­nios diferentes) | Depende da topologia final; pode exigir config adicional do Better Auth |

---

## 10. Resumo Executivo

O projeto estÃ¡ **tecnicamente validado** para **homologaÃ§Ã£o**: builds, lint, typecheck, 177 testes unitÃ¡rios e 17 E2E verdes. Para subir em staging faltam **decisÃµes de infraestrutura** (provedor, domÃ­nios, TLS, segredos) e a aplicaÃ§Ã£o das variÃ¡veis de ambiente descritas acima. O cÃ³digo jÃ¡ suporta **CORS/origem configurÃ¡vel** no proxy tRPC e **cookies `Secure` em produÃ§Ã£o** via Better Auth.

**NÃ£o realizar deploy em produÃ§Ã£o sem autorizaÃ§Ã£o explÃ­cita.**
