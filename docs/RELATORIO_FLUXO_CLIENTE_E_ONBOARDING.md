# RELATORIO_FLUXO_CLIENTE_E_ONBOARDING.md

**Projeto:** Navio Barber 2.0 — Fluxo de Cliente e Onboarding  
**Data:** 2026-11-08  
**Avaliador:** Kilo Code  
**Status:** Diagnóstico de homologação complementar

---

## 1. Resumo Executivo

Existem **dois fluxos de cliente distintos e independentes** no Navio Barber 2.0:

1. **Fluxo público Better Auth:** cadastro de usuário do sistema (email + senha) — cria `User` com `role = CUSTOMER`
2. **Fluxo operacional de cliente:** cadastro na barbearia (nome + telefone) — cria `Customer` vinculado a uma loja

O agendamento usa apenas o registro `Customer` (fluxo 2). O cliente final **não precisa** de conta Better Auth nem de senha para ser agendado. O fluxo completo é operado pelo funcionário da barbearia.

**Criação de barbearia:** Não há endpoint público. Requer intervenção manual no banco de dados.

---

## 2. Fluxo de Cadastro do Cliente (MVP)

### 2.1 Fluxo A — Cadastro público Better Auth (usuário do sistema)

| Etapa | Endpoint | Campos | Resultado |
|-------|----------|--------|-----------|
| Cadastro | `POST /api/auth/sign-up/email` | email, senha, nome | `User` criado com `role = CUSTOMER` |
| Verificação de e-mail | Better Auth interno | Token por e-mail | `emailVerified = true` |
| Login | `POST /api/auth/sign-in/email` | email, senha | Sessão criada |
| Rate limit | Better Auth | 3 cadastros/min, 5 sign-ins/min | Proteção contra brute force |

**Arquivo:** `packages/auth/src/index.ts` (linhas 110-122)

### 2.2 Fluxo B — Cadastro operacional de cliente (registro na barbearia)

| Etapa | Endpoint | Campos | Resultado |
|-------|----------|--------|-----------|
| Cadastro do cliente | `trpc.customer.create` | `shopId`, `fullName`, `phone` | `Customer` criado na loja |
| Rate limit | tRPC protected | 100 req/min por usuário | Proteção contra abuso |
| Validação de loja | `validarShopAcesso` | `shop.ownerId === userId` | Apenas proprietário da loja |
| Telefone único | `customer.ts:73-81` | `shopId + phone` | Não permite duplicata na loja |

**Arquivo:** `apps/api/src/routers/customer.ts:61-93`

**Campos obrigatórios:** `shopId`, `fullName` (mínimo 1 char), `phone` (mínimo 1 char)

**Campos opcionais:** `email`, `birthDate`, `preferences` (existem no schema mas não são obrigatórios no create)

### 2.3 Diferença entre os dois fluxos

| Aspecto | Fluxo A (Better Auth) | Fluxo B (Customer operacional) |
|---------|----------------------|--------------------------------|
| O que cadastra | Usuário do sistema (`User`) | Cliente da barbearia (`Customer`) |
| Quem executa | O próprio cliente | Funcionário da barbearia (ADMIN/BARBER) |
| Campos | email + senha + nome | nome + telefone (+ email opcional) |
| Requer autenticação | Não (público) | Sim (ADMIN/BARBER com shop ownership) |
| Vinculado a loja | Não | Sim (`shopId`) |
| Usado para agendamento | Não diretamente | Sim (`customerId`) |
| Pode agendar sem conta | N/A (não é usado para agendar) | Sim |

---

## 3. Fluxo de Agendamento do Cliente

### 3.1 O agendamento exige criação de conta Better Auth?

**Não.** O agendamento (`appointment.create`) requer apenas um `customerId` que aponta para um registro `Customer`. Esse registro pode ser criado pelo funcionário da barbearia sem que o cliente tenha qualquer conta no sistema.

### 3.2 Fluxo completo (ponta a ponta)

```
1. Funcionário (BARBER/ADMIN) acessa o sistema
2. Funcionário cadastra cliente: nome + telefone → customer.create
3. Funcionário lista serviços → service.list
4. Funcionário lista profissionais → shop.getProfessionals
5. Funcionário gera slots disponíveis → appointment.getAvailableSlots
6. Funcionário escolhe serviço, profissional, data, horário
7. Funcionário cria agendamento → appointment.create
8. Cliente recebe atendimento presencialmente
9. Funcionário finaliza agendamento → appointment.updateStatus (CONFIRMED → IN_PROGRESS → COMPLETED)
```

### 3.3 Campos usados no agendamento

| Campo | Origem | Obrigatório |
|-------|--------|-------------|
| `customerId` | Registro `Customer` existente | Sim |
| `serviceId` | Registro `Service` existente | Sim |
| `professionalId` | Registro `Professional` existente | Sim |
| `startAt` | Data/hora escolhida | Sim |
| `promoCodeId` | Código promocional opcional | Não |

### 3.4 Validações no agendamento

