# MATRIZ_STATUS_FINAL_MVP.md

**Projeto:** Navio Barber 2.0 — Matriz de Status Final do MVP  
**Data:** 2026-11-08  
**Legenda:** ✅ Implementado | ⚠️ Parcial | ❌ Não implementado | — Fora do escopo MVP

---

## 1. Autenticação e Usuários

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Login barbeiro/admin (Better Auth) | ✅ | `/api/auth/sign-in/email` |
| Cadastro público (cliente, papel CUSTOMER) | ✅ | `/api/auth/sign-up/email` (nome, e-mail, senha) |
| Logout | ✅ | `/api/auth/sign-out` |
| Criação de usuário privilegiado (ADMIN/BARBER) | ✅ | `auth.createUser` (apenas admin) |
| Sessão com CSRF token | ✅ | `packages/auth/src/index.ts` callback `session` |
| Rate limiting auth (10 req/min) | ✅ | `authRateLimitProcedure` |
| Redefinição de senha (arquivo local, R$ 0) | ✅ | `sendResetPassword` grava em `tmp/password-resets/` |

---

## 2. Lojas (Shops)

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Criar loja (owner) | — | Não há endpoint público; criar via DB/seed |
| Listar lojas do usuário (`getUserShops`) | ✅ | Novo router; owner ou professional |
| Obter configurações da loja | ✅ | `shop.getSettings` (protegido por ownership) |
| Atualizar configurações da loja | ✅ | `shop.updateSettings` (CSRF + ownership) |
| Status de setup da loja | ✅ | `shop.getSetupStatus` (progresso 0-100%) |

---

## 3. Profissionais

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Listar profissionais da loja | ✅ | `shop.getProfessionals` |
| Criar profissional | ✅ | `shop.createProfessional` (CSRF + ownership) |
| Horário de funcionamento (`workingHours`) | ✅ | Campo JSON no schema; usado para geração de slots |
| Ativar/inativar profissional | ✅ | Campo `isActive` no schema |

---

## 4. Serviços

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Listar serviços da loja | ✅ | `service.list` (filtro por isActive) |
| Criar serviço | ✅ | `service.create` (preço, duração mínima 15min) |
| Atualizar serviço | ✅ | `service.update` |
| Desativar serviço | ✅ | `service.deactivate` (mantém histórico) |

---

## 5. Clientes

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Cadastro cliente (nome + telefone) | ✅ | `customer.create` — apenas nome e telefone (MVP) |
| Listar clientes da loja | ✅ | `customer.list` (busca por nome/telefone, max 100 chars) |
| Obter detalhe do cliente | ✅ | `customer.getById` (com histórico de até 10 agendamentos) |
| Atualizar cliente | ✅ | `customer.update` |
| Bloquear cliente (3+ no-shows) | ✅ | `customer.block` |
| Histórico de atendimentos | ✅ | `customer.getHistory` |

---

## 6. Agendamentos

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Gerar slots disponíveis | ✅ | `appointment.getAvailableSlots` (workingHours + conflitos + ausências) |
| Criar agendamento | ✅ | `appointment.create` (valida 2h min, 30d max, conflitos, expediente, shop ownership cliente+professional) |
| Obter agendamento por ID | ✅ | `appointment.getById` |
| Listar agendamentos por período | ✅ | `appointment.getByPeriod` |
| Atualizar status (ciclo de vida) | ✅ | `appointment.updateStatus` (PENDING→CONFIRMED→IN_PROGRESS→COMPLETED) |
| Cancelar agendamento | ✅ | `appointment.cancel` (apenas PENDING/CONFIRMED) |
| Remarcar agendamento | ✅ | `appointment.reschedule` |
| Finalizar agendamentos pendentes vencidos | ✅ | `appointment.finalizePrevious` (filtro por shopId) |
| Candidatos a no-show (15+ min atraso) | ✅ | `appointment.getNoShowCandidates` (filtro por shopId) |
| Auditoria de alterações de status | ✅ | `AppointmentAuditLog` (oldStatus, newStatus, reason, source, changedBy) |

---

