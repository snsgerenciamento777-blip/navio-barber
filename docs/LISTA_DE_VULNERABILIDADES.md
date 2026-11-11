# Lista de Vulnerabilidades — Missão 12B.3

**Projeto:** Navio Barber NV2.0  
**Data:** 2026-11-07  
**Orçamento:** R$ 0,00  
**Fonte:** Auditoria independente RELATORIO_AUDITORIA_12B3.md

---

## Sumário por Severidade

| Severidade | Quantidade | IDs |
|------------|------------|-----|
| Crítica | 4 | C-01, C-02, C-03, C-04 |
| Alta | 9 | A-01 a A-09 |
| Média | 7 | M-01 a M-07 |
| Baixa | 2 | B-01, B-02 |
| **Total** | **22** | |

---

## Vulnerabilidades Críticas (4)

### C-01 — finalizePrevious atualiza agendamentos de TODAS as lojas

- **Arquivo:** `apps/api/src/routers/appointment.ts:379-388`
- **Procedure:** `appointment.finalizePrevious`
- **Descrição:** Executa `updateMany` sem filtro de `shopId`, finalizando agendamentos pendentes de **todas as barbearias** simultaneamente.
- **Impacto:** Um usuário de uma barbearia pode finalizar agendamentos de outras barbearias.
- **Correção necessária:** Adicionar filtro `shopId` baseado no usuário autenticado, via `validarShopDoUsuario` ou filtro direto no `where`.
- **Status:** Não corrigida

### C-02 — getNoShowCandidates consulta agendamentos de TODAS as lojas

- **Arquivo:** `apps/api/src/routers/appointment.ts:393-405`
- **Procedure:** `appointment.getNoShowCandidates`
- **Descrição:** Executa `findMany` sem filtro de `shopId`, retornando candidatos a no-show de **todas as barbearias**.
- **Impacto:** Exposição de dados de agendamentos de outras barbearias.
- **Correção necessária:** Adicionar filtro de `shopId` baseado no usuário autenticado.
- **Status:** Não corrigida

### C-03 — customer.update permite IDOR (Insecure Direct Object Reference)

- **Arquivo:** `apps/api/src/routers/customer.ts:127-131`
- **Procedure:** `customer.update`
- **Descrição:** Atualiza cliente por `id` sem verificar se o usuário autenticado é proprietário da loja do cliente. Qualquer usuário autenticado pode modificar qualquer cliente.
- **Impacto:** Modificação não autorizada de dados de clientes de outras barbearias.
- **Correção necessária:** Adicionar verificação `validarShopDoUsuario(ctx.prisma, ctx.session!.user.id, customer.shopId)` antes do update.
- **Status:** Não corrigida

### C-04 — customer.block permite IDOR

- **Arquivo:** `apps/api/src/routers/customer.ts:133-145`
- **Procedure:** `customer.block`
- **Descrição:** Bloqueia cliente por `id` sem verificar shop ownership.
- **Impacto:** Bloqueio não autorizado de clientes de outras barbearias.
- **Correção necessária:** Adicionar verificação de shop ownership antes do bloqueio.
- **Status:** Não corrigida

---

## Vulnerabilidades Altas (9)

### A-01 — getAvailableSlots sem proteção de shop ownership

- **Arquivo:** `apps/api/src/routers/appointment.ts:27-72`
- **Procedure:** `appointment.getAvailableSlots`
- **Tipo:** `publicProcedure`
- **Descrição:** Endpoint público que expõe slots disponíveis de qualquer profissional sem verificar se o solicitante tem acesso à loja do profissional.
- **Impacto:** Enumeración de profissionais e horários de qualquer barbearia.
- **Status:** Não corrigida

### A-02 — getByPeriod usa userId como shopId (bug de campo)

- **Arquivo:** `apps/api/src/routers/appointment.ts:364-368`
- **Procedure:** `appointment.getByPeriod`
- **Descrição:** A consulta usa `shopId: input.userId` onde `input.userId` é um ID de usuário, não de loja. Isso resulta em consulta incorreta e potencial exposição de dados.
- **Impacto:** Consulta de agendamentos com filtro incorreto; pode retornar dados vazios ou de loja errada.
- **Correção necessária:** Usar `shopId` correto (obtido via validação do usuário ou parâmetro separado).
- **Status:** Não corrigida

### A-03 — service.list sem proteção de shop ownership

- **Arquivo:** `apps/api/src/routers/service.ts:8-18`
- **Procedure:** `service.list`
- **Tipo:** `publicProcedure`
- **Descrição:** Endpoint público que lista serviços de qualquer loja sem verificação de ownership.
- **Impacto:** Exposição de catálogo de serviços de qualquer barbearia.
- **Status:** Não corrigida

### A-04 — service.getById sem proteção de shop ownership

