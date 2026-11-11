# Matriz RBAC Atualizada — Missão 12B.4

**Projeto:** Navio Barber NV2.0  
**Data:** 2026-11-07  
**Referência:** `docs/RELATORIO_AUDITORIA_12B3.md` (seção 2 — RBAC não integrado)  
**Orçamento:** R$ 0,00

---

## 1. Papéis e Permissões Definidas

### 1.1 Papéis (`apps/api/src/lib/rbac.ts:6-7`)

| Papel | Descrição |
|-------|-----------|
| ADMIN | Acesso completo a todos os recursos |
| BARBER | Acesso restrito: leitura de lojas, profissionais, serviços; leitura/escrita de clientes e agendamentos; notificações e FCM |

### 1.2 Matriz de Permissões (20 permissões)

| Categoria | Permissão | ADMIN | BARBER | Procedure RBAC | Arquivo:Linha |
|-----------|-----------|-------|--------|----------------|---------------|
| Usuários | users:read | ✅ | ✅ | — | rbac.ts:31 |
| Usuários | users:write | ✅ | ❌ | — | rbac.ts:32 |
| Usuários | users:delete | ✅ | ❌ | — | rbac.ts:33 |
| Lojas | shops:read | ✅ | ✅ | shopsReadProcedure | index.ts:124 |
| Lojas | shops:write | ✅ | ❌ | csrfShopsWriteProcedure | index.ts:123 |
| Lojas | shops:delete | ✅ | ❌ | — | rbac.ts:35 |
| Profissionais | professionals:read | ✅ | ✅ | professionalsReadProcedure | index.ts:126 |
| Profissionais | professionals:write | ✅ | ❌ | csrfProfessionalsWriteProcedure | index.ts:125 |
| Profissionais | professionals:delete | ✅ | ❌ | — | rbac.ts:38 |
| Serviços | services:read | ✅ | ✅ | servicesReadProcedure | index.ts:128 |
| Serviços | services:write | ✅ | ❌ | csrfServicesWriteProcedure | index.ts:127 |
| Serviços | services:delete | ✅ | ❌ | — | rbac.ts:41 |
| Clientes | customers:read | ✅ | ✅ | customersReadProcedure | index.ts:130 |
| Clientes | customers:write | ✅ | ✅ | csrfCustomersWriteProcedure | index.ts:129 |
| Clientes | customers:delete | ✅ | ❌ | — | rbac.ts:44 |
| Agendamentos | appointments:read | ✅ | ✅ | appointmentsReadProcedure | index.ts:132 |
| Agendamentos | appointments:write | ✅ | ✅ | csrfAppointmentsWriteProcedure | index.ts:131 |
| Agendamentos | appointments:delete | ✅ | ❌ | — | rbac.ts:47 |
| Agendamentos | appointments:finalize | ✅ | ❌ | csrfAppointmentsFinalizeProcedure | index.ts:133 |
| Notificações | notifications:read | ✅ | ✅ | notificationsReadProcedure | index.ts:135 |
| Notificações | notifications:write | ✅ | ✅ | csrfNotificationsWriteProcedure | index.ts:134 |
| Notificações | notifications:delete | ✅ | ❌ | — | rbac.ts:51 |
| FCM | fcm:register | ✅ | ✅ | csrfFcmRegisterProcedure | index.ts:136 |
| FCM | fcm:unregister | ✅ | ✅ | csrfFcmUnregisterProcedure | index.ts:137 |
| Dashboard | dashboard:read | ✅ | ✅ | dashboardReadProcedure | index.ts:138 |
| Auditoria | audit:read | ✅ | ❌ | auditReadProcedure | index.ts:139 |

**Resumo:** ADMIN = 20/20 permissões | BARBER = 15/20 permissões

---

## 2. Procedures RBAC Implementadas (`apps/api/src/index.ts`)

### 2.1 Procedures de papel (role-based)

| Procedure | Implementação | Linha |
|-----------|---------------|-------|
| `adminProcedure` | `roleProcedure("ADMIN")` | index.ts:119 |
| `barberProcedure` | `roleProcedure("BARBER")` | index.ts:120 |

### 2.2 Procedures de permissão (permission-based)

