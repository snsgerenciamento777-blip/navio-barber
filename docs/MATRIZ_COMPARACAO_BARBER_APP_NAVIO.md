# Matriz de Comparação: Barber App × Navio Barber

**Objetivo:** Avaliar funcionalidades do Barber App (referência MIT, `./barber-app-reference`) para integração no Navio Barber (MVP 2.0), preservando a hierarquia de usuários: **SUPER ADMIN > OWNER/ADMIN DA BARBEARIA > BARBER > CUSTOMER**.

**Convenções de decisão:**
- **REUTILIZAR:** copiar lógica pura com adaptação mínima de API (sem reescrita de regra)
- **ADAPTAR:** copiar conceito, reescrever para tRPC/Prisma/Next.js e hierarquia Navio
- **IMPLEMENTAR:** funcionalidade ausente no Navio, criar do zero inspirada no Barber App
- **MELHORAR:** Navio já tem, mas Barber App oferece variante superior — fundir
- **DESCARTAR:** não se aplica à arquitetura Navio (ex.: React Native apenas, Supabase RLS)

---

## 1. Arquitetura e Stack

| Dimensão | Barber App (referência) | Navio Barber (atual) | Decisão | Justificativa |
|---|---|---|---|---|
| Plataforma | Expo SDK 54 + React Native + expo-router v6 | Next.js 15 (Web) porta 3000 | DESCARTAR | React Native não se aplica a web Next.js |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions) | tRPC + Prisma + PostgreSQL (API lib pura) | DESCARTAR | Supabase RLS/edge functions não se aplicam a tRPC |
| Banco | PostgreSQL (Supabase) | PostgreSQL (Prisma) | REUTILIZAR | Mesmo SGBD; migrations Navio são fonte da verdade |
| Auth | Supabase Auth (email/social) | Better Auth v1.7.18 (Prisma adapter) | DESCARTAR | Better Auth já consolidado na Missão 12B.8.2 |
| API | Supabase JS client + Edge Functions | tRPC routers (apps/api/src/routers/) | DESCARTAR | tRPC já estabelecido |
| Multi-tenancy | RLS por `shop_id` no Supabase | `validarShopAcesso` por rota tRPC | ADAPTAR | Conceito de isolamento por loja é equivalente; Navio já implementa a nível de aplicação |

---

## 2. Autenticação e Autorização

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Papéis de usuário | `customer`, `barber` (profiles.role) | `CUSTOMER`, `BARBER`, `ADMIN` (User.role) | DESCARTAR | Navio já tem hierarquia completa (Missão 12B.8.2) |
| Criação automática de perfil no cadastro | Trigger DB `handle_new_user` | Better Auth callback + Prisma | DESCARTAR | Better Auth já gerencia accounts/sessions |
| Isolamento por loja | RLS `shop_id = current_shop_id()` | `validarShopAcesso(ctx.prisma, userId, shopId)` | REUTILIZAR | Navio já implementa; manter |
| Admin cross-loja | Não tem (single-shop por build) | SUPER ADMIN acessa todas as lojas | DESCARTAR | Hierarquia Navio é superior |

---

## 3. Modelo de Dados

| Entidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Usuário/Perfil | `profiles` (id, full_name, role, phone, avatar_url) | `User` (id, email, phone, passwordHash, name, role, image) | REUTILIZAR | Navio já tem; campos equivalentes |
| Loja | `shops` (implícito via barber_profiles.shop_name) | `Shop` (id, name, address, phone, email, logoUrl, category, ownerId) | REUTILIZAR | Navio já tem modelo completo de loja |
| Profissional | `barber_profiles` (working_hours jsonb, bio, location) | `Professional` (shopId, userId, name, isActive) | ADAPTAR | Navio falta `working_hours`, `bio`, `location` — adicionar |
| Serviço | `services` (barber_id, name, price_cents, duration_minutes, active) | `Service` (shopId, name, category, price, durationMinutes, commissionPercent, isActive) | REUTILIZAR | Navio já tem; adicionar `active` alias (já tem isActive) |
| Agendamento | `appointments` (customer_id, barber_id, service_id, start_time, end_time, status) | `Appointment` (shopId, professionalId, serviceId, customerId, startAt, endAt, status, totalValue, paymentStatus, ...) | REUTILIZAR | Navio já tem modelo completo |
| Pagamento | Stripe via Edge Functions (payment_intent) | `Payment` (appointmentId, amount, method, status) | ADAPTAR | Navio já tem modelo; falta integração Stripe |
| Cliente | `profiles` com role=customer | `Customer` (shopId, fullName, phone, email, birthDate, preferences, status, noShowCount) | REUTILIZAR | Navio já tem modelo mais rico |
| Avaliação | `reviews` (migração 0008) | — (não existe no Navio) | IMPLEMENTAR | Novo modelo + router |
| Código promocional | `promo_codes` (migração 0012) | — (não existe no Navio) | IMPLEMENTAR | Novo modelo + router + lógica pura `promo.ts` |
| Fidelidade | `customer_loyalty` view (completed count) | — (não existe no Navio) | IMPLEMENTAR | Novo modelo + lógica pura `loyalty.ts` |
| Lista de espera | `waitlist` (migração 0014) | — (não existe no Navio) | IMPLEMENTAR | Novo modelo + router |
| Portfólio | `portfolio` (migração 0013) | — (não existe no Navio) | IMPLEMENTAR | Novo modelo + uploads |
| Ausência de funcionário | `time_off` (migração 0010) | `EmployeeAbsence` (shopId, professionalId, startDate, endDate, reason) | REUTILIZAR | Navio já tem |
| Pacotes vendidos | — | `PackageSold` | REUTILIZAR | Navio já tem (não existe no Barber App) |
| Auditoria de agendamento | — | `AppointmentAuditLog` | REUTILIZAR | Navio já tem (não existe no Barber App) |
| Notificações | — (apenas locais via expo-notifications) | `Notification` + `FCMToken` | REUTILIZAR | Navio já tem (superior: push + DB) |
| Analytics | `shop_analytics()` function SQL (migração 0015) | `dashboardRouter.getSummary` | MELHORAR | Fundir lógica pura `analytics.ts` no dashboard Navio |

---

## 4. Agendamento e Disponibilidade (Slots)

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Geração de slots | `lib/availability.ts` `generateSlots()` — working hours por dia da semana, duração do serviço, booked ranges, blocked ranges, granularidade 30min | `appointmentRouter.getAvailableSlots()` — TODO, retorna apenas bookedSlots, `availableSlots: []` | ADAPTAR | Portar `generateSlots` para TypeScript puro no Navio; integrar com `EmployeeAbsence` e working hours do profissional |
| Horário de funcionamento | `barber_profiles.working_hours` jsonb (dia → [open, close] ou null) | Não existe no schema Navio | IMPLEMENTAR | Adicionar `workingHours` ao `Professional` ou `Shop` |
| Dias fechados / almoço | Trabalhado via `working_hours` (null = fechado) | RG-AG-05/RG-AG-06 documentados como TODO | IMPLEMENTAR | Usar `EmployeeAbsence` + working hours |
| Antecedência mínima/máxima | Não especificado | RG-AG-01 (2h), RG-AG-02 (30d) já implementados | REUTILIZAR | Navio já implementa |
| No-show automático | `no_show` status | `getNoShowCandidates` (15 min) | REUTILIZAR | Navio já implementa |
| Remarcação | `reschedule_rpc` (migração 0009) | `appointmentRouter.reschedule` | REUTILIZAR | Navio já implementa |
| Cancelamento | customer/barber próprio | `appointmentRouter.cancel` | REUTILIZAR | Navio já implementa |

---

## 5. Pagamentos (Depósito / Sinal)

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Stripe PaymentIntent | Edge Function `create-payment-intent` + `stripe-webhook` | `Payment` model existe, mas sem integração Stripe | ADAPTAR | Portar lógica das edge functions para tRPC procedures (server-side, sem expor publishable key ao cliente de forma insegura) |
| PaymentSheet (mobile) | `lib/payments.ts` `collectDeposit` (expo) | — | DESCARTAR | React Native apenas; web usaria Stripe Elements ou redirect |
| Webhook Stripe | `stripe-webhook/index.ts` | — | ADAPTAR | Implementar como tRPC procedure ou Next.js API route protegida |
| Segurança (cliente não define valor) | Documentado em `payments.ts` | — | REUTILIZAR | Princípio aplicável ao port para tRPC |

---