## 7. Dashboard

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Cards resumo (agendamentos hoje, clientes atendidos, receita, ocupação) | ✅ | `dashboard.getSummary` |
| Top serviços do dia | ✅ | Incluído no `getSummary` |
| Próximos atendimentos (2h) | ✅ | `dashboard.getUpcoming` |
| No-show rate (hoje/semana) | ✅ | Via `analytics.noShowRate` |

---

## 8. Notificações e FCM

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Listar notificações do usuário | ✅ | `notification.list` (apenas próprias) |
| Marcar notificação como lida | ✅ | `notification.markAsRead` (CSRF + userId check) |
| Registrar token FCM | ✅ | `notification.registerFcmToken` (CSRF) |
| Remover token FCM | ✅ | `notification.unregisterFcmToken` (CSRF) |
| Enviar notificação push | ⚠️ | `FCMService.sendToToken` é mock (sem Firebase real) |

---

## 9. Segurança e Isolamento Multi-tenant

| Funcionalidade | Status | Observação |
|----------------|--------|------------|
| Validação shop ownership em todos os endpoints | ✅ | `validarShopAcesso()` centralizado |
| CSRF token em todas as mutations | ✅ | `csrf*` procedures + header `X-CSRF-Token` |
| RBAC (ADMIN / BARBER) | ✅ | 2 papéis, permissões granulares |
| Rate limiting (memória) | ✅ | 100 req/min por IP |
| Validação de input (Zod) | ✅ | Todos os inputs validados |
| Ciclo de vida de agendamento | ✅ | Transições válidas aplicadas |

---

## 10. Funcionalidades FORA DO ESCOPO (não implementadas como entregáveis MVP)

| Funcionalidade | Status | Motivo |
|----------------|--------|--------|
| Pagamento online (Stripe/PaymentIntent) | — | Fora do escopo (D-01: pagamento presencial apenas) |
| Programa de fidelidade / cartões de pontos | — | Fora do escopo |
| Lista de espera | — | Fora do escopo (modelo `Waitlist` existe mas não exposto) |
| Sistema de avaliações | — | Fora do escopo (modelo `Review` existe mas não exposto) |
| Portfólio de profissionais | — | Fora do escopo (modelo `Portfolio` existe mas não exposto) |
| Cupons promocionais | — | Fora do escopo (modelo `PromoCode` existe mas não exposto) |
| Analytics avançados / relatórios | — | Fora do escopo |
| IA / integrações pagas | — | Fora do escopo |
| Franquias / múltiplas unidades | — | Fora do escopo |

---

## 11. Testes

| Arquivo | Testes | Status |
|---------|--------|--------|
| `src/lib/availability.test.ts` | 8 | ✅ Aprovado |
| `src/lib/analytics.test.ts` | 5 | ✅ Aprovado |
| `src/lib/promo.test.ts` | 11 | ✅ Aprovado |
| `src/lib/loyalty.test.ts` | 8 | ✅ Aprovado |
| `src/lib/password.test.ts` | 13 | ✅ Aprovado |
| `src/lib/fcm.test.ts` | 7 | ✅ Aprovado |
| `src/lib/branding.test.ts` | 5 | ✅ Aprovado |
| `src/routers/auth-createuser.test.ts` | 6 | ✅ Aprovado |
| `src/routers/shop-ownership.test.ts` | 4 | ✅ Aprovado |
| `src/routers/input-validation.test.ts` | 7 | ✅ Aprovado |
| `src/routers/multi-tenant-security.test.ts` | 8 | ✅ Aprovado |
| `src/routers/waitlist.test.ts` | 9 | ✅ Aprovado |
| `src/routers/security-remediation.test.ts` | 52 | ✅ Aprovado |
| **Total** | **143** | **✅ Todos aprovados** |

---

## 12. Conhecidas Limitações (não bloqueiam homologação)

| Limitação | Severidade | Plano |
|-----------|------------|-------|
| Rate limiting em memória (não distribuído) | Baixo | Substituir por Redis em produção |
| FCM envio é mock | Baixo | Integrar Firebase Admin SDK |
| Não validado com PostgreSQL real | Médio | Executar migrations e testes de integração em staging |
| Sem testes de integração frontend | Baixo | Adicionar Playwright/Cypress |

---

**Fim da matriz**
