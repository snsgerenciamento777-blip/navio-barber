# GUIA DE DEPLOY E HOMOLOGAÇÃO — NAVIO BARBER 2.0

**Data:** 2026-11-08  
**Escopo:** preparação técnica para **homologação** (staging). **Não** autoriza deploy em produção sem decisão/aprovação do proprietário.

---

## 1. Arquitetura de Implantação (recomendada)

| Componente | Função | Observações |
|---|---|---|
| **Frontend (Next.js 15)** | UI + rotas `/api/auth/*` (Better Auth) + proxy `/api/trpc/*` | Requer runtime Node compatível com Next 15. Pode ser hospedado em plataforma que suporte Next (server/SSR) ou container Node. |
| **API tRPC (standalone)** | `apps/api` — `createHTTPServer` + tRPC | Processo Node persistente; expor via HTTPS (reverse proxy/LB). Endpoint de saúde: `GET /health` ou `/healthz`. |
| **PostgreSQL (Supabase)** | Banco principal (Prisma) | Usar connection string de pooler/direta conforme ambiente; `sslmode=require`. |
| **Redis** | Opcional (jobs: no-show/notificações) | MVP pode iniciar sem Redis se jobs não forem críticos no staging. |

**Fluxo:** Browser → Frontend (HTTPS) → `/api/trpc/*` proxy server-side → API (rede privada ou HTTPS) → Supabase. Auth é tratada no frontend via Better Auth (`BETTER_AUTH_URL` = origem pública).

> O repositório **não presume** provedor (Vercel/Railway/Render/Fly/etc.). Escolha conforme capacidade de rodar **dois serviços** (Next + API Node) e políticas de rede/segredos.

---

## 2. Serviços Necessários (mínimo homologação)

1. **Compute para Web** (Next.js) — 1 instância.
2. **Compute para API** (Node) — 1 instância; health check em `/health`.
3. **Supabase (PostgreSQL)** — projeto já existente ou staging dedicado.
4. **(Opcional)** Redis gerenciado se habilitar workers/jobs.

---

## 3. Variáveis de Ambiente

Use `.env.example` como base. **Nunca** commitar segredos.

### Obrigatórias (núcleo)
| Variável | Onde | Descrição |
|---|---|---|
| `DATABASE_URL` | API, Web (server-side conforme uso), Prisma | Postgres com SSL |
| `BETTER_AUTH_SECRET` | API/Web (pacote auth) | ≥ 32 chars; `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Web/API | **Origem pública** do frontend (ex.: `https://staging.seudominio.com`) |
| `NODE_ENV` | Todos | `production` em homologação/prod |

### Recomendadas (deploy)
| Variável | Onde | Descrição |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Web | Mesma origem pública (CORS do proxy tRPC) |
| `NEXT_PUBLIC_API_URL` | Web | URL interna/pública da API alcançável pelo **servidor** Next (ex.: `https://api-staging.seudominio.com` ou URL privada) |
| `API_URL` | Web (server) | Alternativa a `NEXT_PUBLIC_API_URL` |
| `PORT` | API | Porta do processo (default 3001) |
| `HOST` | API | Bind (default `0.0.0.0` em container) |

### Opcionais
`REDIS_URL`, `FIREBASE_*` (push), `NEXTAUTH_*` (legado — avaliar remoção).

### Validação no startup
- `packages/auth/src/index.ts` **falha** se `BETTER_AUTH_SECRET` ausente/curto.
- Prisma falha sem `DATABASE_URL` válida.
- Em homologação, validar manualmente que `BETTER_AUTH_URL` e `NEXT_PUBLIC_APP_URL` usam **HTTPS** e domínio correto.

---

## 4. Configuração de Domínios e HTTPS

1. **Frontend:** `https://app-staging.<domínio>` (exemplo). Certificado TLS gerenciado pelo provedor/LB.
2. **API:** `https://api-staging.<domínio>` ou rede privada acessível apenas pelo frontend. Se pública, proteger com TLS e restringir origem via rede/firewall quando possível (tRPC hoje exposto sem CORS no standalone; o acesso primário do browser é via **proxy** no Next).
3. **Better Auth:** `BETTER_AUTH_URL` **deve** ser a origem HTTPS do frontend; cookies `Secure` são habilitados quando `NODE_ENV=production` (`packages/auth`).
4. **CORS do proxy:** `apps/web/src/app/api/trpc/[...path]/route.ts` usa `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL` (não hardcode localhost em deploy correto).

