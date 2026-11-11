# Matriz CSRF x RBAC — Missão 12B.3

**Projeto:** Navio Barber NV2.0  
**Data:** 2026-11-07  
**Orçamento:** R$ 0,00

---

## 1. Visão Geral

Esta matriz cruzada mostra a proteção CSRF aplicada a cada procedure de mutation e o nível de controle de acesso RBAC (Role-Based Access Control) existente.

**Conteúdo total:** 7 routers, 37 procedures (17 queries + 20 mutations)

---

## 2. Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de procedures | 37 |
| Queries (sem CSRF necessário) | 17 |
| Mutations | 20 |
| Mutations com CSRF | 19 (95%) |
| Mutations SEM CSRF | 1 (5%) |
| Routers com RBAC integrado | 0 de 7 |
| Procedures usando papel/permissão RBAC | 0 |

---

## 3. Matriz por Router

### 3.1 Auth Router (`apps/api/src/routers/auth.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| login | mutation | publicProcedure | ❌ NÃO | Nenhum | :10 | Stub (NOT_IMPLEMENTED), sem CSRF |
| me | query | protectedProcedure | N/A | Nenhum | :18 | Query, CSRF não se aplica |
| getCsrfToken | query | protectedProcedure | N/A | Nenhum | :25 | Query, CSRF não se aplica |
| logout | mutation | csrfProtectedProcedure | ✅ | Nenhum | :36 | CSRF apenas, sem role check |
| register | mutation | csrfAdminProcedure | ✅ | ADMIN (hardcoded) | :41 | CSRF + admin check hardcoded |

### 3.2 Appointment Router (`apps/api/src/routers/appointment.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| getAvailableSlots | query | publicProcedure | N/A | Nenhum | :27 | Query pública |
| getById | query | protectedProcedure | N/A | Nenhum | :74 | Query autenticada |
| create | mutation | csrfProtectedProcedure | ✅ | Nenhum | :92 | CSRF apenas |
| updateStatus | mutation | csrfProtectedProcedure | ✅ | Nenhum | :198 | CSRF apenas |
| cancel | mutation | csrfProtectedProcedure | ✅ | Nenhum | :238 | CSRF apenas |
| reschedule | mutation | csrfProtectedProcedure | ✅ | Nenhum | :283 | CSRF apenas |
| getByPeriod | query | protectedProcedure | N/A | Nenhum | :355 | Query autenticada |
| finalizePrevious | mutation | csrfProtectedProcedure | ✅ | Nenhum | :379 | CSRF apenas |
| getNoShowCandidates | query | protectedProcedure | N/A | Nenhum | :393 | Query autenticada |

### 3.3 Customer Router (`apps/api/src/routers/customer.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| list | query | protectedProcedure | N/A | Nenhum | :23 | Query autenticada |
| getById | query | protectedProcedure | N/A | Nenhum | :54 | Query autenticada |
| create | mutation | csrfProtectedProcedure | ✅ | Nenhum | :76 | CSRF apenas |
| update | mutation | csrfProtectedProcedure | ✅ | Nenhum | :116 | CSRF apenas |
| block | mutation | csrfProtectedProcedure | ✅ | Nenhum | :133 | CSRF apenas |
| getHistory | query | protectedProcedure | N/A | Nenhum | :147 | Query autenticada |

### 3.4 Service Router (`apps/api/src/routers/service.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| list | query | publicProcedure | N/A | Nenhum | :8 | Query pública |
| getById | query | publicProcedure | N/A | Nenhum | :20 | Query pública |
| create | mutation | csrfAdminProcedure | ✅ | ADMIN (hardcoded) | :28 | CSRF + admin |
| update | mutation | csrfAdminProcedure | ✅ | ADMIN (hardcoded) | :55 | CSRF + admin |
| deactivate | mutation | csrfAdminProcedure | ✅ | ADMIN (hardcoded) | :73 | CSRF + admin |

### 3.5 Shop Router (`apps/api/src/routers/shop.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| getSettings | query | publicProcedure | N/A | Nenhum | :6 | Query pública |
| updateSettings | mutation | csrfAdminProcedure | ✅ | ADMIN (hardcoded) | :17 | CSRF + admin |
| getProfessionals | query | publicProcedure | N/A | Nenhum | :35 | Query pública |
| createProfessional | mutation | csrfAdminProcedure | ✅ | ADMIN (hardcoded) | :44 | CSRF + admin |
| getSetupStatus | query | publicProcedure | N/A | Nenhum | :64 | Query pública |

