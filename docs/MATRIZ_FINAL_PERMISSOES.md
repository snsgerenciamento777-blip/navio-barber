# MATRIZ_FINAL_PERMISSOES.md

**Projeto:** Navio Barber 2.0 — Matriz Final de Permissões  
**Data:** 2026-11-08  
**Fonte:** Código efetivo (schema Prisma, RBAC, routers tRPC, Better Auth)  
**Status:** Diagnóstico de homologação complementar — não há alterações de código

---

## 1. Papéis de Usuário Implementados

O schema Prisma declara 3 valores de enum `Role`, mas o RBAC implementa apenas 2 papéis com permissões. `CUSTOMER` não possui permissões RBAC definidas.

| Papel | Valor no schema `Role` | Valor no RBAC `Role` | Existe como papel distinto? |
|-------|----------------------|---------------------|----------------------------|
| CUSTOMER | `CUSTOMER` (default) | Não definido | ✅ Sim (papel base, sem RBAC) |
| BARBER | `BARBER` | `"BARBER"` | ✅ Sim |
| ADMIN | `ADMIN` | `"ADMIN"` | ✅ Sim |
| OWNER | Não existe como enum | Não existe como papel | ❌ Não — mapeado via `shop.ownerId` |
| SUPER ADMIN | Não existe | Não existe | ❌ Não mencionado no código |

---

## 2. Como Cada Papel é Identificado

| Papel | Identificação no código | Onde é verificado |
|-------|------------------------|-------------------|
| CUSTOMER | `user.role === "CUSTOMER"` | Schema default; não há verificação RBAC |
| BARBER | `user.role === "BARBER"` | `hasRole(session, "BARBER")` em `rbac.ts:81-84` |
| ADMIN | `user.role === "ADMIN"` | `hasRole(session, "ADMIN")` em `rbac.ts:81-84` |
| OWNER (condição) | `shop.ownerId === userId` | `validarShopAcesso()` em `shop-ownership.ts:17-25` |
| SUPER ADMIN | Não implementado | — |

---

## 3. Matriz de Permissões por Papel

### 3.1 Permissões definidas no RBAC

Total de 41 permissões em `apps/api/src/lib/rbac.ts:6-40`.

### 3.2 ADMIN — todas as 41 permissões

| Categoria | Permissões |
|-----------|------------|
| Usuários | `users:read`, `users:write`, `users:delete` |
| Lojas | `shops:read`, `shops:write`, `shops:delete` |
| Profissionais | `professionals:read`, `professionals:write`, `professionals:delete` |
| Serviços | `services:read`, `services:write`, `services:delete` |
| Clientes | `customers:read`, `customers:write`, `customers:delete` |
| Agendamentos | `appointments:read`, `appointments:write`, `appointments:delete`, `appointments:finalize` |
| Notificações | `notifications:read`, `notifications:write`, `notifications:delete` |
| FCM | `fcm:register`, `fcm:unregister` |
| Dashboard | `dashboard:read` |
| Auditoria | `audit:read` |
| Promoções | `promo:read`, `promo:write` |
| Lista de espera | `waitlist:read`, `waitlist:write` |
| Avaliações | `review:read`, `review:write` |
| Portfólio | `portfolio:read`, `portfolio:write` |

### 3.3 BARBER — 16 permissões (restritas)

| Categoria | Permissões | Negadas |
|-----------|------------|---------|
| Usuários | `users:read` | `users:write`, `users:delete` |
| Lojas | `shops:read` | `shops:write`, `shops:delete` |
| Profissionais | `professionals:read` | `professionals:write`, `professionals:delete` |
| Serviços | `services:read` | `services:write`, `services:delete` |
| Clientes | `customers:read`, `customers:write` | `customers:delete` |
| Agendamentos | `appointments:read`, `appointments:write`, `appointments:finalize` | `appointments:delete` |
| Notificações | `notifications:read`, `notifications:write` | `notifications:delete` |
| FCM | `fcm:register`, `fcm:unregister` | — |
| Dashboard | `dashboard:read` | — |
| Auditoria | — | `audit:read` |
| Promoções | `promo:read` | `promo:write` |
| Lista de espera | `waitlist:read`, `waitlist:write` | — |
| Avaliações | `review:read` | `review:write` |
| Portfólio | `portfolio:read` | `portfolio:write` |