- Antecedência mínima: 2 horas
- Antecedência máxima: 30 dias
- Conflito de horário com outro agendamento
- Profissional deve pertencer à mesma loja do cliente
- Horário deve estar dentro do `workingHours` do profissional
- Cliente não pode estar bloqueado (3+ no-shows)

---

## 4. Fluxo de Criação de Barbearia (Onboarding do Proprietário)

### 4.1 Estado atual

**Não existe endpoint público para criação de loja.** O router `shop.ts` contém apenas:

- `getSettings`, `updateSettings`, `getProfessionals`, `createProfessional`, `getSetupStatus`, `getUserShops`

Não há `shop.create`.

### 4.2 Como uma loja é criada atualmente

Uma loja só pode ser criada por intervenção direta no banco de dados:

1. Criar um `User` com `role = ADMIN` via `auth.createUser` (requer outro ADMIN)
2. Inserir um registro `Shop` com `ownerId` apontando para o `user.id` do administrador
3. O administrador então pode acessar a loja via `getUserShops`

### 4.3 Como o proprietário recebe acesso

O proprietário é um usuário `ADMIN` cujo `id` está em `shop.ownerId`. Não há fluxo de cadastro self-service para proprietário.

### 4.4 Como o primeiro profissional é associado

Via `shop.createProfessional` (requer `shops:write` + shop ownership). Pode vincular opcionalmente a um `userId` existente (um usuário BARBER).

### 4.5 Dependência de seed/intervenção manual

**Sim, depende inteiramente de intervenção manual.** Não existe `prisma/seed.ts` no repositório. Não há endpoint de onboarding para proprietário cadastrar sua barbearia.

### 4.6 Adequação para homologação inicial

**Não adequado para onboarding self-service.** Um novo proprietário não pode se cadastrar e criar sua barbearia pelo sistema. Isso impede o fluxo esperado de cadastro de novo proprietário sem acesso direto ao banco de dados.

**Correção mínima necessária (requer autorização):** Criar endpoint `shop.create` (CSRF + ADMIN) que permite a um ADMIN criar uma loja e se tornar seu proprietário.

---

## 5. Fluxo do Cliente Final (experiência do usuário)

O cliente final **não acessa o sistema web** do Navio Barber 2.0. Toda a interação é presencial na barbearia:

1. Cliente chega à barbearia
2. Funcionário cadastra o cliente (nome + telefone) se for novo
3. Funcionário escolhe serviço e profissional
4. Funcionário escolhe data e horário disponíveis
5. Funcionário cria o agendamento
6. Cliente recebe atendimento
7. Funcionário finaliza o agendamento

O cliente não precisa:
- Criar conta com senha
- Acessar o site/app
- Confirmar e-mail
- Fazer login

---

## 6. Diagrama de Fluxo

```
+-------------------+      +-------------------+      +-------------------+
|  Funcionário      |      |   Sistema         |      |  Cliente          |
|  (BARBER/ADMIN)   |      |                   |      |  (presencial)     |
+-------------------+      +-------------------+      +-------------------+
         |                           |                           |
         |-- cadastra cliente        |                           |
         |   (nome + telefone)       |                           |
         |-------------------------->|                           |
         |                           |-- cria Customer           |
         |                           |                           |
         |-- lista serviços          |                           |
         |-------------------------->|                           |
         |                           |-- retorna serviços        |
         |                           |-------------------------->|
         |                           |                           |
         |-- gera slots              |                           |
         |   (serviço + prof + data) |                           |
         |-------------------------->|                           |
         |                           |-- valida workingHours     |
         |                           |-- retorna slots           |
         |                           |-------------------------->|
         |                           |                           |
         |-- escolhe slot e confirma |                           |
         |-------------------------->|                           |
         |                           |-- cria Appointment        |
         |                           |                           |
         |                           |                           |-- comparece ao atendimento
         |                           |                           |
         |-- finaliza (COMPLETED)    |                           |
         |-------------------------->|                           |
         |                           |                           |
```

---

## 7. Pontos de Atenção para Homologação

| Item | Status | Observação |
|------|--------|------------|
| Cliente cadastra com nome+telefone | ✅ | `customer.create` aceita apenas `fullName` e `phone` |
| Cliente não precisa de senha | ✅ | `Customer` não tem senha; autenticação é via funcionário |
| Agendamento sem conta Better Auth | ✅ | `customerId` é suficiente; `User` não necessário |
| Criação de loja sem endpoint | ❌ | Requer intervenção manual no DB |
| Primeiro administrador | ❌ | Requer outro ADMIN existente ou inserção direta no DB |
| Onboarding self-service | ❌ | Não disponível |

---

## 8. Veredito

O fluxo de cliente está **adequado para homologação funcional inicial** desde que:

1. Um proprietário/admin já exista no banco (criado manualmente)
2. A loja já esteja criada no banco (criada manualmente)
3. Um funcionário (BARBER) esteja associado à loja

O fluxo não suporta onboarding self-service de novos proprietários sem intervenção direta no banco de dados.

---

**Fim do relatório de fluxo de cliente e onboarding**