- **Arquivo:** `apps/api/src/routers/service.ts:20-26`
- **Procedure:** `service.getById`
- **Tipo:** `publicProcedure`
- **Descrição:** Endpoint público que retorna qualquer serviço por ID sem verificação de ownership.
- **Impacto:** Exposição de detalhes de serviços de qualquer barbearia.
- **Status:** Não corrigida

### A-05 — shop.getSettings sem proteção de ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:6-15`
- **Procedure:** `shop.getSettings`
- **Tipo:** `publicProcedure`
- **Descrição:** Endpoint público que retorna configurações de qualquer loja por ID.
- **Impacto:** Exposição de dados comerciais de qualquer barbearia.
- **Status:** Não corrigida

### A-06 — shop.getProfessionals sem proteção de ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:35-42`
- **Procedure:** `shop.getProfessionals`
- **Tipo:** `publicProcedure`
- **Descrição:** Endpoint público que lista profissionais de qualquer loja.
- **Impacto:** Exposição de dados de profissionais de qualquer barbearia.
- **Status:** Não corrigida

### A-07 — shop.getSetupStatus sem proteção de ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:64-99`
- **Procedure:** `shop.getSetupStatus`
- **Tipo:** `publicProcedure`
- **Descrição:** Endpoint público que retorna status de setup de qualquer loja.
- **Impacto:** Exposição de dados de setup/configuração de qualquer barbearia.
- **Status:** Não corrigida

### A-08 — dashboard.getSummary usa userId como shopId (bug de campo)

- **Arquivo:** `apps/api/src/routers/dashboard.ts:36-54`
- **Procedure:** `dashboard.getSummary`
- **Descrição:** A consulta usa `shopId: input.userId` onde `input.userId` é um ID de usuário, não de loja.
- **Impacto:** Consulta de dashboard com filtro incorreto, dados inconsistentes.
- **Correção necessária:** Usar `shopId` correto.
- **Status:** Não corrigida

### A-09 — dashboard.getUpcoming usa userId como shopId (bug de campo)

- **Arquivo:** `apps/api/src/routers/dashboard.ts:99-101`
- **Procedure:** `dashboard.getUpcoming`
- **Descrição:** Mesma falha de A-08 — usa `userId` como `shopId`.
- **Impacto:** Consulta de agendamentos futuros com filtro incorreto.
- **Correção necessária:** Usar `shopId` correto.
- **Status:** Não corrigida

---

## Vulnerabilidades Médias (7)

### M-01 — auth.login sem proteção CSRF

- **Arquivo:** `apps/api/src/routers/auth.ts:10-16`
- **Procedure:** `auth.login`
- **Tipo:** `publicProcedure.mutation`
- **Descrição:** Mutation exposta publicamente sem validação CSRF. Atualmente é um stub (lança NOT_IMPLEMENTED), mas está exposta.
- **Impacto:** Se implementada no futuro sem CSRF, estaria vulnerável a ataques CSRF de login.
- **Correção necessária:** Adicionar `csrfProtectedProcedure` ou manter como endpoint delegado ao Better Auth.
- **Status:** Não corrigida

### M-02 — service.create não verifica shop ownership do admin

- **Arquivo:** `apps/api/src/routers/service.ts:39-52`
- **Procedure:** `service.create`
- **Tipo:** `csrfAdminProcedure`
- **Descrição:** Apenas verifica papel ADMIN, mas não verifica se o admin é proprietário da loja informada em `shopId`.
- **Impacto:** Admin pode criar serviços para lojas que não possui.
- **Status:** Não corrigida

### M-03 — service.update não verifica shop ownership

- **Arquivo:** `apps/api/src/routers/service.ts:67-70`
- **Procedure:** `service.update`
- **Tipo:** `csrfAdminProcedure`
- **Descrição:** Atualiza serviço por ID sem verificar se o usuário é proprietário da loja do serviço.
- **Impacto:** Modificação de serviços de qualquer loja.
- **Status:** Não corrigida

### M-04 — service.deactivate não verifica shop ownership

- **Arquivo:** `apps/api/src/routers/service.ts:73-80`
- **Procedure:** `service.deactivate`
- **Tipo:** `csrfAdminProcedure`
- **Descrição:** Desativa serviço por ID sem verificar shop ownership.
- **Impacto:** Desativação de serviços de qualquer loja.
- **Status:** Não corrigida

### M-05 — shop.updateSettings não verifica shop ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:29-33`
- **Procedure:** `shop.updateSettings`
- **Tipo:** `csrfAdminProcedure`
- **Descrição:** Atualiza configurações de loja por `shopId` sem verificar se o usuário é proprietário.
- **Impacto:** Alteração de configurações de qualquer loja.
- **Status:** Não corrigida

### M-06 — shop.createProfessional não verifica shop ownership

