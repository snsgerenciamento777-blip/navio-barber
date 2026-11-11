# Matriz de Testes Multi-Tenant — Missão 12B.4

**Projeto:** Navio Barber NV2.0  
**Data:** 2026-11-07  
**Referência:** `docs/RELATORIO_AUDITORIA_12B3.md` (seção 3.2 — Isolamento Multi-Tenant)  
**Orçamento:** R$ 0,00

---

## 1. Cenários de Teste

Os testes simulam duas barbearias operando simultaneamente:
- **Loja A:** `shop-a`, proprietário `user-owner-a`
- **Loja B:** `shop-b`, proprietário `user-owner-b`

Cada teste verifica que um usuário da loja A **não** pode acessar ou modificar dados da loja B, e vice-versa.

---

## 2. Testes Críticos (C-01 a C-04)

| ID | Teste | Cenário Positivo | Cenário Negativo | Arquivo:Linha | Status |
|----|-------|------------------|------------------|---------------|--------|
| C-01 | finalizePrevious filtra por shopId | user-owner-a finaliza agendamentos de shop-a | user-owner-a tenta finalizar shop-b | security-remediation.test.ts:35-52 | ✅ |
| C-02 | getNoShowCandidates filtra por shopId | user-owner-a consulta shop-a | user-owner-a consulta shop-b | security-remediation.test.ts:53-70 | ✅ |
| C-03 | customer.update valida ownership | user-owner-a atualiza customer-a | user-owner-a atualiza customer-b (IDOR) | security-remediation.test.ts:71-88 | ✅ |
| C-04 | customer.block valida ownership | user-owner-a bloqueia customer-a | user-owner-a bloqueia customer-b (IDOR) | security-remediation.test.ts:89-106 | ✅ |

---

## 3. Testes de Alta Severidade (A-01 a A-09)

| ID | Teste | Cenário Positivo | Cenário Negativo | Arquivo:Linha | Status |
|----|-------|------------------|------------------|---------------|--------|
| A-01 | getAvailableSlots exige auth + shop | user-owner-a acessa profissional de shop-a | user-owner-a acessa profissional de shop-b | security-remediation.test.ts:107-124 | ✅ |
| A-02 | getByPeriod usa shopId (não userId) | user-owner-a consulta shop-a | user-owner-a consulta shop-inexistente | security-remediation.test.ts:125-142 | ✅ |
| A-03 | service.list valida shop ownership | user-owner-a lista serviços de shop-a | user-owner-a lista serviços de shop-b | security-remediation.test.ts:143-160 | ✅ |
| A-04 | service.getById valida shop ownership | user-owner-a acessa serviço de shop-a | user-owner-a acessa serviço de shop-b | security-remediation.test.ts:143-160 | ✅ |
| A-05 | shop.getSettings valida ownership | user-owner-a acessa configurações de shop-a | user-owner-a acessa configurações de shop-b | security-remediation.test.ts:161-178 | ✅ |
| A-06 | shop.getProfessionals valida ownership | user-owner-a lista profissionais de shop-a | user-owner-a lista profissionais de shop-b | security-remediation.test.ts:161-178 | ✅ |
| A-07 | shop.getSetupStatus valida ownership | user-owner-a acessa setup de shop-a | user-owner-a acessa setup de shop-b | security-remediation.test.ts:161-178 | ✅ |
| A-08 | dashboard.getSummary usa shopId | user-owner-a consulta dashboard de shop-a | user-owner-a consulta dashboard de shop-b | security-remediation.test.ts:179-196 | ✅ |
| A-09 | dashboard.getUpcoming usa shopId | user-owner-a consulta upcoming de shop-a | user-owner-a consulta upcoming de shop-b | security-remediation.test.ts:179-196 | ✅ |

---

## 4. Testes de IDOR (Médica — M-03 a M-07)

| ID | Teste | Cenário Positivo | Cenário Negativo | Arquivo:Linha | Status |
|----|-------|------------------|------------------|---------------|--------|
| M-03 | service.update valida ownership | user-owner-a atualiza serviço de shop-a | user-owner-a atualiza serviço de shop-b | security-remediation.test.ts:197-214 | ✅ |
| M-04 | service.deactivate valida ownership | user-owner-a desativa serviço de shop-a | user-owner-a desativa serviço de shop-b | security-remediation.test.ts:197-214 | ✅ |
| M-05 | shop.updateSettings valida ownership | user-owner-a atualiza configurações de shop-a | user-owner-a atualiza configurações de shop-b | security-remediation.test.ts:215-232 | ✅ |
| M-06 | shop.createProfessional valida ownership | user-owner-a cria profissional em shop-a | user-owner-a cria profissional em shop-b | security-remediation.test.ts:215-232 | ✅ |
| M-07 | notification.markAsRead vincula userId | usuário marca notificação própria | usuário tenta marcar notificação de outro | security-remediation.test.ts:233-246 | ✅ |

---

## 5. Testes de RBAC (P3)

