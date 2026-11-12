# RELATORIO_SEGURANCA_FINAL.md — Navio Barber 2.0

**Data:** 2026-11-12  
**Escopo:** auditoria de segurança, privacidade e prontidão para publicação (repositório privado `snsgerenciamento777-blip/navio-barber`).

## 1. O que foi encontrado
- **`.env` / segredos locais:** `.env` (raiz) e `apps/web/.env` existem localmente (conteúdo não inspecionado além da existência; não rastreados). `.env.example` rastreado contém apenas placeholders. `.gitignore` cobre `.env`, `.env*.local`, `.env.development.local`, `.env.test.local`, `.env.production.local`.
- **Git (index/histórico):** nenhum `.env`, `.pem`, `.key`, `id_rsa` ou arquivo de credencial equivalente rastreado no HEAD; varredura de histórico por nomes `.env*`, `*secret*`, `*credential*`, `*.pem`, `*.key` retornou apenas `.env.example`. **Nenhum segredo novo adicionado por esta missão.**
- **Auth/autorização:** Better Auth (`packages/auth`) exige `BETTER_AUTH_SECRET` >= 32 chars, `baseURL` via `BETTER_AUTH_URL`, cookies `Secure` em produção (`sameSite: strict`), rate limit habilitado (regras mais restritivas para sign-in/sign-up), CSRF token em procedures protegidas no tRPC (`x-csrf-token`). RBAC/guards presentes no web e API.
- **CORS/proxy:** API standalone tRPC não aplica CORS próprio (acesso browser previsto via proxy Next `/api/trpc`); proxy (`apps/web/src/app/api/trpc/[...path]/route.ts`) define origem permitida a partir de `NEXT_PUBLIC_APP_URL`/`BETTER_AUTH_URL` e encaminha cookies/CSRF server-side.
- **Endpoints/saúde:** `GET /health`, `/healthz` expostos (200 JSON) — adequado para health checks; sem dados sensíveis.
- **Logs/erros:** `console.error` limitado a falhas de logout no frontend (`apps/web/src/lib/auth.ts`, `apps/web/src/app/page.tsx`); sem exposição de segredos identificada. Auth registra eventos de reset em console/arquivo local `tmp/password-resets` (dev-oriented; `tmp/` presente no workspace, verificar ignorado conforme política local).
- **Supabase/DB:** `DATABASE_URL` via env; nenhuma migration/reset/db push executado. `prisma/schema.prisma` versionado (sem segredos).
- **Reverse/ (engenharia reversa, rastreado no Git):** 26 arquivos (~450 KB) em `Reverse/` incluindo `har_extraction_20261106.txt`, `har_bodies_20261106.txt` e entregas/backups. Amostra identificou **PII/dados potencialmente sensíveis de terceiros/sistema externo** (ex.: e-mails, telefones, URLs de uploads/avatars, identificadores, respostas de API capturadas como `fcm-token` "Token salvo com sucesso") em `har_bodies_20261106.txt` e referências em docs de auditoria. Não há evidência, nesta amostra, de chaves privadas/segredos do Navio Barber 2.0, mas HAR/bodies podem conter tokens/cookies/headers em outras seções — **classificação: ALTO risco de PII/sensibilidade; publicação pública proibida**.

## 2. Classificação de arquivos sensíveis (Reverse/)
| Arquivo/grupo | Classificação | Observação | Ação recomendada |
|---|---|---|---|
| `Reverse/har_bodies_20261106.txt` | **Sensível (PII/dados capturados)** | Contém e-mails/telefones e payloads de API externa | Preservar localmente; **redigir PII/tokens** antes de qualquer exposição pública; avaliar remoção do tree público e rotação/invalidação se aplicável a terceiros (fora do escopo técnico aqui) |
| `Reverse/har_extraction_20261106.txt` | **Sensível potencial** | Extração de tráfego; pode conter identificadores/URLs/tokens | Revisão/redação manual; tratar como confidencial |
| `Reverse/entregas/**` (incl. backups `.bak`) | **Sensível potencial (médio)** | Pode citar dados derivados das capturas | Revisar menções a PII/identificadores; redigir se necessário |
| `.env`, `apps/web/.env` (locais) | **Secreto (não rastreado)** | Credenciais locais | Manter fora do Git; nunca commitar |

## 3. O que foi corrigido nesta missão
- Nenhuma credencial exposta adicionada. Ajustes realizados limitados a proxy tRPC/env docs e build de produção da API (`apps/api/package.json`, `apps/api/tsconfig.build.json`, `GUIA_DEPLOY_NAVIO_BARBER.md`, relatórios). Confirmação por inspeção de diff/staging: sem valores de segredos.

## 4. Controles de publicação (GitHub privado)
- Remote atual: `origin` → repositório **privado** `snsgerenciamento777-blip/navio-barber` (confirmado pelo contexto do projeto; `gh` indisponível para revalidar metadados). Histórico preservado (sem reescrita).
- **Aprovação para publicação pública:** **NÃO APROVADA** enquanto `Reverse/` com PII/dados sensíveis permanecer rastreado e presente no histórico.
- **Publicação no repositório privado atual:** tecnicamente possível para commits que não introduzem novos segredos; **risco residual aceito apenas no contexto privado** e condicionado à mitigação do histórico/PII.

## 5. Bloqueio crítico — histórico Git
- `Reverse/` (26 arquivos) está **rastreado e presente no histórico**; amostra `git log --name-only` indica inclusão em commits anteriores. **Remover/editar arquivos apenas em novo commit não elimina acesso via histórico.**
- Conforme regra da missão: **não publicar dados sensíveis identificados no histórico** e, se correção exigir reescrita histórica, **interromper essa etapa**. Reescrita (`git filter-repo`/BFG) **não executada**.
- **Alternativa segura (ação humana coordenada):** (a) manter repo estritamente privado e restringir acesso; (b) rotacionar credenciais/tokens possivelmente expostos em capturas externas; (c) redigir PII nos arquivos preservando evidência original em armazenamento local seguro/offline; (d) se necessário expurgar histórico, planejar janela de manutenção, backup, reescrita com ferramenta apropriada, force-push coordenado e invalidação de clones/forks — **somente com autorização explícita**, pois altera histórico; (e) considerar mover `Reverse/` para storage privado fora do Git público/compartilhado.

## 6. Comandos executados (segurança)
- `git ls-files` / `git log --all --name-only` para `.env*|pem|key|secret|credential`; `Get-ChildItem -Filter .env* -Recurse`; inspeção `.gitignore`; amostragem `Select-String` em `Reverse/` para padrões de auth/PII (contagens/linhas limitadas); revisão de `packages/auth`, proxy tRPC, server API (health/CORS), e `diff` dos commits.

## 7. Resultado
- **Segurança operacional do código (MVP):** adequada para homologação com envs corretos e HTTPS.
- **Privacidade/publicação:** **REPROVADA para exposição pública**; **condicionalmente aceitável apenas em privado** com plano de remediação de PII/histórico.
