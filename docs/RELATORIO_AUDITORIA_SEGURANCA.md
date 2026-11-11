# Relatório de Auditoria de Segurança — Navio Barber 2.0

**Data:** 2026-11-07  
**Escopo:** Auditoria estática de código-fonte (não executado)  
**Metodologia:** Revisão manual de arquivos-fonte, variáveis de ambiente, schema Prisma e infraestrutura  
**Status:** Relatório final  

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Arquivos analisados | 15 |
| Total de vulnerabilidades | 19 |
| Críticas | 1 |
| Altas | 8 |
| Médias | 6 |
| Baixas | 4 |

### Classificação por gravidade

- **CRITICAL (1):** Senha de usuário armazenada em texto plano no banco de dados
- **HIGH (8):** IDOR (Insecure Direct Object Reference) em múltiplos endpoints, endpoints públicos sem autenticação, ausência de validação de propriedade de recurso
- **MEDIUM (6):** Credenciais hardcoded em `.env.example`, ausência de validação de secret, sem CSRF, sem MFA/2FA, exposição de informações internas
- **LOW (4):** Logs de query em desenvolvimento, busca sem sanitização, logger expõe detalhes em dev, cookie `secure` apenas em produção

---

## Vulnerabilidades Detalhadas

### CRITICAL — 1 vulnerabilidade

#### C-01: Senha armazenada em texto plano

- **Arquivo:** `apps/api/src/routers/auth.ts:41`
- **Descrição:** No procedimento `register`, o campo `passwordHash` recebe diretamente `input.password` sem qualquer hash (bcrypt, argon2, etc.).
- **Impacto:** Se o banco de dados for comprometido, todas as senhas de usuários ficam imediatamente expostas em texto claro, permitindo takeover de contas e reutilização em outros serviços.
- **Recomendação:** Aplicar hash com bcrypt ou argon2 antes de persistir. Nunca armazenar senha em texto plano.

```ts
// Antes (vulnerável)
passwordHash: input.password,

// Depois (corrigido)
passwordHash: await bcrypt.hash(input.password, 12),
```

---

### HIGH — 8 vulnerabilidades

#### H-01: IDOR em dashboard getSummary — shopId derivado do userId

- **Arquivo:** `apps/api/src/routers/dashboard.ts:17`
- **Descrição:** O parâmetro `shopId` da consulta é definido como `input.userId`, sem verificar se o usuário autenticado (`ctx.session.user`) pertence àquela loja ou se `userId` é de fato o ID do usuário logado. Um usuário pode consultar dados de qualquer loja passando um `userId` arbitrário.
- **Impacto:** Exposição de dados de agendamentos, clientes, receita e ocupação de qualquer barbearia.
- **Recomendação:** Validar que o `shopId` consultado pertence ao usuário autenticado através de junção com a tabela User/Shop.

#### H-02: IDOR em dashboard getUpcoming — shopId derivado do userId

- **Arquivo:** `apps/api/src/routers/dashboard.ts:80`
- **Descrição:** Mesmo problema de H-01 no endpoint `getUpcoming`. O `shopId` é tomado diretamente do input sem validação de propriedade.
- **Impacto:** Exposição de agendamentos futuros de qualquer loja.
- **Recomendação:** Validar propriedade do shop pelo usuário autenticado.

#### H-03: IDOR em appointment getByPeriod — shopId = userId, endpoint público

- **Arquivo:** `apps/api/src/routers/appointment.ts:310-330`
- **Descrição:** Endpoint `getByPeriod` é `publicProcedure` (não requer autenticação) e usa `shopId: input.userId` sem qualquer validação de propriedade. Qualquer pessoa pode consultar agendamentos de qualquer loja.
- **Impacto:** Exposição total de agendamentos, clientes e serviços de qualquer barbearia, sem autenticação.
- **Recomendação:** Tornar `protectedProcedure` e validar que o `shopId` pertence ao usuário autenticado.

#### H-04: Falta de validação de propriedade em appointment create

- **Arquivo:** `apps/api/src/routers/appointment.ts:58-160`
- **Descrição:** O procedimento `create` deriva `shopId` do `customer.shopId` (linha 147) sem verificar se o usuário autenticado (`ctx.session.user.id`) tem permissão para criar agendamentos naquela loja.
- **Impacto:** Usuário pode criar agendamentos em nome de qualquer loja/cliente.
- **Recomendação:** Verificar que o usuário autenticado possui vínculo com o `shopId` do cliente antes de criar o agendamento.

#### H-05: Falta de validação de propriedade em appointment updateStatus

- **Arquivo:** `apps/api/src/routers/appointment.ts:162-198`
- **Descrição:** O procedimento `updateStatus` altera o status de um agendamento por ID sem verificar se o usuário autenticado pertence à loja do agendamento.
- **Impacto:** Usuário pode cancelar, confirmar ou finalizar agendamentos de qualquer loja.
- **Recomendação:** Validar propriedade do agendamento (`appointment.shownId` === shop do usuário) antes da alteração.

#### H-06: Falta de validação de propriedade em appointment cancel