## 6. Notificações

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Push (FCM) | — | `FCMToken` + `notificationRouter.registerFcmToken` | REUTILIZAR | Navio já tem |
| Notificações no DB | — | `Notification` + `notificationRouter` | REUTILIZAR | Navio já tem |
| Lembretes locais (device) | `lib/notifications.ts` + `reminder-time.ts` (expo-notifications, AsyncStorage) | — | DESCARTAR | React Native apenas; no web usar notificações do navegador ou e-mail (fora do escopo atual) |
| Lembrete puro (timing) | `reminderDate()` — 60 min antes | — | REUTILIZAR | Lógica pura portável para tRPC/Next.js |

---

## 7. Promoções e Fidelidade

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Códigos promocionais | `promo_codes` + `redeem_promo()` RPC | — | IMPLEMENTAR | Modelo + router tRPC + lógica pura `promo.ts` (unit-tested) |
| Fidelidade (punch card) | `customer_loyalty` view + `LOYALTY_THRESHOLD=10` | — | IMPLEMENTAR | Modelo + lógica pura `loyalty.ts` (unit-tested) |
| Desconto no agendamento | `appointments.promo_code_id`, `discount_cents` | — | IMPLEMENTAR | Adicionar colunas ao `Appointment` + aplicar no create |

---

## 8. Branding / White-label

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Cores da loja | `lib/branding.ts` `mergeBranding()` + `BrandColors` (accent, background, surface, text, tint) | `Shop.logoUrl` apenas | IMPLEMENTAR | Adicionar `brandColors` jsonb ao `Shop` + lógica pura `mergeBranding` |
| Upload de logo/banner | `lib/uploads.ts` (Supabase Storage) | — | ADAPTAR | Conceito de upload por pasta de loja; adaptar para storage usado pelo Navio (ou preservar URL externa) |
| Config por build (shopId fixo) | `lib/config.ts` `EXPO_PUBLIC_SHOP_ID` | — | DESCARTAR | Next.js web não precisa de shopId fixo por build; isolamento é por autenticação/sessão |

---

## 9. Analytics

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| KPIs do dono | `shop_analytics()` SQL (revenue, completed, cancelled, no_show, total, top_services) | `dashboardRouter.getSummary` (appointmentsToday, customersAttended, revenueToday, occupancyRate, totalWeek, totalCustomers) | MELHORAR | Fundir `analytics.ts` (noShowRate, lastNDays, top_services) no dashboard Navio |

---

## 10. Lista de Espera

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Waitlist | `waitlist` (shop/customer/barber/service/desired_date/status) | — | IMPLEMENTAR | Novo modelo + router tRPC |

---

## 11. Avaliações (Reviews)

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Reviews | `reviews` (migração 0008) | — | IMPLEMENTAR | Novo modelo + router tRPC |

---

## 12. Portfólio

| Funcionalidade | Barber App | Navio Barber | Decisão | Justificativa |
|---|---|---|---|---|
| Portfólio do barbeiro | `portfolio` (migração 0013) | — | IMPLEMENTAR | Novo modelo + uploads de imagens |

---

## 13. Resumo de Decisões por Categoria

| Categoria | REUTILIZAR | ADAPTAR | IMPLEMENTAR | MELHORAR | DESCARTAR |
|---|---|---|---|---|---|
| Arquitetura/Stack | Banco (PostgreSQL) | Multi-tenancy conceito | — | — | React Native, Supabase, Supabase Auth, Edge Functions |
| Auth/Autorização | Isolamento por loja (aplicação) | — | — | — | Papéis Barber App, trigger handle_new_user, Better Auth substituto |
| Modelo de dados | User, Shop, Professional, Service, Appointment, Customer, EmployeeAbsence, PackageSold, AppointmentAuditLog, Notification, FCMToken | Professional (working_hours/bio/location), Payment (Stripe) | Review, PromoCode, Loyalty, Waitlist, Portfolio, Appointment.promo_code_id/discount_cents, Shop.brandColors | — | — |
| Agendamento | Antecedência, cancelamento, remarcação, no-show | Geração de slots (`generateSlots`) | Working hours por profissional, dias fechados/almoço | — | — |
| Pagamentos | Princípio cliente não define valor | Stripe integration (tRPC) | — | — | PaymentSheet (mobile), Supabase Edge Functions |
| Notificações | FCM, DB notifications | — | — | — | Lembretes locais expo-notifications (mobile only) |
| Promo/Fidelidade | — | — | PromoCode, Loyalty, desconto no agendamento | — | — |
| Branding | — | Upload por pasta de loja | Shop.brandColors + mergeBranding | — | config.shopId por build |
| Analytics | — | — | — | dashboard (noShowRate, top_services, lastNDays) | — |
| Waitlist | — | — | Waitlist | — | — |
| Reviews | — | — | Reviews | — | — |
| Portfolio | — | — | Portfolio | — | — |