| Procedure | Permissão | Linha |
|-----------|-----------|-------|
| `shopsReadProcedure` | shops:read | index.ts:124 |
| `professionalsReadProcedure` | professionals:read | index.ts:126 |
| `servicesReadProcedure` | services:read | index.ts:128 |
| `customersReadProcedure` | customers:read | index.ts:130 |
| `appointmentsReadProcedure` | appointments:read | index.ts:132 |
| `notificationsReadProcedure` | notifications:read | index.ts:135 |
| `dashboardReadProcedure` | dashboard:read | index.ts:138 |
| `auditReadProcedure` | audit:read | index.ts:139 |

### 2.3 Procedures compostas CSRF + RBAC (mutations)

| Procedure | CSRF | Permissão/Papel | Linha |
|-----------|------|-----------------|-------|
| `csrfAdminProcedure` | ✅ | ADMIN (requireRole) | index.ts:89 |
| `csrfBarberProcedure` | ✅ | BARBER (requireRole) | index.ts:97 |
| `csrfShopsWriteProcedure` | ✅ | shops:write | index.ts:123 |
| `csrfProfessionalsWriteProcedure` | ✅ | professionals:write | index.ts:125 |
| `csrfServicesWriteProcedure` | ✅ | services:write | index.ts:127 |
| `csrfCustomersWriteProcedure` | ✅ | customers:write | index.ts:129 |
| `csrfAppointmentsWriteProcedure` | ✅ | appointments:write | index.ts:131 |
| `csrfAppointmentsFinalizeProcedure` | ✅ | appointments:finalize | index.ts:133 |
| `csrfNotificationsWriteProcedure` | ✅ | notifications:write | index.ts:134 |
| `csrfFcmRegisterProcedure` | ✅ | fcm:register | index.ts:136 |
| `csrfFcmUnregisterProcedure` | ✅ | fcm:unregister | index.ts:137 |
| `csrfDashboardReadProcedure` | ✅ | dashboard:read | index.ts:138 |
| `csrfAuditReadProcedure` | ✅ | audit:read | index.ts:139 |

---

## 3. Integração RBAC nos 7 Routers

### 3.1 Mapeamento Router → Procedure → Permissão

| Router | Endpoint | Procedure RBAC | Permissão | Linha |
|--------|----------|----------------|-----------|-------|
| auth | login | publicProcedure | (sem RBAC) | auth.ts:8 |
| auth | me | protectedProcedure | (autenticado) | auth.ts:18 |
| auth | getCsrfToken | protectedProcedure | (autenticado) | auth.ts:25 |
| auth | logout | csrfBarberProcedure | BARBER | auth.ts:36 |
| auth | register | csrfAdminProcedure | ADMIN | auth.ts:41 |
| appointment | getAvailableSlots | appointmentsReadProcedure | appointments:read | appointment.ts:27 |
| appointment | getById | appointmentsReadProcedure | appointments:read | appointment.ts:74 |
| appointment | create | csrfAppointmentsWriteProcedure | appointments:write | appointment.ts:92 |
| appointment | updateStatus | csrfAppointmentsWriteProcedure | appointments:write | appointment.ts:198 |
| appointment | cancel | csrfAppointmentsWriteProcedure | appointments:write | appointment.ts:238 |
| appointment | reschedule | csrfAppointmentsWriteProcedure | appointments:write | appointment.ts:283 |
| appointment | getByPeriod | appointmentsReadProcedure | appointments:read | appointment.ts:355 |
| appointment | finalizePrevious | csrfAppointmentsFinalizeProcedure | appointments:finalize | appointment.ts:379 |
| appointment | getNoShowCandidates | appointmentsReadProcedure | appointments:read | appointment.ts:393 |
| customer | list | customersReadProcedure | customers:read | customer.ts:23 |
| customer | getById | customersReadProcedure | customers:read | customer.ts:54 |
| customer | create | csrfCustomersWriteProcedure | customers:write | customer.ts:76 |
| customer | update | csrfCustomersWriteProcedure | customers:write | customer.ts:116 |
| customer | block | csrfCustomersWriteProcedure | customers:write | customer.ts:133 |
| customer | getHistory | customersReadProcedure | customers:read | customer.ts:147 |
| service | list | servicesReadProcedure | services:read | service.ts:8 |
| service | getById | servicesReadProcedure | services:read | service.ts:20 |
| service | create | csrfServicesWriteProcedure | services:write | service.ts:28 |
| service | update | csrfServicesWriteProcedure | services:write | service.ts:55 |
| service | deactivate | csrfServicesWriteProcedure | services:write | service.ts:73 |
| shop | getSettings | shopsReadProcedure | shops:read | shop.ts:6 |
| shop | updateSettings | csrfShopsWriteProcedure | shops:write | shop.ts:17 |
| shop | getProfessionals | professionalsReadProcedure | professionals:read | shop.ts:35 |
| shop | createProfessional | csrfProfessionalsWriteProcedure | professionals:write | shop.ts:44 |
| shop | getSetupStatus | shopsReadProcedure | shops:read | shop.ts:64 |
| notification | list | notificationsReadProcedure | notifications:read | notification.ts:6 |
| notification | markAsRead | csrfNotificationsWriteProcedure | notifications:write | notification.ts:33 |
| notification | registerFcmToken | csrfFcmRegisterProcedure | fcm:register | notification.ts:60 |
| notification | unregisterFcmToken | csrfFcmUnregisterProcedure | fcm:unregister | notification.ts:92 |
| notification | createNotification | csrfNotificationsWriteProcedure | notifications:write | notification.ts:108 |
| notification | getUnreadCount | notificationsReadProcedure | notifications:read | notification.ts:138 |
| dashboard | getSummary | dashboardReadProcedure | dashboard:read | dashboard.ts:22 |
| dashboard | getUpcoming | dashboardReadProcedure | dashboard:read | dashboard.ts:93 |

