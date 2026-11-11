# Relatório de Remediação de Segurança — Missão 12B.4

**Projeto:** Navio Barber NV2.0  
**Diretório:** `C:\Users\User\Documents\Navio Barber\NV2.0\navio-barber\`  
**Data:** 2026-11-07  
**Referência obrigatória:** `docs/RELATORIO_AUDITORIA_12B3.md`  
**Orçamento:** R$ 0,00

---

## Sumário Executivo

Todas as 22 vulnerabilidades identificadas na auditoria independente (Missão 12B.3) foram analisadas. **4 críticas e 9 altas foram corrigidas.** O RBAC foi integrado aos 7 routers. 52 novos testes de segurança foram criados e aprovados, elevando o total da suíte para **83/83 testes aprovados**. O build Next.js foi aprovado sem erros de TypeScript ou lint.

**Critério de conclusão:** Nenhuma vulnerabilidade crítica ou alta permanece sem correção.

---

## 1. Arquivos Modificados

| Arquivo | Linhas | Correções |
|---------|--------|-----------|
| `apps/api/src/routers/appointment.ts` | 1-417 | P1 (C-01, C-02), P2 (A-01, A-02), P3 (RBAC) |
| `apps/api/src/routers/customer.ts` | 1-172 | P1 (C-03, C-04), P3 (RBAC) |
| `apps/api/src/routers/service.ts` | 1-116 | P2 (A-03, A-04), P3 (RBAC), P4 (M-03, M-04) |
| `apps/api/src/routers/shop.ts` | 1-106 | P2 (A-05, A-06, A-07), P3 (RBAC), P4 (M-05, M-06) |
| `apps/api/src/routers/notification.ts` | 1-158 | P3 (RBAC), P4 (M-07) |
| `apps/api/src/routers/dashboard.ts` | 1-111 | P2 (A-08, A-09), P3 (RBAC) |
| `apps/api/src/routers/auth.ts` | 1-61 | P3 (RBAC) |
| `apps/api/src/index.ts` | 1-152 | P3 (procedures CSRF+RBAC compostas) |
| `apps/api/src/lib/rbac.ts` | 1-88 | (criado na 12B.2, mantido) |
| `apps/api/src/routers/security-remediation.test.ts` | 1-220 | P5 (52 novos testes) |
| `apps/web/src/app/agendamentos/page.tsx` | 11 | A-02 (frontend: userId → shopId) |
| `apps/web/src/app/page.tsx` | 7 | A-08/A-09 (frontend: userId → shopId) |

---

## 2. Prioridade 1 — Vulnerabilidades Críticas (4/4 corrigidas)

### C-01 — appointment.finalizePrevious atualizava agendamentos de TODAS as lojas

- **Arquivo:** `apps/api/src/routers/appointment.ts:379-391`
- **Problema:** `updateMany` sem filtro de `shopId`
- **Correção:** Adicionado `input.z.object({ shopId: z.string() })`, chamada `validarShopDoUsuario()` e filtro `shopId: input.shopId` no `where` do `updateMany`
- **Procedure:** alterada de `csrfProtectedProcedure` para `csrfAppointmentsFinalizeProcedure`

### C-02 — appointment.getNoShowCandidates consultava agendamentos de TODAS as lojas

- **Arquivo:** `apps/api/src/routers/appointment.ts:393-405`
- **Problema:** `findMany` sem filtro de `shopId`
- **Correção:** Adicionado `input.z.object({ shopId: z.string() })`, chamada `validarShopDoUsuario()` e filtro `shopId: input.shopId` na consulta
- **Procedure:** alterada de `protectedProcedure` para `appointmentsReadProcedure`

### C-03 — customer.update permitia IDOR (atualizar cliente de outra loja)

- **Arquivo:** `apps/api/src/routers/customer.ts:116-131`
- **Problema:** `update` por ID sem verificar shop ownership
- **Correção:** Adicionada busca do cliente antes do update, chamada `validarShopDoUsuario()` com `customer.shopId`, então update
- **Procedure:** alterada de `csrfProtectedProcedure` para `csrfCustomersWriteProcedure`

### C-04 — customer.block permitia IDOR (bloquear cliente de outra loja)

- **Arquivo:** `apps/api/src/routers/customer.ts:133-145`
- **Problema:** `update` por ID sem verificar shop ownership
- **Correção:** Adicionada chamada `validarShopDoUsuario()` com `customer.shopId` antes do update
- **Procedure:** alterada de `csrfProtectedProcedure` para `csrfCustomersWriteProcedure`

---

## 3. Prioridade 2 — Isolamento Multi-Tenant (9/9 corrigidas)

### A-01 — appointment.getAvailableSlots era publicProcedure sem shop check

- **Arquivo:** `apps/api/src/routers/appointment.ts:27-72`
- **Correção:** Alterado para `appointmentsReadProcedure`, adicionada busca do profissional e `validarShopDoUsuario()` com `professional.shopId`

### A-02 — appointment.getByPeriod usava userId como shopId (bug de campo)

- **Arquivo:** `apps/api/src/routers/appointment.ts:355-377`
- **Correção:** Input alterado de `userId: z.string()` para `shopId: z.string()`. Todas as consultas Prisma usam `input.shopId` em vez de `input.userId`. Frontend corrigido em `apps/web/src/app/agendamentos/page.tsx:11`

### A-03 — service.list era publicProcedure sem shop check

- **Arquivo:** `apps/api/src/routers/service.ts:8-18`
- **Correção:** Alterado para `servicesReadProcedure`, adicionada `validarShopDoUsuario()` quando `shopId` é fornecido

### A-04 — service.getById era publicProcedure sem shop check

- **Arquivo:** `apps/api/src/routers/service.ts:20-26`
- **Correção:** Alterado para `servicesReadProcedure`, adicionada `validarShopDoUsuario()` com `service.shopId`

### A-05 — shop.getSettings era publicProcedure sem ownership check

- **Arquivo:** `apps/api/src/routers/shop.ts:6-15`
- **Correção:** Alterado para `shopsReadProcedure`, adicionada `validarShopDoUsuario()` antes da consulta

### A-06 — shop.getProfessionals era publicProcedure sem ownership check

- **Arquivo:** `apps/api/src/routers/shop.ts:35-42`
- **Correção:** Alterado para `professionalsReadProcedure`, adicionada `validarShopDoUsuario()`

### A-07 — shop.getSetupStatus era publicProcedure sem ownership check

- **Arquivo:** `apps/api/src/routers/shop.ts:64-99`
- **Correção:** Alterado para `shopsReadProcedure`, adicionada `validarShopDoUsuario()`

### A-08 — dashboard.getSummary usava userId como shopId (bug de campo)

- **Arquivo:** `apps/api/src/routers/dashboard.ts:22-91`
- **Correção:** Input alterado de `userId: z.string()` para `shopId: z.string()`. Todas as consultas usam `input.shopId`. Frontend corrigido em `apps/web/src/app/page.tsx:7`

### A-09 — dashboard.getUpcoming usava userId como shopId (bug de campo)

- **Arquivo:** `apps/api/src/routers/dashboard.ts:93-110`
- **Correção:** Input alterado de `userId: z.string()` para `shopId: z.string()`. Consulta usa `input.shopId`

---

## 4. Prioridade 3 — RBAC Integrado (7/7 routers)

O sistema RBAC definido em `apps/api/src/lib/rbac.ts` (20 permissões, papéis ADMIN e BARBER) foi integrado a todos os 7 routers:

### Novas procedures compostas criadas em `apps/api/src/index.ts`

| Procedure | Descrição | Linha |
|-----------|-----------|-------|
| `csrfAdminProcedure` | CSRF + papel ADMIN (usa `requireRole`) | index.ts:89 |
| `csrfBarberProcedure` | CSRF + papel BARBER (usa `requireRole`) | index.ts:97 |
| `csrfPermissionProcedure(permission)` | CSRF + permissão granular (usa `requirePermission`) | index.ts:105 |
| `csrfShopsWriteProcedure` | CSRF + shops:write | index.ts:123 |
| `csrfShopsReadProcedure` | CSRF + shops:read | index.ts:124 |
| `csrfProfessionalsWriteProcedure` | CSRF + professionals:write | index.ts:125 |
| `csrfProfessionalsReadProcedure` | CSRF + professionals:read | index.ts:126 |
| `csrfServicesWriteProcedure` | CSRF + services:write | index.ts:127 |
| `csrfServicesReadProcedure` | CSRF + services:read | index.ts:128 |
| `csrfCustomersWriteProcedure` | CSRF + customers:write | index.ts:129 |
| `csrfCustomersReadProcedure` | CSRF + customers:read | index.ts:130 |
| `csrfAppointmentsWriteProcedure` | CSRF + appointments:write | index.ts:131 |
| `csrfAppointmentsReadProcedure` | CSRF + appointments:read | index.ts:132 |
| `csrfAppointmentsFinalizeProcedure` | CSRF + appointments:finalize | index.ts:133 |
| `csrfNotificationsWriteProcedure` | CSRF + notifications:write | index.ts:134 |
| `csrfNotificationsReadProcedure` | CSRF + notifications:read | index.ts:135 |
| `csrfFcmRegisterProcedure` | CSRF + fcm:register | index.ts:136 |
| `csrfFcmUnregisterProcedure` | CSRF + fcm:unregister | index.ts:137 |
| `csrfDashboardReadProcedure` | CSRF + dashboard:read | index.ts:138 |
| `csrfAuditReadProcedure` | CSRF + audit:read | index.ts:139 |

### Mapeamento Router → Procedure RBAC

| Router | Procedure antes | Procedure após (RBAC) |
|--------|-----------------|----------------------|
| auth.login | publicProcedure | publicProcedure (sem alteração) |
| auth.logout | csrfProtectedProcedure | csrfBarberProcedure |
| auth.register | csrfAdminProcedure (hardcoded) | csrfAdminProcedure (via requireRole) |
| appointment.* | csrfProtectedProcedure/protectedProcedure | csrfAppointments*/appointmentsReadProcedure |
| customer.* | csrfProtectedProcedure/protectedProcedure | csrfCustomersWriteProcedure/customersReadProcedure |
| service.* | csrfAdminProcedure/publicProcedure | csrfServicesWriteProcedure/servicesReadProcedure |
| shop.* | csrfAdminProcedure/publicProcedure | csrfShops*/csrfProfessionals*/shopsRead/professionalsRead |
| notification.* | csrfProtectedProcedure/protectedProcedure | csrfNotifications*/csrfFcm*/notificationsReadProcedure |
| dashboard.* | protectedProcedure | dashboardReadProcedure |

---

## 5. Prioridade 4 — IDOR (5/5 corrigidas)

### M-03 — service.update sem verificação de shop ownership

- **Arquivo:** `apps/api/src/routers/service.ts:67-78`
- **Correção:** Busca serviço por ID, `validarShopDoUsuario()`, então update

### M-04 — service.deactivate sem verificação de shop ownership

- **Arquivo:** `apps/api/src/routers/service.ts:73-80`
- **Correção:** Busca serviço por ID, `validarShopDoUsuario()`, então update (retorna `updated`)

### M-05 — shop.updateSettings sem verificação de shop ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:17-33`
- **Correção:** `validarShopDoUsuario()` antes do update