### 3.4 CUSTOMER — nenhuma permissão RBAC

| Categoria | Permissões |
|-----------|------------|
| Todas | Nenhuma |

O cliente CUSTOMER não acessa nenhum router tRPC protegido. Interage apenas via Better Auth público (login/cadastro) e é manipulado como registro `Customer` pelos funcionários da barbearia.

### 3.5 OWNER (condição de propriedade)

Não é um papel RBAC. Um usuário ADMIN é considerado owner de uma loja quando `shop.ownerId === user.id`. Verificado por:

- `validarShopAcesso(prisma, userId, shopId)` — `shop-ownership.ts:17-25`
- `requireShopOwnershipOrAdmin(session, shopOwnerId)` — `rbac.ts:115-131`

---

## 4. Endpoints Acessíveis por Papel

### 4.1 Routers tRPC e procedimentos

| Router | Endpoint | Procedimento | ADMIN | BARBER | CUSTOMER |
|--------|----------|--------------|-------|--------|----------|
| auth | `me` | `protectedProcedure` | ✅ | ✅ | ❌ |
| auth | `getCsrfToken` | `protectedProcedure` | ✅ | ✅ | ❌ |
| auth | `logout` | `csrfBarberProcedure` | ❌ | ✅ | ❌ |
| auth | `createUser` | `adminProcedure` | ✅ | ❌ | ❌ |
| appointment | `getAvailableSlots` | `appointmentsReadProcedure` | ✅ | ✅ | ❌ |
| appointment | `getById` | `appointmentsReadProcedure` | ✅ | ✅ | ❌ |
| appointment | `create` | `csrfAppointmentsWriteProcedure` | ✅ | ✅ | ❌ |
| appointment | `updateStatus` | `csrfAppointmentsWriteProcedure` | ✅ | ✅ | ❌ |
| appointment | `cancel` | `csrfAppointmentsWriteProcedure` | ✅ | ✅ | ❌ |
| appointment | `reschedule` | `csrfAppointmentsWriteProcedure` | ✅ | ✅ | ❌ |
| appointment | `getByPeriod` | `appointmentsReadProcedure` | ✅ | ✅ | ❌ |
| appointment | `finalizePrevious` | `csrfAppointmentsFinalizeProcedure` | ✅ | ✅ | ❌ |
| appointment | `getNoShowCandidates` | `appointmentsReadProcedure` | ✅ | ✅ | ❌ |
| service | `list` | `servicesReadProcedure` | ✅ | ✅ | ❌ |
| service | `getById` | `servicesReadProcedure` | ✅ | ✅ | ❌ |
| service | `create` | `csrfServicesWriteProcedure` | ✅ | ❌ | ❌ |
| service | `update` | `csrfServicesWriteProcedure` | ✅ | ❌ | ❌ |
| service | `deactivate` | `csrfServicesWriteProcedure` | ✅ | ❌ | ❌ |
| customer | `list` | `customersReadProcedure` | ✅ | ✅ | ❌ |
| customer | `getById` | `customersReadProcedure` | ✅ | ✅ | ❌ |
| customer | `create` | `csrfCustomersWriteProcedure` | ✅ | ✅ | ❌ |
| customer | `update` | `csrfCustomersWriteProcedure` | ✅ | ✅ | ❌ |
| customer | `block` | `csrfCustomersWriteProcedure` | ✅ | ✅ | ❌ |
| customer | `getHistory` | `customersReadProcedure` | ✅ | ✅ | ❌ |
| dashboard | `getSummary` | `dashboardReadProcedure` | ✅ | ✅ | ❌ |
| dashboard | `getUpcoming` | `dashboardReadProcedure` | ✅ | ✅ | ❌ |
| shop | `getSettings` | `shopsReadProcedure` | ✅ | ✅ | ❌ |
| shop | `updateSettings` | `csrfShopsWriteProcedure` | ✅ | ❌ | � |
| shop | `getProfessionals` | `professionalsReadProcedure` | ✅ | ✅ | ❌ |
| shop | `createProfessional` | `csrfProfessionalsWriteProcedure` | ✅ | ❌ | ❌ |
| shop | `getSetupStatus` | `shopsReadProcedure` | ✅ | ✅ | ❌ |
| shop | `getUserShops` | `shopsReadProcedure` | ✅ | ✅ | ❌ |
| notification | `list` | `notificationsReadProcedure` | ✅ | ✅ | ❌ |
| notification | `markAsRead` | `csrfNotificationsWriteProcedure` | ✅ | ✅ | ❌ |
| notification | `registerFcmToken` | `csrfFcmRegisterProcedure` | ✅ | ✅ | ❌ |
| notification | `unregisterFcmToken` | `csrfFcmUnregisterProcedure` | ✅ | ✅ | ❌ |
| notification | `createNotification` | `csrfNotificationsWriteProcedure` | ✅ | ❌ | ❌ |
| notification | `getUnreadCount` | `notificationsReadProcedure` | ✅ | ✅ | ❌ |