### 3.6 Notification Router (`apps/api/src/routers/notification.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| list | query | protectedProcedure | N/A | Nenhum | :6 | Query autenticada |
| markAsRead | mutation | csrfProtectedProcedure | ✅ | Nenhum | :33 | CSRF apenas |
| registerFcmToken | mutation | csrfProtectedProcedure | ✅ | Nenhum | :60 | CSRF apenas |
| unregisterFcmToken | mutation | csrfProtectedProcedure | ✅ | Nenhum | :92 | CSRF apenas |
| createNotification | mutation | csrfProtectedProcedure | ✅ | Nenhum | :108 | CSRF apenas (admin check inline) |
| getUnreadCount | query | protectedProcedure | N/A | Nenhum | :138 | Query autenticada |

### 3.7 Dashboard Router (`apps/api/src/routers/dashboard.ts`)

| Procedure | Tipo | tRPC Procedure | CSRF | RBAC | Linha | Observação |
|-----------|------|----------------|------|------|-------|------------|
| getSummary | query | protectedProcedure | N/A | Nenhum | :22 | Query autenticada |
| getUpcoming | query | protectedProcedure | N/A | Nenhum | :93 | Query autenticada |

---

## 4. Matriz de Permissões RBAC Definidas (Não Integradas)

### 4.1 Papéis

| Papel | Permissões | Arquivo:Linha |
|-------|------------|---------------|
| ADMIN | Todas as 20 | `lib/rbac.ts:28-39` |
| BARBER | 15 (subconjunto) | `lib/rbac.ts:41-53` |

### 4.2 Permissões Definidas (20)

| Categoria | Permissão | ADMIN | BARBER |
|-----------|-----------|-------|--------|
| Usuários | users:read | ✅ | ✅ |
| Usuários | users:write | ✅ | ❌ |
| Usuários | users:delete | ✅ | ❌ |
| Lojas | shops:read | ✅ | ✅ |
| Lojas | shops:write | ✅ | ❌ |
| Lojas | shops:delete | ✅ | ❌ |
| Profissionais | professionals:read | ✅ | ✅ |
| Profissionais | professionals:write | ✅ | ❌ |
| Profissionais | professionals:delete | ✅ | ❌ |
| Serviços | services:read | ✅ | ✅ |
| Serviços | services:write | ✅ | ❌ |
| Serviços | services:delete | ✅ | ❌ |
| Clientes | customers:read | ✅ | ✅ |
| Clientes | customers:write | ✅ | ✅ |
| Clientes | customers:delete | ✅ | ❌ |
| Agendamentos | appointments:read | ✅ | ✅ |
| Agendamentos | appointments:write | ✅ | ✅ |
| Agendamentos | appointments:delete | ✅ | ❌ |
| Agendamentos | appointments:finalize | ✅ | ❌ |
| Notificações | notifications:read | ✅ | ✅ |
| Notificações | notifications:write | ✅ | ✅ |
| Notificações | notifications:delete | ✅ | ❌ |
| FCM | fcm:register | ✅ | ✅ |
| FCM | fcm:unregister | ✅ | ✅ |
| Dashboard | dashboard:read | ✅ | ✅ |
| Auditoria | audit:read | ✅ | ❌ |

**Total:** 20 permissões | ADMIN: 20 | BARBER: 15

### 4.3 Procedures RBAC Exportadas (Não Usadas por Nenhum Router)

| Procedure | Arquivo:Linha | Usada em Router? |
|-----------|---------------|------------------|
| roleProcedure(role) | index.ts:104 | ❌ Não |
| permissionProcedure(permission) | index.ts:111 | ❌ Não |
| adminProcedure (= roleProcedure("ADMIN")) | index.ts:119 | ❌ Não (sobrescrito pelo antigo) |
| barberProcedure (= roleProcedure("BARBER")) | index.ts:120 | ❌ Não |
| shopsWriteProcedure | index.ts:123 | ❌ Não |
| shopsReadProcedure | index.ts:124 | ❌ Não |
| professionalsWriteProcedure | index.ts:125 | ❌ Não |
| professionalsReadProcedure | index.ts:126 | ❌ Não |
| servicesWriteProcedure | index.ts:127 | ❌ Não |
| servicesReadProcedure | index.ts:128 | ❌ Não |
| customersWriteProcedure | index.ts:129 | ❌ Não |
| customersReadProcedure | index.ts:130 | ❌ Não |
| appointmentsWriteProcedure | index.ts:131 | ❌ Não |
| appointmentsReadProcedure | index.ts:132 | ❌ Não |
| appointmentsFinalizeProcedure | index.ts:133 | ❌ Não |
| notificationsWriteProcedure | index.ts:134 | ❌ Não |
| notificationsReadProcedure | index.ts:135 | ❌ Não |
| fcmRegisterProcedure | index.ts:136 | ❌ Não |
| fcmUnregisterProcedure | index.ts:137 | ❌ Não |
| dashboardReadProcedure | index.ts:138 | ❌ Não |
| auditReadProcedure | index.ts:139 | ❌ Não |