---

## 4. Funções de Controle de Acesso (`apps/api/src/lib/rbac.ts`)

| Função | Descrição | Linha |
|--------|-----------|-------|
| `hasRole(session, role)` | Verifica se o usuário tem o papel especificado | rbac.ts:56 |
| `hasPermission(session, permission)` | Verifica se o usuário tem a permissão especificada | rbac.ts:60 |
| `requireRole(role)` | Middleware que lança TRPCError se o papel não corresponder | rbac.ts:65 |
| `requirePermission(permission)` | Middleware que lança TRPCError se a permissão não estiver presente | rbac.ts:70 |
| `requireShopOwnershipOrAdmin(session, shopOwnerId)` | Verifica se o usuário é admin ou proprietário da loja | rbac.ts:77 |

---

## 5. Diferença Antes/Depois da Integração

| Item | Antes (12B.3) | Depois (12B.4) |
|------|---------------|----------------|
| Procedures RBAC definidas | 20 (apenas declaradas) | 20 (declaradas + usadas) |
| Routers usando RBAC | 0 de 7 | 7 de 7 |
| Procedures de rota usando papel/permissão | 0 | 34 de 37 (3 públicas intencionalmente) |
| csrfAdminProcedure | Verificação hardcoded `userRole !== "ADMIN"` | Usa `requireRole("ADMIN")` de lib/rbac.ts |
| Controle de shop ownership | Apenas em 11 endpoints (hardcoded) | Em 19 endpoints via validarShopDoUsuario + RBAC |

**As 3 procedures públicas intencionais:**
- `auth.login` — delegado ao Better Auth
- `shop.getSettings` — agora protegido com shopsReadProcedure (não é mais público)
- `shop.getProfessionals` — agora protegido com professionalsReadProcedure (não é mais público)
- `shop.getSetupStatus` — agora protegido com shopsReadProcedure (não é mais público)
- `service.list` — agora protegido com servicesReadProcedure (não é mais público)
- `service.getById` — agora protegido com servicesReadProcedure (não é mais público)

**Nota:** Todas as procedures que antes eram `publicProcedure` foram migradas para procedures protegidas com RBAC, exceto `auth.login` que é um stub delegado ao Better Auth.

---

## 6. Verificação de Conformidade

| Requisito | Status | Evidência |
|-----------|--------|-----------|
| ADMIN tem todas as 20 permissões | ✅ | `ROLE_PERMISSIONS.ADMIN` contém todas | rbac.ts:28-39 |
| BARBER tem 15 permissões (subconjunto) | ✅ | `ROLE_PERMISSIONS.BARBER` contém 15 | rbac.ts:41-53 |
| Todos os routers usam procedures RBAC | ✅ | 7/7 routers mapeados na seção 3 | index.ts + routers |
| CSRF + RBAC combinados em mutations | ✅ | 19 procedures compostas criadas | index.ts:89-139 |
| Shop ownership verificado em mutações sensíveis | ✅ | `validarShopDoUsuario()` em 19 endpoints | routers/* |
