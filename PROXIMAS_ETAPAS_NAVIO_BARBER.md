# PROXIMAS_ETAPAS_NAVIO_BARBER.md — Navio Barber 2.0

**Data:** 2026-11-12  
**Status geral:** tecnicamente validado para homologação/staging; publicação do frontend e hardening de privacidade/histórico pendentes de ações humanas.

## 1. Prioridade imediata (deploy frontend — opção 2, manual)
1. **Criar serviço `navio-barber-web` no Render** (Root Directory vazio):  
   - Build: `npm ci && npx prisma generate && npx turbo run build --filter=@navio-barber/web...`  
   - Start: `npm run start --workspace=@navio-barber/web -- -H 0.0.0.0 -p $PORT`
2. **Configurar envs (segredos no Render, sem chat):** `NODE_ENV=production`, `DATABASE_URL` (Supabase), `BETTER_AUTH_SECRET` (>=32), `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL` = URL HTTPS definitiva do web, `API_URL=https://navio-barber-api.onrender.com` (+ opcionais conforme necessidade).
3. **Ajustar `BETTER_AUTH_URL`/`NEXT_PUBLIC_APP_URL`** se a URL final só for conhecida após criação e **redeploy**.
4. **Validar em produção:** UI/login, `/api/trpc` proxy, sessão/cookies, RBAC, `GET https://navio-barber-api.onrender.com/health`, logs sem erros críticos. **Não alterar `navio-barber-api` nem Supabase.**

## 2. API em produção (recomendado, janela controlada)
- O serviço `navio-barber-api` existente pode estar rodando start antigo; alinhar para build `dist` (`npm run start --workspace=@navio-barber/api`, health `/health`) em deploy controlado quando autorizado, sem duplicar serviços.

## 3. Segurança e privacidade (ação humana necessária)
- **`Reverse/` contém PII/dados capturados e está rastreado/no histórico.** Manter repositório **privado**, restringir acesso. Planejar: revisão/redação de PII, rotação/invalidação de credenciais/tokens externos se aplicável, e (somente com autorização) estratégia de expurgo histórico (`git filter-repo`/BFG) + coordenação de clones/force-push — **não executado**.
- Garantir que `BETTER_AUTH_SECRET`/`DATABASE_URL` de produção sejam fortes e exclusivos por ambiente.

## 4. Qualidade e operações
- Executar **E2E Playwright** em ambiente com web+API+DB de teste: `npx playwright test --project=setup --project=admin --project=barber --project=security`.
- Configurar CI para E2E/staging (segredos gerenciados) e monitoramento (logs/alertas de `/health`, Sentry/PostHog conforme roadmap).
- Avaliar correção de warnings: `apps/web` `eslint.config.js` `type: module`/plugin Next, avisos Turbo `outputs` para `test`/build API.

## 5. Produto/DB (somente com autorização)
- Migrations/schema (ex.: `SUPER_ADMIN`), integrações opcionais (Redis, FCM, e-mail, pagamentos), e decisões D-01–D-08/Spec Kit pendentes de implementação futura — **não executar migrations destrutivas sem autorização explícita**.

## 6. GitHub/housekeeping
- Manter não versionados: `.agents/skills/test-copilot-worktree/`, `RELATORIO_PUBLICACAO_GITHUB.md` (decidir inclusão futura conscientemente).
- Se desejado, instalar/autenticar `gh` para auditoria de visibilidade/settings.