---

## 14. Itens Não Cobertos pelo Barber App (Navio já tem / Navio exclusivo)

| Funcionalidade Navio | Status | Nota |
|---|---|---|
| SUPER ADMIN (hierarquia acima do OWNER) | Existe | Barber App não tem nível acima do owner da loja |
| CSRF protection (X-CSRF-Token) | Existe | Barber App não tem |
| Rate limiting por usuário/IP | Existe | Barber App não tem |
| Appointment audit log | Existe | Barber App não tem |
| Customer block por no-shows (3+) | Existe | Barber App tem no_show status mas não bloqueio automático |
| Setup progresso da loja | Existe | Barber App não tem |
| FCM push tokens | Existe | Barber App usa apenas notificações locais do device |

---
**Status de Implementação (concluído):**

| Item | Status | Arquivos | Testes |
|---|---|---|---|
| `generateSlots` + working hours + `getAvailableSlots` | ✅ Implementado | `prisma/schema.prisma` (Professional.workingHours/bio/location), `apps/api/src/lib/availability.ts`, `apps/api/src/routers/appointment.ts` | `apps/api/src/lib/availability.test.ts` (8 testes) |
| PromoCode + Loyalty + desconto no agendamento | ✅ Implementado | `prisma/schema.prisma` (PromoCode, Appointment.promoCodeId/discountCents), `apps/api/src/lib/promo.ts`, `apps/api/src/lib/loyalty.ts`, `apps/api/src/routers/promo.ts`, `apps/api/src/routers/appointment.ts`, `apps/api/src/index.ts`, `apps/api/src/lib/rbac.ts`, `apps/api/src/routers/_app.ts` | `apps/api/src/lib/promo.test.ts`, `apps/api/src/lib/loyalty.test.ts` (19 testes) |
| Waitlist | ✅ Implementado | `prisma/schema.prisma` (Waitlist), `apps/api/src/routers/waitlist.ts`, `apps/api/src/index.ts`, `apps/api/src/lib/rbac.ts`, `apps/api/src/routers/_app.ts` | `apps/api/src/routers/waitlist.test.ts` |
| Shop.brandColors + mergeBranding | ✅ Implementado | `prisma/schema.prisma` (Shop.brandColors), `apps/api/src/lib/branding.ts` | `apps/api/src/lib/branding.test.ts` |
| Reviews | ✅ Implementado | `prisma/schema.prisma` (Review), `apps/api/src/routers/review.ts`, `apps/api/src/index.ts`, `apps/api/src/lib/rbac.ts`, `apps/api/src/routers/_app.ts` | — |
| Portfolio | ✅ Implementado | `prisma/schema.prisma` (Portfolio), `apps/api/src/routers/portfolio.ts`, `apps/api/src/index.ts`, `apps/api/src/lib/rbac.ts`, `apps/api/src/routers/_app.ts` | — |
| Dashboard analytics (noShowRate, topServices, lastNDays) | ✅ Melhorado | `apps/api/src/lib/analytics.ts`, `apps/api/src/routers/dashboard.ts` | `apps/api/src/lib/analytics.test.ts` |

**Testes totais:** 143 aprovados (97 pré-existentes + 46 novos), 0 falhas.

**Pendente / Não implementado:**
- Stripe integration (Pagamentos): modelo `Payment` existe, mas integração com Stripe não foi feita (sem credenciais/ambiente de pagamento). Decisão: ADAPTAR quando houver ambiente de pagamentos.
- Lembretes locais (notificações device): DESCARTAR (React Native apenas).

**Próximas oportunidades:**
1. Stripe integration (tRPC procedures + webhook)
2. Notificações push via FCM já implementadas; disparar automaticamente em eventos de agendamento
3. Lembretes de agendamento via e-mail/notificação push (24h e 1h antes)
4. Relatórios exportáveis (CSV/PDF) de analytics
5. Integração com Google Calendar / iCal para profissionais