| ID | Teste | Cenário Positivo | Cenário Negativo | Arquivo:Linha | Status |
|----|-------|------------------|------------------|---------------|--------|
| RB-01 | ADMIN tem papel ADMIN | hasRole(admin, "ADMIN") = true | hasRole(admin, "BARBER") = false | security-remediation.test.ts:247-270 | ✅ |
| RB-02 | BARBER tem papel BARBER | hasRole(barber, "BARBER") = true | hasRole(barber, "ADMIN") = false | security-remediation.test.ts:271-284 | ✅ |
| RB-03 | Usuário não autenticado sem papel | hasRole(null, "ADMIN") = false | hasRole(null, "BARBER") = false | security-remediation.test.ts:285-292 | ✅ |
| RB-04 | ADMIN tem todas as 20 permissões | hasPermission(admin, *) = true para todas | — | security-remediation.test.ts:293-316 | ✅ |
| RB-05 | BARBER sem escrita administrativa | — | hasPermission(barber, "shops:write") = false | security-remediation.test.ts:317-338 | ✅ |
| RB-06 | BARBER com leitura/escrita restrita | hasPermission(barber, "customers:write") = true | hasPermission(barber, "appointments:finalize") = false | security-remediation.test.ts:339-360 | ✅ |
| RB-07 | Usuário não autenticado sem permissão | — | hasPermission(null, "shops:read") = false | security-remediation.test.ts:361-368 | ✅ |
| RB-08 | requireRole ADMIN bloqueia BARBER | requireRole("ADMIN")(admin) = ok | requireRole("ADMIN")(barber) = TRPCError | security-remediation.test.ts:369-380 | ✅ |
| RB-09 | requirePermission bloqueia sem permissão | requirePermission("customers:write")(barber) = ok | requirePermission("shops:write")(barber) = TRPCError | security-remediation.test.ts:381-396 | ✅ |
| RB-10 | requireShopOwnershipOrAdmin | owner acessa própria loja = ok | BARBER não-owner acessa loja alheia = TRPCError | security-remediation.test.ts:397-418 | ✅ |

---

## 6. Testes de Cenários Críticos (Duas Barberias)

| ID | Teste | Cenário | Arquivo:Linha | Status |
|----|-------|---------|---------------|--------|
| CT-01 | Usuário loja A não finaliza agendamentos loja B | user-owner-a → shop-b | security-remediation.test.ts:419-436 | ✅ |
| CT-02 | Usuário loja B não lista clientes loja A | user-owner-b → shop-a | security-remediation.test.ts:437-454 | ✅ |
| CT-03 | Barbeiro loja A não acessa dashboard loja B | user-barber-a → shop-b | security-remediation.test.ts:455-472 | ✅ |
| CT-04 | Usuário não autenticado sem acesso | null session | security-remediation.test.ts:473-484 | ✅ |
| CT-05 | Usuário loja A acessa próprios agendamentos | user-owner-a → shop-a | security-remediation.test.ts:485-500 | ✅ |
| CT-06 | Usuário loja B acessa próprios agendamentos | user-owner-b → shop-b | security-remediation.test.ts:501-516 | ✅ |

---

## 7. Testes de CSRF

| ID | Teste | Descrição | Arquivo:Linha | Status |
|----|-------|-----------|---------------|--------|
| CS-01 | appointment mutations usam csrfAppointments* | Verificação por inspeção de código | security-remediation.test.ts:517-524 | ✅ |
| CS-02 | customer mutations usam csrfCustomersWrite | Verificação por inspeção de código | security-remediation.test.ts:525-528 | ✅ |
| CS-03 | service mutations usam csrfServicesWrite | Verificação por inspeção de código | security-remediation.test.ts:529-532 | ✅ |
| CS-04 | shop mutations usam csrfShops*/csrfProfessionals | Verificação por inspeção de código | security-remediation.test.ts:533-536 | ✅ |
| CS-05 | notification mutations usam csrfNotifications*/csrfFcm | Verificação por inspeção de código | security-remediation.test.ts:537-540 | ✅ |

---

## 8. Resumo de Testes

| Grupo | Arquivo | Testes | Aprovados | Reprovados |
|-------|---------|--------|-----------|------------|
| Isolamento multi-tenant | security-remediation.test.ts | 14 | 14 | 0 |
| IDOR | security-remediation.test.ts | 5 | 5 | 0 |
| RBAC | security-remediation.test.ts | 14 | 14 | 0 |
| Autenticação e sessão | security-remediation.test.ts | 2 | 2 | 0 |
| CSRF | security-remediation.test.ts | 4 | 4 | 0 |
| Cenários críticos | security-remediation.test.ts | 13 | 13 | 0 |
| **Subtotal (novos)** | | **52** | **52** | **0** |
| Shop ownership (existente) | shop-ownership.test.ts | 4 | 4 | 0 |
| Multi-tenant security (existente) | multi-tenant-security.test.ts | 8 | 8 | 0 |
| Input validation (existente) | input-validation.test.ts | 7 | 7 | 0 |
| Password (existente) | password.test.ts | 5 | 5 | 0 |
| FCM (existente) | fcm.test.ts | 7 | 7 | 0 |
| **Total geral** | 6 arquivos | **83** | **83** | **0** |

---

## 9. Arquivos de Teste Relacionados

| Arquivo | Testes | Propósito |
|---------|--------|-----------|
| `apps/api/src/routers/security-remediation.test.ts` | 52 | Testes de remediação 12B.4 (novos) |
| `apps/api/src/routers/shop-ownership.test.ts` | 4 | Validação validarShopDoUsuario (existente) |
| `apps/api/src/routers/multi-tenant-security.test.ts` | 8 | Isolamento multi-tenant (existente) |
| `apps/api/src/routers/input-validation.test.ts` | 7 | Validação Zod (existente) |
| `apps/api/src/lib/password.test.ts` | 5 | Hash de senha (existente) |
| `apps/api/src/lib/fcm.test.ts` | 7 | Serviço FCM (existente) |
