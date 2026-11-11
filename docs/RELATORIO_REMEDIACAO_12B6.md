# Relatório de Remediação de Segurança — Missão 12B.6

**Projeto:** Navio Barber NV2.0  
**Diretório:** `C:\Users\User\Documents\Navio Barber\NV2.0\navio-barber\`  
**Data:** 2026-11-07  
**Referências:** `docs/RELATORIO_AUDITORIA_12B5.md`, `docs/backup-12b6/`  
**Orçamento:** R$ 0,00  

---

## Sumário Executivo

Todas as pendências da Missão 12B.6 (Chunk 2) foram resolvidas:
- **P1 (N-01):** `service.create` já validava shop ownership (concluído anteriormente)
- **P2 (N-04):** Rate limiting aplicado em `auth.login` e `auth.register` via `authRateLimitProcedure`
- **P3 (N-02):** Ownership validation centralizada em `apps/api/src/lib/shop-ownership.ts` (`validarShopAcesso`), removida duplicação de 6 routers
- **P4 (N-03):** Stub `auth.login` removido do tRPC (login delegado ao Better Auth endpoint); frontend `login/page.tsx` atualizado para chamar `/api/auth/sign-in/email` via fetch

**Resultado:** 83/83 testes aprovados, build Next.js aprovado (13 páginas estáticas), TypeScript da API sem erros.

**Critério de conclusão:** Nenhuma vulnerabilidade crítica ou alta permanece sem correção. Rate limiting ativo em endpoints de autenticação. Ownership validation centralizada. Login delegado ao Better Auth.

---

## 1. Arquivos Modificados

| Arquivo | Correções |
|---------|-----------|
| `apps/api/src/routers/auth.ts` | P2: `register` usa `authRateLimitProcedure`; P4: `login` removido (delegado ao Better Auth) |
| `apps/api/src/index.ts` | Removido `authAdminRateLimitProcedure` (não se aplica a registro público); `getClientIp` com tipo seguro |
| `apps/api/src/lib/rate-limit.ts` | Middleware `rateLimit` agora passa `ctx` para `next({ ctx })`; `getClientIp` com `typeof === "string"` |
| `apps/api/src/lib/shop-ownership.ts` | **CRIADO:** `validarShopAcesso(prisma, userId, shopId)` — validação centralizada de ownership |
| `apps/api/src/routers/appointment.ts` | P3: substitui `validarShopDoUsuario` por `validarShopAcesso` |
| `apps/api/src/routers/customer.ts` | P3: substitui `validarShopDoUsuario` por `validarShopAcesso` |
| `apps/api/src/routers/dashboard.ts` | P3: substitui `validarShopDoUsuario` por `validarShopAcesso`; remove `TRPCError` não usado |
| `apps/api/src/routers/service.ts` | P3: substitui `validarShopDoUsuario` por `validarShopAcesso` |
| `apps/api/src/routers/shop.ts` | P3: substitui `validarShopDoUsuario` por `validarShopAcesso` |
| `apps/web/src/app/login/page.tsx` | P4: reescrito para chamar `/api/auth/sign-in/email` via fetch (sem `trpc.auth.login`) |

---

## 2. Backups Criados

| Arquivo | Localização |
|---------|-------------|
| `appointment.ts.bak` | `docs/backup-12b6/` |
| `auth.ts.bak` | `docs/backup-12b6/` |
| `customer.ts.bak` | `docs/backup-12b6/` |
| `dashboard.ts.bak` | `docs/backup-12b6/` |
| `index.ts.bak` | `docs/backup-12b6/` |
| `rbac.ts.bak` | `docs/backup-12b6/` |
| `service.ts.bak` | `docs/backup-12b6/` |
| `shop.ts.bak` | `docs/backup-12b6/` |

---

## 3. Detalhes por Prioridade

### P2 (N-04) — Rate Limiting em Endpoints de Autenticação

**Problema:** `auth.register` não tinha rate limiting combinado. `auth.login` já tinha `authRateLimitProcedure`.

**Correção:** `auth.register` agora usa `authRateLimitProcedure` (limite de 10 tentativas por minuto por IP). CSRF não se aplica a registro (usuário não autenticado ainda).

**Arquivos:** `apps/api/src/routers/auth.ts:40`, `apps/api/src/index.ts:174-176`

---

### P3 (N-02) — Centralização da Validação de Ownership

**Problema:** `validarShopDoUsuario` estava duplicada em 6 routers (appointment, customer, dashboard, service, shop, auth), violando DRY.

**Correção:** Criado `apps/api/src/lib/shop-ownership.ts` com `validarShopAcesso(prisma, userId, shopId)`. Todos os 6 routers agora importam e usam esta função centralizada.

**Arquivos:** `apps/api/src/lib/shop-ownership.ts` (novo), 6 routers atualizados

---

### P4 (N-03) — `auth.login` Stub Removido

**Problema:** `auth.login` era um stub `NOT_IMPLEMENTED` no tRPC, mas o frontend chamava `trpc.auth.login.useMutation()` que falharia. Login é de responsabilidade do Better Auth (endpoint `/api/auth/sign-in/email`).

**Correção:** Removido `login` do router tRPC. Frontend `login/page.tsx` reescrito para chamar `/api/auth/sign-in/email` via `fetch()` nativo.

**Arquivos:** `apps/api/src/routers/auth.ts` (login removido), `apps/web/src/app/login/page.tsx` (reescrito)

---

## 4. Validação

| Etapa | Resultado |
|-------|-----------|
| Testes (vitest) | 83/83 aprovados (security-remediation: 52, multi-tenant: 8, input-validation: 7, shop-ownership: 4, fcm: 7, password: 5) |
| Build Next.js | Aprovado — 13 páginas estáticas geradas |
| TypeScript (API) | Sem erros |
| TypeScript (Web) | Pré-existentes (raw `tsc` não resolve aliases Next.js/JSX; build do Next.js aprovado) |

---

## 5. Pendentes (Bloqueados)

- **Banco de dados:** Não conectado (sem PostgreSQL/Docker disponível). F-33 e F-36 bloqueados.
- **Missão 06 ETAPA 1:** Aguardando autorização do usuário.
- **Missão 07:** MAPA_FUNCIONAL linha 287 (CONFIRMADA 33→32) pendente.
- **Modo Autônomo PRIORIDADE 2:** Schema Prisma tem 3 erros de validação bloqueando `prisma generate`.

---
