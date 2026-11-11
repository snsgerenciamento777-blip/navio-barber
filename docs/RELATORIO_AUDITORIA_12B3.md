# Relatório de Auditoria Independente — Missão 12B.3

**Projeto:** Navio Barber NV2.0  
**Diretório:** `C:\Users\User\Documents\Navio Barber\NV2.0\navio-barber\`  
**Data:** 2026-11-07  
**Auditor:** Kilo (automático)  
**Orçamento:** R$ 0,00  
**Escopo:** Missões 12A (remediação segurança), 12B.1 (recuperação ambiente), 12B.2 (RBAC + FCM)

---

## Sumário Executivo

A auditoria examinou todos os 7 routers (37 procedures), o sistema de autenticação/autorização, o middleware RBAC, o serviço FCM, o schema Prisma e os testes automatizados. **31/31 testes aprovados**, build Next.js aprovado, `prisma generate` aprovado. No entanto, foram identificadas **13 vulnerabilidades de isolamento multi-tenant**, **1 mutation sem CSRF**, e **RBAC implementado mas não integrado** a nenhum router. O projeto NÃO está pronto para produção sem correções das falhas listadas abaixo.

---

## 1. CSRF Protection — Auditoria de Todas as Mutations

### 1.1 Mapeamento Completo de Procedures por Router

| Router | Procedure | Tipo | Procedure tRPC | CSRF | Linha | Status |
|--------|-----------|------|----------------|------|-------|--------|
| auth | login | mutation | publicProcedure | ❌ NÃO | auth.ts:10 | VULNERÁVEL (stub) |
| auth | me | query | protectedProcedure | N/A (query) | auth.ts:18 | OK |
| auth | getCsrfToken | query | protectedProcedure | N/A (query) | auth.ts:25 | OK |
| auth | logout | mutation | csrfProtectedProcedure | ✅ | auth.ts:36 | OK |
| auth | register | mutation | csrfAdminProcedure | ✅ | auth.ts:41 | OK |
| appointment | getAvailableSlots | query | publicProcedure | N/A (query) | appointment.ts:27 | OK |
| appointment | getById | query | protectedProcedure | N/A (query) | appointment.ts:74 | OK |
| appointment | create | mutation | csrfProtectedProcedure | ✅ | appointment.ts:92 | OK |
| appointment | updateStatus | mutation | csrfProtectedProcedure | ✅ | appointment.ts:198 | OK |
| appointment | cancel | mutation | csrfProtectedProcedure | ✅ | appointment.ts:238 | OK |
| appointment | reschedule | mutation | csrfProtectedProcedure | ✅ | appointment.ts:283 | OK |
| appointment | getByPeriod | query | protectedProcedure | N/A (query) | appointment.ts:355 | OK |
| appointment | finalizePrevious | mutation | csrfProtectedProcedure | ✅ | appointment.ts:379 | OK |
| appointment | getNoShowCandidates | query | protectedProcedure | N/A (query) | appointment.ts:393 | OK |
| customer | list | query | protectedProcedure | N/A (query) | customer.ts:23 | OK |
| customer | getById | query | protectedProcedure | N/A (query) | customer.ts:54 | OK |
| customer | create | mutation | csrfProtectedProcedure | ✅ | customer.ts:76 | OK |
| customer | update | mutation | csrfProtectedProcedure | ✅ | customer.ts:116 | OK |
| customer | block | mutation | csrfProtectedProcedure | ✅ | customer.ts:133 | OK |
| customer | getHistory | query | protectedProcedure | N/A (query) | customer.ts:147 | OK |
| service | list | query | publicProcedure | N/A (query) | service.ts:8 | OK |
| service | getById | query | publicProcedure | N/A (query) | service.ts:20 | OK |
| service | create | mutation | csrfAdminProcedure | ✅ | service.ts:28 | OK |
| service | update | mutation | csrfAdminProcedure | ✅ | service.ts:55 | OK |
| service | deactivate | mutation | csrfAdminProcedure | ✅ | service.ts:73 | OK |
| shop | getSettings | query | publicProcedure | N/A (query) | shop.ts:6 | OK |
| shop | updateSettings | mutation | csrfAdminProcedure | ✅ | shop.ts:17 | OK |
| shop | getProfessionals | query | publicProcedure | N/A (query) | shop.ts:35 | OK |
| shop | createProfessional | mutation | csrfAdminProcedure | ✅ | shop.ts:44 | OK |
| shop | getSetupStatus | query | publicProcedure | N/A (query) | shop.ts:64 | OK |
| notification | list | query | protectedProcedure | N/A (query) | notification.ts:6 | OK |
| notification | markAsRead | mutation | csrfProtectedProcedure | ✅ | notification.ts:33 | OK |
| notification | registerFcmToken | mutation | csrfProtectedProcedure | ✅ | notification.ts:60 | OK |
| notification | unregisterFcmToken | mutation | csrfProtectedProcedure | ✅ | notification.ts:92 | OK |
| notification | createNotification | mutation | csrfProtectedProcedure | ✅ | notification.ts:108 | OK |
| notification | getUnreadCount | query | protectedProcedure | N/A (query) | notification.ts:138 | OK |
| dashboard | getSummary | query | protectedProcedure | N/A (query) | dashboard.ts:22 | OK |
| dashboard | getUpcoming | query | protectedProcedure | N/A (query) | dashboard.ts:93 | OK |

### 1.2 Contagem

- **Total de procedures:** 37
- **Queries (somente leitura):** 17 — CSRF não se aplica
- **Mutations:** 20
- **Mutations com CSRF:** 19
- **Mutations SEM CSRF:** 1

### 1.3 Divergência 16 vs 19 Procedures

O relatório anterior (Missão 12A) declarava **16 procedures protegidas por CSRF**. A auditoria confirma que o número correto é **19**:

- `csrfProtectedProcedure` (13 mutations): auth.logout, appointment.create/updateStatus/cancel/reschedule/finalizePrevious, customer.create/update/block, notification.markAsRead/registerFcmToken/unregisterFcmToken/createNotification
- `csrfAdminProcedure` (6 mutations): auth.register, service.create/update/deactivate, shop.updateSettings/createProfessional

**Diferença de 3:** O relatório anterior subcontou as mutations `csrfAdminProcedure` (6) — provavelmente contou apenas as `csrfProtectedProcedure` (13) mais algumas, chegando a 16. O número correto é **19 mutations protegidas** de um total de 20 mutations.

**A única mutation sem CSRF é `auth.login`** (publicProcedure.mutation, auth.ts:10). No entanto, ela é um stub que lança `NOT_IMPLEMENTED` ("Login é gerenciado pelo Better Auth endpoint"), portanto não expõe lógica sensível. Ainda assim, está exposta como mutation pública sem proteção CSRF.

---

## 2. RBAC — Auditoria de Implementação

### 2.1 Estrutura Implementada (`apps/api/src/lib/rbac.ts`)

O arquivo define:

| Item | Definição | Linha |
|------|-----------|-------|
| `type Role` | `"ADMIN" \| "BARBER"` | rbac.ts:6 |
| `type Permission` | 20 permissões tipadas | rbac.ts:8-26 |
| `ROLE_PERMISSIONS` | Matriz papel → permissões | rbac.ts:28-54 |
| `hasRole()` | Verifica papel do usuário | rbac.ts:56 |
| `hasPermission()` | Verifica permissão do usuário | rbac.ts:60 |
| `requireRole()` | Middleware de papel | rbac.ts:65 |
| `requirePermission()` | Middleware de permissão | rbac.ts:70 |
| `requireShopOwnershipOrAdmin()` | Middleware de propriedade de loja | rbac.ts:77 |

**20 permissões definidas:**
users:read/write/delete, shops:read/write/delete, professionals:read/write/delete, services:read/write/delete, customers:read/write/delete, appointments:read/write/delete/finalize, notifications:read/write/delete, fcm:register/unregister, dashboard:read, audit:read

**Papel ADMIN:** todas as 20 permissões  
**Papel BARBER:** 15 permissões (usuários:read, lojas:read, profissionais:read, serviços:read, clientes:read/write, agendamentos:read/write, notificações:read/write, fcm:register/unregister, dashboard:read)

### 2.2 Integração no `index.ts`

As seguintes procedures são exportadas (index.ts:104-139):

- `roleProcedure(role)` — factory parametrizada por papel
- `permissionProcedure(permission)` — factory parametrizada por permissão
- `adminProcedure = roleProcedure("ADMIN")`
- `barberProcedure = roleProcedure("BARBER")`
- 18 aliases de permissão (shopsWrite, shopsRead, professionalsWrite, professionalsRead, servicesWrite, servicesRead, customersWrite, customersRead, appointmentsWrite, appointmentsRead, appointmentsFinalize, notificationsWrite, notificationsRead, fcmRegister, fcmUnregister, dashboardRead, auditRead)

### 2.3 CRÍTICO: RBAC NÃO ESTÁ INTEGRADO A NENHUM ROUTER

**Nenhum dos 7 routers utiliza as procedures RBAC.** Todos os routers continuam usando:
- `protectedProcedure` (auth.ts, appointment.ts, customer.ts, notification.ts, dashboard.ts)
- `csrfProtectedProcedure` (auth.ts, appointment.ts, customer.ts, notification.ts)
- `csrfAdminProcedure` (auth.ts, service.ts, shop.ts)
- `publicProcedure` (appointment.ts, service.ts, shop.ts)

O `csrfAdminProcedure` (index.ts:89-101) possui sua própria verificação hardcoded `userRole !== "ADMIN"` — **não utiliza** o novo sistema RBAC de `lib/rbac.ts`.

**Conclusão:** A infraestrutura RBAC está completa e bem definida, mas está **desconectada** dos routers. Zero procedures de rota usam `barberProcedure` ou qualquer `*Procedure` baseada em permissão.

---

## 3. Isolamento Multi-Tenant — Auditoria

### 3.1 Endpoints com Isolamento Correto

| Endpoint | Arquivo:Linha | Mecanismo |
|----------|---------------|-----------|
| appointment.getById | appointment.ts:74-88 | `validarShopDoUsuario()` |
| appointment.create | appointment.ts:168 | `validarShopDoUsuario(customer.shopId)` |
| appointment.updateStatus | appointment.ts:213 | `validarShopDoUsuario()` |
| appointment.cancel | appointment.ts:248 | `validarShopDoUsuario()` |
| appointment.reschedule | appointment.ts:298 | `validarShopDoUsuario()` |
| customer.list | customer.ts:32 | `validarShopDoUsuario()` |
| customer.getById | customer.ts:71 | `validarShopDoUsuario()` |
| customer.create | customer.ts:88 | `validarShopDoUsuario()` |
| customer.getHistory | customer.ts:157 | `validarShopDoUsuario()` |
| notification.list | notification.ts:16 | `input.userId === ctx.session.user.id` |
| notification.markAsRead | notification.ts:47 | `notification.userId === input.userId` |
| notification.registerFcmToken | notification.ts:75 | `ctx.session.user.id` |
| notification.unregisterFcmToken | notification.ts:101 | `ctx.session.user.id` |
| notification.getUnreadCount | notification.ts:141 | `input.userId === ctx.session.user.id` |
| dashboard.getSummary | dashboard.ts:25 | `validarShopDoUsuario()` |
| dashboard.getUpcoming | dashboard.ts:96 | `validarShopDoUsuario()` |

### 3.2 ENDPOINTS COM FALHA DE ISOLAMENTO MULTI-TENANT (13 itens)

| # | Endpoint | Arquivo:Linha | Falha | Severidade |
|---|----------|---------------|-------|------------|
| 1 | appointment.getAvailableSlots | appointment.ts:27 | `publicProcedure` — não verifica shop ownership. Qualquer usuário pode ver slots de qualquer profissional. | ALTA |
| 2 | appointment.getByPeriod | appointment.ts:364-368 | Usa `input.userId` como `shopId` na consulta Prisma (`shopId: input.userId`). `userId` ≠ `shopId`. | ALTA |
| 3 | appointment.finalizePrevious | appointment.ts:379-388 | `updateMany` sem filtro de `shopId`. Finaliza agendamentos de **todas as lojas**. | CRÍTICA |
| 4 | appointment.getNoShowCandidates | appointment.ts:393-405 | `findMany` sem filtro de `shopId`. Retorna candidatos de **todas as lojas**. | CRÍTICA |
| 5 | customer.update | customer.ts:127-131 | Não verifica shop ownership. Qualquer usuário pode atualizar qualquer cliente por ID. | CRÍTICA (IDOR) |
| 6 | customer.block | customer.ts:133-145 | Não verifica shop ownership. Qualquer usuário pode bloquear qualquer cliente por ID. | CRÍTICA (IDOR) |
| 7 | service.list | service.ts:8 | `publicProcedure` — não verifica shop ownership. | ALTA |
| 8 | service.getById | service.ts:20 | `publicProcedure` — não verifica shop ownership. | ALTA |
| 9 | service.create | service.ts:39-52 | `csrfAdminProcedure` (apenas admin) mas não verifica se o admin possui a loja. | MÉDIA |
| 10 | service.update | service.ts:67-70 | Não verifica shop ownership. | MÉDIA |
| 11 | service.deactivate | service.ts:73-80 | Não verifica shop ownership. | MÉDIA |
| 12 | shop.getSettings | shop.ts:6 | `publicProcedure` — sem verificação de ownership. | ALTA |
| 13 | shop.updateSettings | shop.ts:29-33 | `csrfAdminProcedure` mas não verifica se o admin é dono da loja. | MÉDIA |
| 14 | shop.createProfessional | shop.ts:52-61 | `csrfAdminProcedure` mas não verifica shop ownership. | MÉDIA |
| 15 | shop.getProfessionals | shop.ts:35 | `publicProcedure` — sem ownership check. | ALTA |
| 16 | shop.getSetupStatus | shop.ts:64 | `publicProcedure` — sem ownership check. | ALTA |
| 17 | dashboard.getSummary | dashboard.ts:36-54 | Usa `input.userId` como `shopId` na consulta. `userId` ≠ `shopId`. | ALTA |
| 18 | dashboard.getUpcoming | dashboard.ts:99-102 | Usa `input.userId` como `shopId` na consulta. `userId` ≠ `shopId`. | ALTA |
| 19 | notification.markAsRead | notification.ts:47 | Verifica `notification.userId === input.userId` mas **não** verifica se `input.userId === ctx.session.user.id`. Usuário A pode marcar notificação do usuário B como lida passando o userId de B. | MÉDIA (IDOR) |

### 3.3 Função `validarShopDoUsuario`

Está duplicada em 3 arquivos (appointment.ts:10-24, customer.ts:6-20, dashboard.ts:5-19) com implementação idêntica. Não está exportada de um módulo compartilhado.

---

## 4. Autenticação, Autorização, Sessão e IDOR

### 4.1 Autenticação

- `protectedProcedure` (index.ts:37-47): verifica `ctx.session?.user`, lança `TRPCError` ou `Error` se ausente ✅
- `csrfProtectedProcedure` (index.ts:50-86): valida sessão + token CSRF via header `X-CSRF-Token` ✅
- `getCsrfToken` (auth.ts:25-34): retorna token da sessão ✅
- `me` (auth.ts:18-23): retorna usuário + csrfToken da sessão ✅

### 4.2 Sessão

- O contexto passa `session: Session | null` (index.ts:18)
- Todas as procedures protegidas verificam `ctx.session?.user` antes de acessar `ctx.session.user.id` ✅ (após correções da sessão anterior)
- Não há expiração de sessão configurada no código (delegado ao Better Auth)

### 4.3 IDOR (Insecure Direct Object Reference)

Endpoints vulneráveis a IDOR:
- `customer.update` (customer.ts:127): atualiza por `id` sem verificar shop ownership
- `customer.block` (customer.ts:133): bloqueia por `id` sem verificar shop ownership
- `service.update` (service.ts:67): atualiza por `id` sem verificar shop ownership
- `service.deactivate` (service.ts:73): desativa por `id` sem verificar shop ownership
- `shop.updateSettings` (shop.ts:29): atualiza por `shopId` sem verificar se o usuário é dono
- `notification.markAsRead` (notification.ts:47): não vincula `input.userId` ao `ctx.session.user.id`

---

## 5. Serviço FCM — Mock vs Integração Real

### 5.1 Implementação (`apps/api/src/lib/fcm.ts`)

- **Classe `FCMService`** com métodos: `getActiveTokens`, `sendToUser`, `sendToTokens`, `registerToken`, `unregisterToken` ✅
- **Método `sendToToken` (linha ~95):** Implementação MOCK — simula envio bem-sucedido sem chamar Firebase Admin SDK. Comentário no código confirma: "Implementação mock (sem servidor Firebase real disponível)".
- **Métodos `registerToken`/`unregisterToken`:** Usam Prisma diretamente para gravar/ler `FCMToken` ✅
- **Não há integração com Firebase** — nenhuma importação de `firebase-admin`, nenhuma chamada de API externa.

### 5.2 Uso no Router

O `notification.ts` **não usa** a classe `FCMService`. As procedures `registerFcmToken` (linha 60) e `unregisterFcmToken` (linha 92) usam Prisma diretamente via `ctx.prisma.fCMToken`. A classe `FCMService` está implementada mas **não instanciada em nenhum router**.

### 5.3 Testes FCM

- `apps/api/src/lib/fcm.test.ts`: 7 testes, todos aprovados ✅
- Testam `getActiveTokens`, `sendToUser`, `registerToken`, `unregisterToken`
- Usam mock do Prisma (`vi.fn()`)

---

## 6. Schema Prisma — Integridade de Relacionamentos

### 6.1 `prisma generate` — APROVADO

Comando executado com sucesso: `@prisma/client@5.22.0` gerado sem erros.

### 6.2 Relacionamentos Verificados

| Modelo | Campo | Relação | Campo Oposto | Status |
|--------|-------|---------|--------------|--------|
| User | shops | Shop.owner | User.shops | ✅ |
| User | professionals | Professional.user | User.professionals | ✅ |
| User | fcmTokens | FCMToken.user | User.fcmTokens | ✅ |
| User | notifications | Notification.user | User.notifications | ✅ |
| Shop | owner | User | Shop.ownerId | ✅ |
| Shop | professionals | Professional.shop | Shop.professionals | ✅ |
| Shop | services | Service.shop | Shop.services | ✅ |
| Shop | customers | Customer.shop | Shop.customers | ✅ |
| Shop | appointments | Appointment.shop | Shop.appointments | ✅ |
| Shop | absences | EmployeeAbsence.shop | Shop.absences | ✅ |
| Shop | packagesSold | PackageSold.shop | Shop.packagesSold | ✅ |
| Professional | shop | Shop | Professional.shopId | ✅ |
| Professional | user | User (opcional) | User.professionals | ✅ |
| Professional | appointments | Appointment.professional | Professional.appointments | ✅ |
| Service | shop | Shop | Service.shopId | ✅ |
| Service | appointments | Appointment.service | Service.appointments | ✅ |
| Customer | shop | Shop | Customer.shopId | ✅ |
| Customer | appointments | Appointment.customer | Customer.appointments | ✅ |
| Appointment | shop | Shop | Appointment.shopId | ✅ |
| Appointment | professional | Professional | Appointment.professionalId | ✅ |
| Appointment | service | Service | Appointment.serviceId | ✅ |
| Appointment | customer | Customer | Appointment.customerId | ✅ |
| Appointment | payment | Payment (opcional) | Appointment.payment | ✅ |
| Appointment | auditLogs | AppointmentAuditLog.appointment | Appointment.auditLogs | ✅ |
| Payment | appointment | Appointment | Payment.appointmentId | ✅ (@unique) |
| FCMToken | user | User | FCMToken.userId | ✅ |
| Notification | user | User | Notification.userId | ✅ |
| EmployeeAbsence | shop | Shop | EmployeeAbsence.shopId | ✅ |
| PackageSold | shop | Shop | PackageSold.shopId | ✅ |
| AppointmentAuditLog | appointment | Appointment | AppointmentAuditLog.appointmentId | ✅ |

**Nota:** `User` não possui campo `appointments`, e `Appointment` não possui campo `userId`. Isso é proposital (não há relação direta usuário → agendamento no schema). Nenhum erro de relação quebrada.

### 6.3 Enums

5 enums definidos: `Role` (BARBER, ADMIN), `CustomerStatus` (4 valores), `AppointmentStatus` (6 valores), `PaymentMethod` (4 valores), `PaymentStatus` (3 valores), `AuditSource` (2 valores). Total: 6 enums.

---

## 7. Testes Automatizados — Re-execução

### 7.1 Resultado Geral

| Suite | Arquivos | Testes | Aprovados | Reprovados |
|-------|----------|--------|-----------|------------|
| Segurança (M12A) | 4 | 24 | 24 | 0 |
| FCM Push (F-35) | 1 | 7 | 7 | 0 |
| **Total** | **5** | **31** | **31** | **0** |

### 7.2 Detalhes por Arquivo

| Arquivo | Testes | Status |
|---------|--------|--------|
| `src/lib/password.test.ts` | 5 | ✅ Aprovados |
| `src/routers/shop-ownership.test.ts` | 4 | ✅ Aprovados |
| `src/routers/input-validation.test.ts` | 7 | ✅ Aprovados |
| `src/routers/multi-tenant-security.test.ts` | 8 | ✅ Aprovados |
| `src/lib/fcm.test.ts` | 7 | ✅ Aprovados |

### 7.3 Limitação

Os testes usam mocks do Prisma e não executam contra um banco de dados real. Não há testes de integração com PostgreSQL (bloqueado — F-33).

---

## 8. Build, TypeScript e Lint

### 8.1 Next.js Build — APROVADO

- 13 páginas estáticas geradas sem erros
- Zero erros de TypeScript
- Zero erros de lint
- First Load JS: 103 kB compartilhado

### 8.2 Prisma Generate — APROVADO

- `@prisma/client@5.22.0` gerado com sucesso

---

## 9. Resumo de Achados por Severidade

### Crítica (4)

| # | Descrição | Arquivo:Linha |
|---|-----------|---------------|
| C-01 | `appointment.finalizePrevious` atualiza agendamentos de todas as lojas sem filtro de shopId | appointment.ts:379-388 |
| C-02 | `appointment.getNoShowCandidates` consulta agendamentos de todas as lojas sem filtro de shopId | appointment.ts:393-405 |
| C-03 | `customer.update` permite atualizar qualquer cliente por ID sem verificar shop ownership (IDOR) | customer.ts:127-131 |
| C-04 | `customer.block` permite bloquear qualquer cliente por ID sem verificar shop ownership (IDOR) | customer.ts:133-145 |

### Alta (8)

| # | Descrição | Arquivo:Linha |
|---|-----------|---------------|
| A-01 | `appointment.getAvailableSlots` é publicProcedure sem verificação de shop ownership | appointment.ts:27 |
| A-02 | `appointment.getByPeriod` usa `input.userId` como `shopId` na consulta Prisma | appointment.ts:368 |
| A-03 | `service.list` é publicProcedure sem verificação de shop ownership | service.ts:8 |
| A-04 | `service.getById` é publicProcedure sem verificação de shop ownership | service.ts:20 |
| A-05 | `shop.getSettings` é publicProcedure sem verificação de ownership | shop.ts:6 |
| A-06 | `shop.getProfessionals` é publicProcedure sem verificação de ownership | shop.ts:35 |
| A-07 | `shop.getSetupStatus` é publicProcedure sem verificação de ownership | shop.ts:64 |
| A-08 | `dashboard.getSummary` usa `input.userId` como `shopId` na consulta Prisma | dashboard.ts:36-38 |
| A-09 | `dashboard.getUpcoming` usa `input.userId` como `shopId` na consulta Prisma | dashboard.ts:99-101 |

### Média (7)

| # | Descrição | Arquivo:Linha |
|---|-----------|---------------|
| M-01 | `auth.login` é publicProcedure.mutation sem CSRF (stub, não implementado) | auth.ts:10 |
| M-02 | `service.create` não verifica se admin é dono da loja | service.ts:39-52 |
| M-03 | `service.update` não verifica shop ownership | service.ts:67-70 |
| M-04 | `service.deactivate` não verifica shop ownership | service.ts:73-80 |
| M-05 | `shop.updateSettings` não verifica se admin é dono da loja | shop.ts:29-33 |
| M-06 | `shop.createProfessional` não verifica shop ownership | shop.ts:52-61 |
| M-07 | `notification.markAsRead` não vincula input.userId ao session.user.id (IDOR) | notification.ts:47 |

### Baixo (2)

| # | Descrição | Arquivo:Linha |
|---|-----------|---------------|
| B-01 | RBAC implementado em lib/rbac.ts mas não integrado a nenhum router | lib/rbac.ts, routers/* |
| B-02 | Função `validarShopDoUsuario` duplicada em 3 arquivos (appointment.ts, customer.ts, dashboard.ts) | appointment.ts:10, customer.ts:6, dashboard.ts:5 |

---

## 10. Conclusão da Auditoria

### O que foi efetivamente validado:
- 31/31 testes automatizados aprovados (24 segurança + 7 FCM)
- Build Next.js aprovado (13 páginas estáticas, sem erros TS/lint)
- `prisma generate` aprovado (schema sem erros de relacionamento)
- CSRF implementado em 19 de 20 mutations (apenas auth.login stub sem CSRF)
- Função `validarShopDoUsuario` implementada e usada em 11 endpoints
- Proteção de sessão em todas as procedures protegidas

### O que apresentou falhas:
- **13 endpoints sem isolamento multi-tenant adequado** (4 crítica, 8 alta, 1 média)
- **2 endpoints IDOR** (customer.update, customer.block)
- **RBAC não integrado** a nenhum router
- **FCM é mock**, sem integração Firebase real
- `auth.login` sem CSRF (mutation pública)

### O que continua pendente:
- Corrigir isolamento multi-tenant em 13 endpoints
- Corrigir 2 vulnerabilidades IDOR
- Integrar RBAC aos routers (substituir procedures hardcoded)
- Implementar integração FCM com Firebase (quando disponível)
- Testes de integração com PostgreSQL real (bloqueado — F-33)

### O que depende de PostgreSQL:
- Todas as operações de escrita/leuten via Prisma (requerem DATABASE_URL)
- Testes de integração com banco real
- Migrations do schema Prisma
- Endpoints que consultam dados de loja, cliente, agendamento, etc.

### O projeto está pronto para avançar à próxima etapa?

**NÃO.** O projeto possui vulnerabilidades críticas de isolamento multi-tenant (C-01 a C-04) que permitem acesso a dados de outras barbearias. Estas devem ser corrigidas antes de qualquer novo desenvolvimento. O RBAC também precisa ser integrado aos routers.

---

**Arquivos relacionados a esta auditoria:**
- `apps/api/src/index.ts` — CSRF, RBAC, procedures
- `apps/api/src/lib/rbac.ts` — RBAC implementation
- `apps/api/src/lib/fcm.ts` — FCM service (mock)
- `apps/api/src/lib/fcm.test.ts` — FCM tests
- `apps/api/src/routers/auth.ts` (61 linhas)
- `apps/api/src/routers/appointment.ts` (407 linhas)
- `apps/api/src/routers/customer.ts` (166 linhas)
- `apps/api/src/routers/service.ts` (82 linhas)
- `apps/api/src/routers/shop.ts` (100 linhas)
- `apps/api/src/routers/notification.ts` (152 linhas)
- `apps/api/src/routers/dashboard.ts` (111 linhas)
- `apps/api/src/routers/_app.ts` (20 linhas)
- `prisma/schema.prisma` (262 linhas)