- **Arquivo:** `apps/api/src/routers/appointment.ts:200-241`
- **Descrição:** Mesmo problema de H-05 para cancelamento de agendamentos.
- **Impacto:** Cancelamento não autorizado de agendamentos de qualquer loja.
- **Recomendação:** Validar propriedade do agendamento antes do cancelamento.

#### H-07: Falta de validação de propriedade em appointment reschedule

- **Arquivo:** `apps/api/src/routers/appointment.ts:243-308`
- **Descrição:** Mesmo problema de H-05 para remarcação de agendamentos.
- **Impacto:** Remarcação não autorizada de agendamentos de qualquer loja.
- **Recomendação:** Validar propriedade do agendamento antes da remarcação.

#### H-08: Endpoints de cliente públicos sem autenticação

- **Arquivo:** `apps/api/src/routers/customer.ts:7` (list) e `:36` (getById)
- **Descrição:** Os procedimentos `list` e `getById` são `publicProcedure`, não requerendo autenticação. `getById` expõe dados do cliente incluindo histórico de agendamentos (últimos 10).
- **Impacto:** Exposição de dados pessoais de clientes (nome, telefone, email, histórico de atendimentos) sem qualquer autenticação.
- **Recomendação:** Tornar ambos `protectedProcedure` e validar que o usuário tem acesso à `shopId` do cliente.

---

### MEDIUM — 6 vulnerabilidades

#### M-01: Credenciais hardcoded no .env.example

- **Arquivo:** `.env.example:6`
- **Descrição:** String de conexão do banco contém usuário e senha fixos: `postgresql://navio_barber:navio_barber_dev@localhost:5432/navio_barber`.
- **Impacto:** Se o arquivo `.env` for baseado neste exemplo e commitado, credenciais de banco ficam expostas no controle de versão.
- **Recomendação:** Remover credenciais fixas. Usar placeholders como `postgresql://USER:PASSWORD@localhost:5432/DB`.

#### M-02: Placeholders de chave privada Firebase no .env.example

- **Arquivo:** `.env.example:20-22`
- **Descrição:** Campos `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` e `FIREBASE_PRIVATE_KEY` contêm valores de exemplo que parecem credenciais reais.
- **Impacto:** Incentiva o uso de credenciais de exemplo em produção ou exposição acidental.
- **Recomendação:** Usar valores claramente marcados como placeholder (ex: `seu-projeto-id-aqui`).

#### M-03: BETTER_AUTH_SECRET sem validação de força

- **Arquivo:** `src/auth/better-auth.ts:10`, `.env.example:16`
- **Descrição:** O secret é lido de `process.env.BETTER_AUTH_SECRET` sem validação de comprimento mínimo ou complexidade. O `.env.example` sugere gerar com `openssl rand -base64 32` mas não valida se o valor fornecido é adequado.
- **Impacto:** Secret fraco facilita forjamento de sessões JWT.
- **Recomendação:** Validar comprimento mínimo do secret na inicialização da aplicação.

#### M-04: Ausência de proteção CSRF

- **Arquivo:** `src/auth/better-auth.ts` (configuração de cookies)
- **Descrição:** Não há configuração de proteção CSRF (Cross-Site Request Forgery) para cookies de sessão. `sameSite: "lax"` oferece proteção parcial mas não completa para estado mutante.
- **Impacto:** Possibilidade de ataques CSRF em operações de estado mutante (login, registro, agendamento).
- **Recomendação:** Implementar tokens CSRF ou usar `sameSite: "strict"` onde apropriado, além de headers de origem.

#### M-05: Ausência de MFA/2FA

- **Arquivo:** `src/auth/better-auth.ts:13-18`
- **Descrição:** A configuração `emailAndPassword` não oferece autenticação de dois fatores. `requireEmailVerification: false` significa que não há verificação de email obrigatória.
- **Impacto:** Contas protegidas apenas por senha, vulneráveis a credential stuffing e phishing.
- **Recomendação:** Implementar 2FA (TOTP ou SMS) e exigir verificação de email no cadastro.

#### M-06: Registro de usuário aceita shopId arbitrário

- **Arquivo:** `apps/api/src/routers/customer.ts:53-89`
- **Descrição:** O procedimento `create` de cliente aceita `shopId` do input sem verificar se o usuário autenticado tem vínculo com aquela loja. Um funcionário de uma barbearia pode criar clientes em outra barbearia.
- **Impacto:** Contaminação de dados entre lojas, violação de isolamento multi-tenant.
- **Recomendação:** Validar que `ctx.session.user.shopId` corresponde ao `input.shopId`.

---

### LOW — 4 vulnerabilidades

#### L-01: Query log em desenvolvimento expõe dados

- **Descrição:** Logs de consulta ao banco em ambiente de desenvolvimento podem expor dados sensíveis de clientes e agendamentos.
- **Recomendação:** Desabilitar query log em produção e mascarar dados sensíveis em logs.

#### L-02: Busca de cliente por telefone/nome sem sanitização