- **Arquivo:** `apps/api/src/routers/shop.ts:52-61`
- **Procedure:** `shop.createProfessional`
- **Tipo:** `csrfAdminProcedure`
- **Descrição:** Cria profissional para qualquer `shopId` sem verificar se o usuário é proprietário.
- **Impacto:** Criação de profissionais em qualquer loja.
- **Status:** Não corrigida

### M-07 — notification.markAsRead não vincula userId à sessão

- **Arquivo:** `apps/api/src/routers/notification.ts:47-51`
- **Procedure:** `notification.markAsRead`
- **Descrição:** Verifica que a notificação pertence ao `input.userId`, mas não verifica se `input.userId === ctx.session.user.id`. Um usuário pode marcar notificações de outro usuário passando o userId dele.
- **Impacto:** IDOR leve — usuário pode alterar estado de notificações alheias.
- **Correção necessária:** Adicionar `if (input.userId !== ctx.session!.user.id)` antes do update.
- **Status:** Não corrigida

---

## Vulnerabilidades Baixas (2)

### B-01 — RBAC implementado mas não integrado

- **Arquivo:** `apps/api/src/lib/rbac.ts` (definição), `apps/api/src/index.ts` (exportação), `apps/api/src/routers/*.ts` (uso)
- **Descrição:** O sistema RBAC com 20 permissões e 2 papéis está completamente implementado em `lib/rbac.ts` e exportado em `index.ts`, mas **não é utilizado por nenhum dos 7 routers**. Todos os routers usam procedures antigas (`protectedProcedure`, `csrfProtectedProcedure`, `csrfAdminProcedure` com checks hardcoded).
- **Impacto:** Controle de acesso granular não está em vigor; apenas verificações binárias (autenticado/não, admin/não-admin).
- **Status:** Não integrada

### B-02 — Função validarShopDoUsuario duplicada

- **Arquivo:** `apps/api/src/routers/appointment.ts:10-24`, `apps/api/src/routers/customer.ts:6-20`, `apps/api/src/routers/dashboard.ts:5-19`
- **Descrição:** A mesma função está copiada em 3 arquivos com implementação idêntica. Não está centralizada em um módulo compartilhado.
- **Impacto:** Manutenção difícil; alterações precisam ser replicadas manualmente. Risco de divergência futura.
- **Correção necessária:** Extrair para `apps/api/src/lib/shop-ownership.ts` e importar nos 3 routers.
- **Status:** Não corrigida

---

## Vulnerabilidades Anteriormente Corrigidas (Referência)

Estas foram corrigidas na Missão 12A e estão listadas apenas para rastreamento:

| ID | Descrição | Status | Correção |
|----|-----------|--------|----------|
| C-01 (antiga) | Senhas em texto plano | ✅ Corrigida | `apps/api/src/lib/password.ts` com scrypt |
| C-02 (antiga) | Sem validação de input | ✅ Corrigida | Zod schemas em todos os inputs |
| C-03 (antiga) | Sem proteção de ownership de loja | ⚠️ Parcial | `validarShopDoUsuario` em 11 endpoints |
| L-01 (antiga) | Prisma schema erros P1012 | ✅ Corrigida | Relacionamentos corrigidos, `prisma generate` OK |
| L-02 (antiga) | Build Next.js falhando | ✅ Corrigida | tsconfig, tailwind, TrpcProvider corrigidos |

---

## Critérios de Severidade

- **Crítica:** Permite acesso a dados de outras barbearias (isolamento multi-tenant quebrado) ou modificação em massa de dados alheios.
- **Alta:** Endpoints públicos sem proteção de ownership, ou bugs de campo que causam consulta de dados incorretos.
- **Média:** Falhas de autorização granular, IDOR leve, ou falta de CSRF em mutation stub.
- **Baixa:** Infraestrutura de segurança implementada mas não utilizada, ou duplicação de código.

---

## Arquivos Mais Afetados

| Arquivo | Vulnerabilidades | Severidade máxima |
|---------|-----------------|-------------------|
| `apps/api/src/routers/customer.ts` | C-03, C-04 | Crítica |
| `apps/api/src/routers/appointment.ts` | C-01, C-02, A-01, A-02 | Crítica |
| `apps/api/src/routers/dashboard.ts` | A-08, A-09 | Alta |
| `apps/api/src/routers/service.ts` | A-03, A-04, M-02, M-03, M-04 | Alta |
| `apps/api/src/routers/shop.ts` | A-05, A-06, A-07, M-05, M-06 | Alta |
| `apps/api/src/routers/notification.ts` | M-07 | Média |
| `apps/api/src/routers/auth.ts` | M-01 | Média |
| `apps/api/src/lib/rbac.ts` | B-01 | Baixa |
| `apps/api/src/index.ts` | B-01 | Baixa |