---

## 5. Controle de Acesso Real em Uso (Por Router)

| Router | Proteção usada | Controle de papel | Controle de shop ownership |
|--------|---------------|-------------------|---------------------------|
| auth | csrfAdminProcedure (register), csrfProtectedProcedure (logout) | Hardcoded "ADMIN" em csrfAdminProcedure | Não aplicável |
| appointment | csrfProtectedProcedure (mutations), protectedProcedure (queries) | Nenhum | `validarShopDoUsuario()` em 6 de 9 procedures |
| customer | csrfProtectedProcedure (mutations), protectedProcedure (queries) | Nenhum | `validarShopDoUsuario()` em 4 de 7 procedures |
| service | csrfAdminProcedure (mutations), publicProcedure (queries) | Hardcoded "ADMIN" em csrfAdminProcedure | ❌ Nenhum |
| shop | csrfAdminProcedure (mutations), publicProcedure (queries) | Hardcoded "ADMIN" em csrfAdminProcedure | ❌ Nenhum |
| notification | csrfProtectedProcedure (mutations), protectedProcedure (queries) | Nenhum | Verificação inline de userId em 3 de 7 procedures |
| dashboard | protectedProcedure (queries) | Nenhum | `validarShopDoUsuario()` em 2 de 2 procedures (com bug de userId/shopId) |

---

## 6. Gap Analysis: CSRF vs RBAC

| Procedure | CSRF | RBAC (papel) | RBAC (permissão) | Gap |
|-----------|------|--------------|------------------|-----|
| auth.login | ❌ | ❌ | ❌ | Sem CSRF, sem RBAC |
| auth.logout | ✅ | ❌ | ❌ | Sem RBAC |
| auth.register | ✅ | ADMIN (hardcoded) | ❌ | RBAC não usa lib/rbac.ts |
| appointment.create | ✅ | ❌ | ❌ | Sem RBAC |
| appointment.updateStatus | ✅ | ❌ | ❌ | Sem RBAC |
| appointment.cancel | ✅ | ❌ | ❌ | Sem RBAC |
| appointment.reschedule | ✅ | ❌ | ❌ | Sem RBAC |
| appointment.finalizePrevious | ✅ | ❌ | ❌ | Sem RBAC |
| customer.create | ✅ | ❌ | ❌ | Sem RBAC |
| customer.update | ✅ | ❌ | ❌ | Sem RBAC |
| customer.block | ✅ | ❌ | ❌ | Sem RBAC |
| service.create | ✅ | ADMIN (hardcoded) | ❌ | RBAC não usa lib/rbac.ts |
| service.update | ✅ | ADMIN (hardcoded) | ❌ | RBAC não usa lib/rbac.ts |
| service.deactivate | ✅ | ADMIN (hardcoded) | ❌ | RBAC não usa lib/rbac.ts |
| shop.updateSettings | ✅ | ADMIN (hardcoded) | ❌ | RBAC não usa lib/rbac.ts |
| shop.createProfessional | ✅ | ADMIN (hardcoded) | ❌ | RBAC não usa lib/rbac.ts |
| notification.markAsRead | ✅ | ❌ | ❌ | Sem RBAC |
| notification.registerFcmToken | ✅ | ❌ | ❌ | Sem RBAC |
| notification.unregisterFcmToken | ✅ | ❌ | ❌ | Sem RBAC |
| notification.createNotification | ✅ | ❌ | ❌ | Admin check inline, não RBAC |

---

## 7. Recomendações de Integração RBAC

Para cada procedure de mutation, substituir a procedure atual pela equivalente RBAC:

| Procedure Atual | Substituir por | Motivo |
|-----------------|----------------|--------|
| auth.register (csrfAdminProcedure) | adminProcedure (roleProcedure ADMIN) | Usar RBAC centralizado |
| service.create/update/deactivate (csrfAdminProcedure) | adminProcedure + shopsWriteProcedure | RBAC + propriedade de loja |
| shop.updateSettings/createProfessional (csrfAdminProcedure) | adminProcedure + shopsWriteProcedure | RBAC + propriedade de loja |
| customer.create/update/block (csrfProtectedProcedure) | customersWriteProcedure | Permissão granular |
| appointment.create/updateStatus/cancel/reschedule/finalizePrevious (csrfProtectedProcedure) | appointmentsWriteProcedure + appointmentsFinalizeProcedure | Permissão granular |
| notification.* (csrfProtectedProcedure) | notificationsWriteProcedure + fcmRegister/fcmUnregister | Permissão granular |

**Nota:** A combinação CSRF + RBAC requer criar procedures compostas (ex: `csrfProtectedProcedure.use(permissionProcedure(...))`), pois atualmente CSRF e RBAC estão em camadas separadas.