- **Arquivo:** `apps/api/src/routers/customer.ts:20-26`
- **Descrição:** O campo `search` é usado diretamente em `contains` do Prisma. Embora o Prisma use parâmetros parametrizados (prevenindo SQL injection clássico), não há limite de tamanho ou sanitização do termo de busca.
- **Impacto:** Possível abuso para enumeração de clientes ou ataques de negação de serviço via buscas pesadas.
- **Recomendação:** Adicionar limite de tamanho ao campo `search` e paginação nos resultados.

#### L-03: Logger expõe detalhes internos em desenvolvimento

- **Descrição:** `loggerLink` expõe detalhes de requisições/respostas em ambiente de desenvolvimento, incluindo cabeçalhos e payloads.
- **Recomendação:** Desabilitar loggerLink em produção e sanitizar dados sensíveis (senhas, tokens) dos logs.

#### L-04: Cookie secure apenas em produção

- **Arquivo:** `src/auth/better-auth.ts:46`
- **Descrição:** `secure: process.env.NODE_ENV === "production"` — cookies de sessão não são marcados como `Secure` em desenvolvimento, podendo ser transmitidos em texto claro.
- **Recomendação:** Usar `Secure` em todos os ambientes que usem HTTPS, ou forçar HTTPS em desenvolvimento.

---

## Arquivos Afetados

| Arquivo | Vulnerabilidades | Gravidade |
|---------|-----------------|-----------|
| `apps/api/src/routers/auth.ts` | C-01 | CRITICAL |
| `apps/api/src/routers/dashboard.ts` | H-01, H-02 | HIGH |
| `apps/api/src/routers/appointment.ts` | H-03, H-04, H-05, H-06, H-07 | HIGH |
| `apps/api/src/routers/customer.ts` | H-08, M-06, L-02 | HIGH, MEDIUM, LOW |
| `src/auth/better-auth.ts` | M-03, M-04, M-05, L-04 | MEDIUM, LOW |
| `.env.example` | M-01, M-02 | MEDIUM |

---

## Recomendações Prioritárias

### Imediato (antes de qualquer implantação)

1. **Corrigir C-01:** Implementar hash de senha (bcrypt/argon2) em `apps/api/src/routers/auth.ts:41`
2. **Corrigir H-01 a H-07:** Adicionar validação de propriedade de recurso (shop/customer/appointment) em todos os endpoints do dashboard e appointment routers
3. **Corrigir H-08:** Tornar `list` e `getById` do customer router `protectedProcedure` com validação de shop
4. **Corrigir M-01 e M-02:** Remover credenciais hardcoded do `.env.example`

### Curto prazo

5. **Adicionar rate limiting** em endpoints de autenticação (login, register)
6. **Validar `BETTER_AUTH_SECRET`** na inicialização da aplicação
7. **Implementar CSRF protection** para operações de estado mutante
8. **Implementar verificação de email obrigatória** no cadastro

### Médio prazo

9. **Implementar MFA/2FA** para contas de administrador
10. **Sanitizar e limitar** campos de busca e entrada do usuário
11. **Desabilitar loggerLink e query log** em produção

---

## Limitações da Auditoria

- **Auditoria estática apenas:** O código não foi executado. Não foi possível validar comportamento em runtime.
- **Prisma não validado:** `npx prisma validate` falhou com `prisma@8.0.0-rc.33` ("No command registered for `validate`"). O schema não foi validado contra um banco real.
- **Docker não disponível:** Não foi possível validar o `docker-compose.yml` contra containers reais.
- **`npm audit` não executado:** Não houve análise de vulnerabilidades em dependências de terceiros (npm packages).
- **lgpd-skills CLI não instalado:** Não houve verificação automatizada de compliance LGPD.
- **OpenCode não autenticado:** Não foi possível usar ferramentas de análise automatizada adicional.
- **GEMINI_API_KEY não persistida:** Não foi possível usar modelos de IA para análise complementar.
- **Sem acesso à rede:** Não foi possível instalar ferramentas adicionais de auditoria.

---

## Escopo de Arquivos Analisados

1. `packages/auth/src/index.ts`
2. `packages/database/src/index.ts`
3. `apps/api/src/index.ts`
4. `apps/api/src/context/index.ts`
5. `apps/api/src/routers/_app.ts`
6. `apps/api/src/routers/auth.ts`
7. `apps/api/src/routers/appointment.ts`
8. `apps/api/src/routers/service.ts`
9. `apps/api/src/routers/customer.ts`
10. `apps/api/src/routers/dashboard.ts`
11. `apps/api/src/routers/shop.ts`
12. `apps/web/src/app/layout.tsx`
13. `apps/web/src/app/page.tsx`
14. `apps/web/src/app/login/page.tsx`
15. `apps/web/src/lib/trpc.ts`
16. `prisma/schema.prisma`
17. `.env.example`
18. `docker-compose.yml`
19. `src/auth/better-auth.ts`
20. `.github/workflows/ci.yml`

---

**Classificação geral:** O código apresenta vulnerabilidades críticas e altas que devem ser corrigidas antes de qualquer implantação em produção. O isolamento multi-tenant (validação de propriedade de shop) é a falha sistêmica mais grave, afetando múltiplos endpoints.