*Nota: Todos os endpoints que aceitam `shopId` também exigem `validarShopAcesso`, que verifica `shop.ownerId === userId`. BARBER só acessa dados de lojas onde é proprietário.*

---

## 5. Controles Adicionais de Autorização

### 5.1 `validarShopAcesso` (`apps/api/src/lib/shop-ownership.ts:12-26`)

Consulta `prisma.shop.findFirst({ where: { id: shopId, ownerId: userId } })`. Bloqueia acesso se o usuário não é proprietário da loja. Aplicado em todos os routers que recebem `shopId`.

### 5.2 CSRF Protection

Todas as mutations usam `csrf*` procedures que validam o header `X-CSRF-Token` contra o token da sessão Better Auth.

### 5.3 Rate Limiting

- Públicos: 100 req/min por IP
- Autenticados: 100 req/min por `userId`
- Auth endpoints: 10 req/min por IP
- Armazenamento: `Map` em memória (não distribuído)

### 5.4 Validação de Entrada (Zod)

Todos os inputs tRPC validados com schemas Zod. Nenhum input livre sem validação.

---

## 6. Restrições por Papel

| Restrição | ADMIN | BARBER | CUSTOMER |
|-----------|-------|--------|----------|
| Criar usuários privilegiados | ✅ | ❌ | ❌ |
| Criar loja | Sem endpoint | Sem endpoint | Sem endpoint |
| Criar profissional | ✅ (própria loja) | ❌ | ❌ |
| Criar serviço | ✅ (própria loja) | ❌ | ❌ |
| Criar cliente | ✅ (própria loja) | ✅ (própria loja) | ❌ |
| Criar agendamento | ✅ (própria loja) | ✅ (própria loja) | ❌ |
| Finalizar agendamento | ✅ | ✅ (própria loja) | ❌ |
| Ver faturamento (dashboard) | ✅ (própria loja) | ✅ (própria loja) | ❌ |
| Ver dados de outra loja | ❌ (bloqueado por validarShopAcesso) | ❌ | ❌ |
| Acessar dados de outro usuário (notificações) | ✅ (admin) | ❌ (somente próprio) | ❌ |

---

## 7. Diagnóstico de Inconsistências

| Item nos relatórios anteriores | Estado real | Correção necessária |
|-------------------------------|-------------|---------------------|
| SUPER ADMIN como papel distinto | Não existe no código | Remover dos relatórios |
| OWNER como papel distinto | Não existe; é `shop.ownerId` + role ADMIN | Esclarecer que OWNER é condição, não papel |
| BARBER não vê faturamento | BARBER tem `dashboard:read` e vê `revenueToday` da própria loja | Corrigir: BARBER vê faturamento da própria loja apenas |
| 4 papéis na hierarquia | 2 papéis com RBAC + CUSTOMER (sem RBAC) | Atualizar matriz |

---

**Fim da matriz de permissões**