---

## 5. Inicialização (ordem sugerida)

1. **Banco:** confirmar migrations aplicadas no ambiente alvo (**não** executar migrations destrutivas sem autorização). `prisma migrate deploy` apenas se política aprovada.
2. **API:** `npm ci` (ou install conforme política), `npm run db:generate` se necessário, iniciar `node apps/api/src/server.ts` (ou script equivalente) com envs de produção. Verificar `GET /health` → `{"ok":true,...}`.
3. **Web:** `npm run build` (raiz turbo) e `next start` em `apps/web` **ou** pipeline equivalente do provedor, com `NEXT_PUBLIC_API_URL` apontando para a API.
4. **Smoke test:** login, dashboard por role, navegação principal, logout.

### Scripts existentes
- Raiz: `npm run dev|build|lint|typecheck|test|db:*` (ver `package.json`).
- API: `apps/api` `dev` roda `node src/server.ts`; `build`/`typecheck` são `tsc --noEmit` (runtime atual é TS/Node conforme setup do repo — **validar transpile/start no provedor**; se necessário, adicionar etapa de build JS no futuro).

---

## 6. Verificação de Funcionamento (checklist)

- [ ] `GET https://<api>/health` retorna 200.
- [ ] `https://<web>/login` carrega; sign-in com usuário de teste (ambiente staging).
- [ ] Dashboard ADMIN mostra métricas/receita; BARBER sem receita e sem rotas admin.
- [ ] Chamadas tRPC via `/api/trpc/*` funcionam (sem 404/401 indevidos).
- [ ] Logout encerra sessão.
- [ ] `npm run build`, `lint`, `typecheck`, `test` verdes no commit de release.

---

## 7. Logs e Monitoramento (mínimo)

- Capturar stdout/stderr de **Web** e **API** no provedor.
- Alertar em falhas de health check `/health`.
- Registrar erros de auth (Better Auth) e 5xx do proxy/tRPC.
- (Futuro) Sentry/PostHog conforme roadmap do README.

---

## 8. Procedimento de Rollback

1. **Aplicação:** reverter para imagem/tag/commit anterior (mecanismo do provedor) e reiniciar Web/API.
2. **Banco:** **não** reverter migrations automaticamente. Se uma migration causou incidente, seguir runbook aprovado pelo DBA/proprietário (backup/restore point-in-time no Supabase).
3. **Config:** manter versões anteriores de variáveis de ambiente no cofre de segredos do provedor para restauração rápida.
4. **Validação pós-rollback:** smoke test (login, RBAC, tRPC).

---

## 9. Pendências que Dependem do Proprietário/Decisão Externa

| Pendência | Motivo |
|---|---|
| Escolha do provedor de hospedagem (Web + API) | Não presumido pelo repositório |
| Domínios e certificados TLS | Infra/conta do proprietário |
| Segredos de produção (BETTER_AUTH_SECRET, DATABASE_URL staging/prod) | Não inventados; devem ser gerados/configurados com segurança |
| Execução de `prisma migrate deploy` em staging/prod | Requer autorização/política de mudança |
| `SUPER_ADMIN` no enum Prisma | Requer migration autorizada |
| Redis/Firebase/E-mail/Pagamentos | Opcionais conforme escopo de lançamento |
| Ajuste fino de cookies cross-subdomain (se web/api em domínios diferentes) | Depende da topologia final; pode exigir config adicional do Better Auth |

---

## 10. Resumo Executivo

O projeto está **tecnicamente validado** para **homologação**: builds, lint, typecheck, 177 testes unitários e 17 E2E verdes. Para subir em staging faltam **decisões de infraestrutura** (provedor, domínios, TLS, segredos) e a aplicação das variáveis de ambiente descritas acima. O código já suporta **CORS/origem configurável** no proxy tRPC e **cookies `Secure` em produção** via Better Auth.

**Não realizar deploy em produção sem autorização explícita.**