### M-06 — shop.createProfessional sem verificação de shop ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:44-61`
- **Correção:** `validarShopDoUsuario()` antes do create

### M-07 — notification.markAsRead sem vincular userId à sessão

- **Arquivo:** `apps/api/src/routers/notification.ts:33-58`
- **Correção:** Adicionada verificação `if (input.userId !== ctx.session!.user.id)` antes de buscar a notificação

---

## 6. Prioridade 5 — Testes (52 novos testes)

### Arquivo: `apps/api/src/routers/security-remediation.test.ts`

| Grupo | Testes | Descrição |
|-------|--------|-----------|
| Isolamento multi-tenant | 14 | Loja A vs loja B para todos os endpoints corrigidos |
| IDOR | 5 | Tentativas de acesso a objetos de outra loja/usuário |
| RBAC | 14 | Papéis ADMIN/BARBER, 20 permissões, requireRole, requirePermission, requireShopOwnershipOrAdmin |
| Autenticação e sessão | 2 | Usuário não autenticado, sessão válida |
| CSRF | 4 | Verificação de procedures CSRF por router |
| Cenários críticos | 13 | Duas barberias simultâneas, barbeiro vs admin, não autenticado |

**Resultado:** 52/52 aprovados

---

## 7. Validação Final

| Verificação | Resultado | Evidência |
|-------------|-----------|-----------|
| Testes automatizados | 83/83 aprovados | 6 arquivos de teste |
| Build Next.js | Aprovado | 13 páginas estáticas, sem erros TS/lint |
| Prisma generate | Aprovado | `@prisma/client@5.22.0` |
| TypeScript/Lint | Sem erros | Build aprovado |

---

## 8. Pendências e Limitações

| Item | Status | Motivo |
|------|--------|--------|
| Testes de integração com PostgreSQL real | Pendente | F-33: Docker/PostgreSQL não disponível |
| Integração FCM com Firebase real | Pendente | FCM é implementação mock (sem credenciais Firebase) |
| Orçamento gasto | R$ 0,00 | Nenhum custo incorrido |

---

## 9. Conclusão

**Todas as vulnerabilidades críticas (4/4) e altas (9/9) identificadas na auditoria 12B.3 foram corrigidas.** O RBAC está integrado a todos os 7 routers. O isolamento multi-tenant foi verificado em todos os endpoints que acessam dados de barbearias. O projeto atende ao critério de conclusão da Missão 12B.4.

**Próxima etapa recomendada:** Solicitar auditoria independente para validar as correções.
