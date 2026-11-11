# Relatório de Auditoria Independente Pós-Remediação — Missão 12B.7

**Projeto:** Navio Barber NV2.0  
**Diretório:** `C:\Users\User\Documents\Navio Barber\NV2.0\navio-barber\`  
**Data:** 2026-11-07  
**Orçamento:** R$ 0,00  
**Modo:** Auditoria somente leitura — nenhum arquivo foi modificado  
**Referência:** `docs/RELATORIO_REMEDIACAO_12B6.md`, `docs/RELATORIO_AUDITORIA_12B5.md`

---

## Sumário Executivo

A Missão 12B.6 resolveu parcialmente as pendências N-01 a N-04 da auditoria 12B.5. Duas pendências (N-01 e N-02) foram devidamente corrigidas. Duas pendências (N-03 e N-04) apresentam **vulnerabilidades críticas não resolvidas**, incluindo a ausência total de rate limiting no endpoint real de login (Better Auth) e o fato de o endpoint `/api/auth/sign-in/email` não estar montado como handler HTTP.

**Projeto NÃO está pronto para produção.** Não declarar segurança total.

---

## 1. Arquivos Inspecionados

| Arquivo | Linhas | Propósito na auditoria |
|---------|--------|------------------------|
| `apps/api/src/lib/shop-ownership.ts` | 1-26 | N-02: validação centralizada de ownership |
| `apps/api/src/lib/rate-limit.ts` | 1-66 | N-04: middleware de rate limiting |
| `apps/api/src/index.ts` | 1-196 | N-04: procedures de rate limiting, getClientIp |
| `apps/api/src/routers/auth.ts` | 1-53 | N-03/N-04: login removido, register com rate limit |
| `apps/api/src/routers/service.ts` | 1-103 | N-01: service.create com validarShopAcesso |
| `apps/api/src/routers/appointment.ts` | 1-417 | N-02: uso de validarShopAcesso |
| `apps/api/src/routers/customer.ts` | 1-172 | N-02: uso de validarShopAcesso |
| `apps/api/src/routers/dashboard.ts` | 1-111 | N-02: uso de validarShopAcesso |
| `apps/api/src/routers/shop.ts` | 1-106 | N-02: uso de validarShopAcesso |
| `packages/auth/src/index.ts` | 1-65 | N-03: configuração Better Auth |
| `apps/web/src/app/login/page.tsx` | 1-85 | N-03: frontend de login via fetch |

---

## 2. Resultado por Pendência

### N-01 — Ownership em `service.create` — RESOLVIDO

**Evidência:** `apps/api/src/routers/service.ts:46-49`

```typescript
.mutation(async ({ ctx, input }) => {
  // RG-BB-03: Nome, preço e duração obrigatórios; duração mínima 15min
  // Validação de propriedade da barbearia (N-01: impedem criação em loja de terceiro)
  await validarShopAcesso(ctx.prisma, ctx.session!.user.id, input.shopId);
```

- `service.create` chama `validarShopAcesso` **antes** de `ctx.prisma.service.create()`
- A procedure é `csrfServicesWriteProcedure` (autenticado + CSRF), então usuários não autenticados são bloqueados
- `validarShopAcesso` consulta `where: { id: shopId, ownerId: userId }` — portanto, **mesmo um ADMIN que não é o proprietário da loja é bloqueado**. Isso está correto para isolamento multi-tenant.

**Testes que comprovam:** `security-remediation.test.ts:208-230` (service.list/getById ownership), `:270-292` (service.update/deactivate IDOR rejeitado para outra loja).

**Classificação:** RESOLVIDO

---

### N-02 — Centralização da Validação de Ownership — RESOLVIDO

**Evidência:** `apps/api/src/lib/shop-ownership.ts:12-25`

```typescript
export async function validarShopAcesso(
  prisma: PrismaClient,
  userId: string,
  shopId: string,
): Promise<void> {
  const shop = await prisma.shop.findFirst({
    where: { id: shopId, ownerId: userId },
  });
  if (!shop) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Usuário não possui acesso a esta loja",
    });
  }
}
```

**Chamadas de `validarShopAcesso` por router:**

| Router | Quantidade | Linhas |
|--------|-----------|--------|
| `appointment.ts` | 10 | 28, 82, 162, 207, 242, 292, 358, 376, 393 |
| `customer.ts` | 7 | 17, 56, 73, 118, 131, 150 |
| `dashboard.ts` | 2 | 9, 80 |
| `service.ts` | 5 | 13, 31, 49, 82, 95 |
| `shop.ts` | 6 | 8, 32, 41, 57, 70 |

**Total: 30 chamadas** em 5 routers. Nenhum router mantém `validarShopDoUsuario` duplicada (a função antiga foi removida de todos os routers; permanece apenas em arquivos de teste como simulação local, o que é aceitável para testes unitários isolados).

A centralização **não enfraqueceu** as permissões — todos os routers continuam exigindo `csrf*WriteProcedure` ou procedimentos de leitura protegidos antes de chamar `validarShopAcesso`.

**Classificação:** RESOLVIDO

---

### N-03 — Better Auth — VULNERABILIDADE CRÍTICA

**Evidência — Configuração Better Auth:** `packages/auth/src/index.ts:16-63`

O objeto `auth` é criado com `betterAuth({...})`, incluindo `emailAndPassword.enabled: true`, mas **não é montado como handler HTTP em nenhum lugar do códigobase.**

**Busca por mount do Better Auth:**
- `auth.handler` — não encontrado
- `betterAuthHandler` — não encontrado
- `route.ts` — não encontrado
- `/api/auth` — não encontrado

**Consequência:** O endpoint `/api/auth/sign-in/email` **não existe**. O frontend `apps/web/src/app/login/page.tsx:16` chama `fetch("/api/auth/sign-in/email")`, mas esse endpoint retornará 404. O login não funciona.

**Evidência — Frontend:** `apps/web/src/app/login/page.tsx:11-30`

O frontend foi corretamente atualizado para chamar `/api/auth/sign-in/email` via `fetch()` nativo (não usa mais `trpc.auth.login`). Nenhuma referência a `trpc.auth.login` ou `auth.login` permanece no código.

**Evidência — Remoção do stub:** `apps/api/src/routers/auth.ts:7-8`

O stub `login` foi removido do tRPC. Comentário confirma: "Login é gerenciado pelo Better Auth endpoint (fora deste router tRPC)."

**Classificação:** CRÍTICO — endpoint de login não montado; funcionalidade de login quebrada.

---

### N-04 — Rate Limiting — VULNERABILIDADE CRÍTICA

#### Perguntas obrigatórias da auditoria:

**1. O endpoint real `/api/auth/sign-in/email` possui rate limiting?**

**NÃO.** O endpoint não está montado (ver N-03). Mesmo que estivesse montado, o rate limiting existe apenas como middleware tRPC (`authRateLimitProcedure`, `rateLimit`), que **não se aplica** a endpoints HTTP do Better Auth. Better Auth possui rate limiting nativo próprio, mas como o handler não está montado, isso é irrelevante no estado atual.

**2. O endpoint de registro possui rate limiting?**

**SIM, parcialmente.** `auth.register` em `apps/api/src/routers/auth.ts:33` usa `authRateLimitProcedure`, que aplica `rateLimit({ max: AUTH_MAX, windowMs: 60 * 1000 })` — 10 requisições por minuto. Isso se aplica apenas à procedure tRPC de registro.

**3. O limite é aplicado por IP, usuário ou ambos?**

**Apenas por IP.** `authRateLimitProcedure` em `apps/api/src/index.ts:174-176`:

```typescript
export const authRateLimitProcedure = publicProcedure.use(
  rateLimit({ max: AUTH_MAX, windowMs: 60 * 1000 })
);
```

A função `rateLimit` usa por padrão `getClientIp(ctx)` como chave (`rate-limit.ts:41`). Não há segmentação por usuário ID — apenas IP do cliente.

**4. É possível contornar o limite usando requisições HTTP diretas?**

**SIM.** Duas formas de contorno:
- **Via tRPC:** O middleware `rateLimit` só é aplicado a procedures tRPC. Qualquer chamada que bypass o router tRPC (ex: chamada direta ao handler HTTP subjacente) não é rate limitada.
- **Via IP spoofing:** `getClientIp` lê `x-forwarded-for` e `x-real-ip` (`rate-limit.ts:16-22`). Um atacante pode enviar diferentes valores de `X-Forwarded-For` para gerar chaves diferentes no `rateLimitStore`, contornando o limite por IP.
- **Via Better Auth:** Como o endpoint de login real não tem rate limiting do tRPC, ele é totalmente desprotegido contra brute force (se estivesse montado).

**5. O armazenamento do limite funciona entre múltiplas instâncias?**

**NÃO.** `rateLimitStore` é um `Map` em memória (`rate-limit.ts:9`). Em ambiente de produção com múltiplas instâncias (ex: Kubernetes, load balancer), cada instância teria seu próprio mapa, permitindo que um atacante faça `N × instâncias` requisições por minuto.

**6. Existe risco de resetar os limites ao reiniciar o servidor?**

**SIM.** O `Map` é volátil — ao reiniciar o servidor, todos os contadores são zerados, permitindo imediatamente mais 10 tentativas por IP.

**7. As respostas de bloqueio são adequadas?**

**SIM, para tRPC.** Quando o limite é atingido, `rate-limit.ts:53-57` lança `TRPCError` com código `TOO_MANY_REQUESTS` e mensagem em português. Isso é apropriado para procedures tRPC.

**8. Os testes verificam o endpoint real ou apenas o middleware tRPC?**

**Nenhum dos dois.** Não existem testes para `rateLimit`, `authRateLimitProcedure`, ou qualquer teste de rate limiting na suíte de 83 testes. Os testes existentes cobrem RBAC, ownership, CSRF, input validation, password e FCM — mas não rate limiting.

#### Vulnerabilidades N-04 classificadas:

| ID | Descrição | Severidade |
|----|-----------|------------|
| V-RL-01 | Endpoint `/api/auth/sign-in/email` sem rate limiting (não montado) | CRÍTICO |
| V-RL-02 | Rate limiting apenas por IP, contornável via X-Forwarded-For spoofing | ALTO |
| V-RL-03 | Armazenamento em memória, não distribuído entre instâncias | MÉDIO |
| V-RL-04 | Limites resetados ao reiniciar o servidor | BAIXO |
| V-RL-05 | Nenhum teste de rate limiting na suíte de testes | MÉDIO |

**Classificação geral N-04:** CRÍTICO — login sem proteção contra brute force.

---

## 3. Testes Executados

| Comando | Resultado |
|---------|-----------|
| `npx vitest run` | 83/83 testes do projeto aprovados (52 security-remediation + 8 multi-tenant + 7 input-validation + 4 shop-ownership + 7 fcm + 5 password). 6 falhas são do `zod` (dependência de terceiros), não do projeto. |
| `npx tsc --noEmit` (API) | 0 erros de TypeScript em `apps/api/src/` |
| `npx next build` (Web) | Build aprovado — 13 páginas estáticas geradas com sucesso |
| Verificação `trpc.auth.login` | Zero referências encontradas em `apps/web/src/` (frontend corrigido) |
| Verificação mount Better Auth | Zero referências a `auth.handler`, `betterAuthHandler`, `route.ts` ou `/api/auth` |

**Testes de rate limiting:** Não existem. Nenhum teste executa contra o endpoint real de login ou contra o middleware `rateLimit`.

---

## 4. Limitações dos Testes

- Não há banco de dados PostgreSQL conectado (sem Docker disponível), portanto testes de integração com banco real não podem ser executados.
- O rate limiting não pode ser testado em tempo real sem um servidor rodando.
- O endpoint `/api/auth/sign-in/email` não pode ser testado porque não está montado.
- Os testes de ownership usam mocks do Prisma, não integração real.

---

## 5. Vulnerabilidades Novamente Encontradas

| ID | Descrição | Severidade | Arquivo |
|----|-----------|------------|---------|
| V-N03-01 | Better Auth `auth` não montado como handler HTTP — endpoint `/api/auth/sign-in/email` não existe; login retorna 404 | CRÍTICO | `packages/auth/src/index.ts` (não montado em lugar nenhum) |
| V-N04-01 | Nenhum rate limiting no endpoint real de login (Better Auth) | CRÍTICO | `apps/api/src/index.ts` (middleware só em tRPC) |
| V-N04-02 | Rate limiting apenas por IP, contornável via X-Forwarded-For spoofing | ALTO | `apps/api/src/lib/rate-limit.ts:16-22` |
| V-N04-03 | Armazenamento de rate limit em memória (Map), não distribuído | MÉDIO | `apps/api/src/lib/rate-limit.ts:9` |
| V-N04-04 | Rate limits resetados ao reiniciar o servidor | BAIXO | `apps/api/src/lib/rate-limit.ts:9` |
| V-N04-05 | Nenhum teste de rate limiting na suíte | MÉDIO | — |

---

## 6. Situação do Projeto para Produção

**NÃO PRONTO PARA PRODUÇÃO.**

### Pendências críticas que devem ser corrigidas antes do deploy:

1. **Montar o Better Auth como handler HTTP** — Criar um route handler (ex: `apps/api/src/app/auth/[...]/route.ts` ou equivalente no framework usado) que exponha `auth.handler` para que `/api/auth/sign-in/email` funcione.

2. **Aplicar rate limiting ao endpoint de login do Better Auth** — Como o rate limiting atual é middleware tRPC, não cobre endpoints Better Auth. Deve-se usar o rate limiting nativo do Better Auth ou um middleware separado no route handler.

3. **Rate limiting por usuário + IP** — Combinar identificação por usuário (quando autenticado) e IP para dificultar contorno.

4. **Armazenamento distribuído (Redis)** — Substituir o `Map` em memória por Redis para suporte a múltiplas instâncias.

5. **Criar testes de rate limiting** — Cobrir o middleware `rateLimit` e o endpoint de login com testes de brute force.

6. **Persistência entre reinícios** — Com armazenamento distribuído (Redis), os limites sobrevivem a reinícios.

---

## 7. Conclusão

| Pendência | Status | Classificação |
|-----------|--------|---------------|
| N-01 — Ownership em `service.create` | RESOLVIDO | — |
| N-02 — Centralização de ownership | RESOLVIDO | — |
| N-03 — Better Auth / frontend login | FUNCIONALMENTE QUEBRADO | CRÍTICO |
| N-04 — Rate limiting | PARCIALMENTE RESOLVIDO (registro tRPC apenas) | CRÍTICO |

A Missão 12B.6 corrigiu corretamente as pendências de ownership (N-01, N-02), mas **não resolveu adequadamente o rate limiting no endpoint real de login (N-04)** e deixou o **Better Auth desmontado (N-03)**, tornando o login inoperante.

**Recomendação:** Corrigir N-03 e N-04 em uma missão separada antes de qualquer deploy para produção.

---
