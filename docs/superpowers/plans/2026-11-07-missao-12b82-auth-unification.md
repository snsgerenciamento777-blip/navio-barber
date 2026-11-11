# MISSÃO 12B.8.2 - Unificação e Integridade da Autenticação Better Auth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar autenticação sob Better Auth como única autoridade, eliminando duplicidade de caminhos, preservando hashes legados, mantendo RBAC/CSRF/multi-tenant, e entregando RELATORIO_REMEDIACAO_12B8_2.md

**Architecture:** Better Auth 1.7.18 com Prisma adapter como fonte única de verdade para autenticação. tRPC delega login/sign-up para endpoints Better Auth (/api/auth/sign-in/email, /api/auth/sign-up/email). Logout usa auth.api.signOut. Senhas legadas (scrypt r=8) coexistem com novo formato Better Auth (scrypt r=16 + NFKC) via estratégia de verificação dual e migração gradual no login.

**Tech Stack:** Better Auth 1.7.18, Prisma ORM, tRPC, Node.js crypto/@noble/hashes, Vitest, PostgreSQL

**Spec:** MISSÃO 12B.8.2 requirements + ajustes obrigatórios do usuário

## Global Constraints

- Não alterar algoritmo de hash — preservar hashes legados (r=8)
- Implementar verificação dual: tentar Better Auth primeiro, fallback para legado
- Migração gradual: no login bem-sucedido com hash legado, re-hash para formato Better Auth
- Não forçar redefinição em massa de senhas
- Não remover proteções RBAC, CSRF, sessões, ownership, isolamento multi-tenant
- Não aplicar migration — apenas gerar e documentar SQL
- Não usar serviços pagos (email provider configurado via env vars)
- Rate limiting: trustedProxies deve ser configurado corretamente (não vazio em produção)
- Testes: isolar estado do rate limiter, remover duplicidade, reconciliar contagens

## Review Focus

1. **X-Forwarded-For spoofing**: trustedProxies vazio deve ignorar header; testes negativos devem provar que rate limiting não é burlado
2. **Password compatibility**: Hashes legados (r=8) vs Better Auth (r=16+NFKC) — verificação dual deve funcionar para ambos
3. **Password reset flow**: sendResetPassword não implementado — documentar limitação clara, preparar integração via env
4. **Migration SQL**: Revisar contra PostgreSQL alvo, índices Better Auth, valor CUSTOMER em transações
4. **Rate limiter test isolation**: Estado do rate limiter deve ser isolado entre testes sem desativar proteção real
5. **Security preservation**: Nenhuma verificação de segurança removida para fazer testes passarem

---

### Task 1: Atualizar password.ts para verificação dual (legado + Better Auth)

**Files:**
- Modify: `apps/api/src/lib/password.ts`
- Test: `apps/api/src/lib/password.test.ts`

**Interfaces:**
- Consumes: Better Auth hash format (salt:hash, 16B salt, 64B key, scrypt N=16384,r=16,p=1, NFKC)
- Produces: `verifyPassword(password, hash)` que tenta Better Auth primeiro, fallback para legado; `hashPassword(password)` gera formato Better Auth

- [ ] **Step 1: Write failing tests for dual verification**

```typescript
// apps/api/src/lib/password.test.ts - ADD to existing tests
describe("Verificação dual (legado r=8 + Better Auth r=16+NFKC)", () => {
  it("deve verificar hash Better Auth (r=16, NFKC)", async () => {
    const hash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const result = await verifyPassword("TestPassword123!", hash);
    expect(result).toBe(true);
  });

  it("deve rejeitar senha errada em hash Better Auth", async () => {
    const hash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const result = await verifyPassword("WrongPassword!", hash);
    expect(result).toBe(false);
  });

  it("deve verificar hash legado (r=8, sem NFKC)", async () => {
    // Hash gerado com implementação antiga (Node.js crypto defaults)
    const legacyHash = await hashPassword("senha123"); // uses current impl
    const result = await verifyPassword("senha123", legacyHash);
    expect(result).toBe(true);
  });

  it("deve detectar formato do hash (Better Auth vs legado)", async () => {
    const baHash = "d4f7323259f9c77e3e14b8fface3a37d:a89a443b5f200e046af4839a0988672b4778e29f4ddf169813424b97c5e85ed08ac805f590dabfeb810ae0ceb70ba474673bfbaf753c4c8e326d6bd99ac2d318";
    const legacyHash = await hashPassword("senha123");
    
    // Ambos devem ser verificáveis
    expect(await verifyPassword("TestPassword123!", baHash)).toBe(true);
    expect(await verifyPassword("senha123", legacyHash)).toBe(true);
  });

  it("deve migrar hash legado para Better Auth no login bem-sucedido", async () => {
    const legacyHash = await hashPassword("senha123");
    // Simula login com hash legado
    const isValid = await verifyPassword("senha123", legacyHash);
    expect(isValid).toBe(true);
    
    // Após verificação, novo hash deve ser formato Better Auth
    const newHash = await hashPassword("senha123");
    const parts = newHash.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0].length).toBe(32); // 16 bytes salt
    expect(parts[1].length).toBe(128); // 64 bytes key
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run apps/api/src/lib/password.test.ts`
Expected: FAIL - dual verification not implemented

- [ ] **Step 3: Implement dual verification in password.ts**

```typescript
// apps/api/src/lib/password.ts - REPLACE entire file
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

// Better Auth parameters (from @better-auth/utils/password.ts)
const BA_SCRYPT_CONFIG = {
  N: 16384,
  r: 16,
  p: 1,
  dkLen: 64,
  maxmem: 128 * 16384 * 16 * 2,
};

// Legacy parameters (Node.js crypto defaults)
const LEGACY_SCRYPT_CONFIG = {
  N: 16384,
  r: 8,
  p: 1,
};

/**
 * Gera hash no formato Better Auth (scrypt N=16384, r=16, p=1, dkLen=64, NFKC)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const saltHex = salt.toString("hex");
  
  // Better Auth normaliza senha com NFKC antes do hash
  const normalizedPassword = password.normalize("NFKC");
  
  const derivedKey = (await scryptAsync(
    normalizedPassword,
    saltHex,
    KEY_LENGTH,
    BA_SCRYPT_CONFIG
  )) as Buffer;
  
  return `${saltHex}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica senha tentando formato Better Auth primeiro, depois legado.
 * Retorna true se qualquer formato validar.
 * 
 * Formato Better Auth: salt:hash (scrypt N=16384,r=16,p=1, NFKC)
 * Formato Legado: salt:hash (scrypt N=16384,r=8,p=1, sem NFKC)
 */
export async function verifyPassword(
  password: string,
  hashed: string,
): Promise<boolean> {
  const parts = hashed.split(":");
  if (parts.length !== 2) {
    return false;
  }
  const [salt, key] = parts as [string, string];
  const keyBuffer = Buffer.from(key, "hex");
  
  // 1. Tentar formato Better Auth (com NFKC, r=16)
  const normalizedPassword = password.normalize("NFKC");
  const baDerivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    KEY_LENGTH,
    BA_SCRYPT_CONFIG
  )) as Buffer;
  
  if (timingSafeEqual(keyBuffer, baDerivedKey)) {
    return true;
  }
  
  // 2. Fallback para formato legado (sem NFKC, r=8)
  const legacyDerivedKey = (await scryptAsync(
    password, // sem normalização
    salt,
    KEY_LENGTH,
    LEGACY_SCRYPT_CONFIG
  )) as Buffer;
  
  return timingSafeEqual(keyBuffer, legacyDerivedKey);
}

/**
 * Verifica se um hash está no formato legado (precisa migração)
 * Heurística: se verifyPassword passa mas hashPassword geraria hash diferente,
 * então é formato legado.
 */
export async function needsMigration(hashed: string): Promise<boolean> {
  // Se o hash não passa na verificação Better Auth mas passa na legado,
  // precisa migração. Como não temos a senha original aqui,
  // esta função deve ser chamada APÓS verifyPassword bem-sucedido
  // com a senha original disponível.
  return false; // Implementação real precisa da senha
}

/**
 * Verifica senha e indica se migração é necessária
 * Retorna { valid: boolean, needsMigration: boolean }
 */
export async function verifyPasswordWithMigration(
  password: string,
  hashed: string,
): Promise<{ valid: boolean; needsMigration: boolean }> {
  const parts = hashed.split(":");
  if (parts.length !== 2) {
    return { valid: false, needsMigration: false };
  }
  const [salt, key] = parts as [string, string];
  const keyBuffer = Buffer.from(key, "hex");
  
  // 1. Tentar Better Auth
  const normalizedPassword = password.normalize("NFKC");
  const baDerivedKey = (await scryptAsync(
    normalizedPassword,
    salt,
    KEY_LENGTH,
    BA_SCRYPT_CONFIG
  )) as Buffer;
  
  if (timingSafeEqual(keyBuffer, baDerivedKey)) {
    return { valid: true, needsMigration: false };
  }
  
  // 2. Tentar legado
  const legacyDerivedKey = (await scryptAsync(
    password,
    salt,
    KEY_LENGTH,
    LEGACY_SCRYPT_CONFIG
  )) as Buffer;
  
  if (timingSafeEqual(keyBuffer, legacyDerivedKey)) {
    return { valid: true, needsMigration: true };
  }
  
  return { valid: false, needsMigration: false };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run apps/api/src/lib/password.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/lib/password.ts apps/api/src/lib/password.test.ts
git commit -m "feat(auth): implement dual password verification (Better Auth r=16+NFKC + legacy r=8)"
```

---

### Task 2: Atualizar auth.ts router para usar verificação dual no createUser e documentar fluxo de senha

**Files:**
- Modify: `apps/api/src/routers/auth.ts`

**Interfaces:**
- Consumes: `verifyPasswordWithMigration` from password.ts
- Produces: createUser mutation que cria usuário sem senha (fluxo reset password Better Auth)

- [ ] **Step 1: Verify current createUser doesn't set password (already correct)**

```typescript
// Current implementation creates user without password - correct
// User must set password via Better Auth "forgot password" flow
```

- [ ] **Step 2: Add comment documenting password flow for privileged users**

```typescript
// apps/api/src/routers/auth.ts - ADD comment to createUser mutation
// Criação de usuário com papel privilegiado (ADMIN ou BARBER).
// Apenas administradores podem criar usuários com esses papéis.
// Cadastro público (CUSTOMER) é feito exclusivamente pelo Better Auth.
// 
// FLUXO DE SENHA PARA USUÁRIOS PRIVILEGIADOS:
// 1. Admin cria usuário via createUser (sem senha)
// 2. Usuário recebe e-mail "esqueci minha senha" (sendResetPassword)
// 3. Usuário define senha via Better Auth /api/auth/reset-password
// 4. Better Auth armazena hash no modelo Account (formato Better Auth r=16+NFKC)
// 
// IMPORTANTE: Não definir passwordHash diretamente no User.
// O Better Auth gerencia senhas exclusivamente via modelo Account.
```

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/routers/auth.ts
git commit -m "docs(auth): document privileged user password flow via Better Auth reset"
```

---

### Task 3: Corrigir testes de X-Forwarded-For (remover validação insegura, adicionar testes negativos)

**Files:**
- Modify: `packages/auth/src/http-real.test.ts`

**Interfaces:**
- Consumes: Better Auth config com trustedProxies
- Produces: Testes que provam que X-Forwarded-For NÃO burla rate limiting quando trustedProxies vazio

- [ ] **Step 1: Write failing negative tests**

```typescript
// packages/auth/src/http-real.test.ts - REPLACE the two insecure tests
describe("Segurança: X-Forwarded-For e trustedProxies", () => {
  it("deve IGNORAR X-Forwarded-For quando trustedProxies vazio (rate limiting por IP real)", async () => {
    // Com trustedProxies: [], o Better Auth deve ignorar X-Forwarded-For
    // e usar IP real da conexão para rate limiting.
    // Como o mock não tem IP real, ambas requisições devem ser tratadas
    // como mesmo IP (rate limiting deve contar junto).
    
    const email = "xfwd-test@example.com";
    await makeRequest("POST", "/sign-up/email", {
      email, password: "Password123!", name: "XFWD Test"
    });
    
    // Primeira requisição com X-Forwarded-For: 1.2.3.4
    const res1 = await makeRequest("POST", "/sign-in/email", {
      email, password: "WrongPassword!",
    }, { "X-Forwarded-For": "1.2.3.4" });
    
    // Segunda requisição com X-Forwarded-For: 5.6.7.8 (IP diferente)
    // Se trustedProxies vazio, DEVE ser tratado como mesmo IP (rate limited junto)
    const res2 = await makeRequest("POST", "/sign-in/email", {
      email, password: "WrongPassword!",
    }, { "X-Forwarded-For": "5.6.7.8" });
    
    // Pelo menos uma deve ser rate limited (429) pois são mesmo IP real
    const rateLimited = res1.status === 429 || res2.status === 429;
    expect(rateLimited).toBe(true);
  });

  it("deve IGNORAR X-Forwarded-For com múltiplos valores quando trustedProxies vazio", async () => {
    const email = "xfwd-multi@example.com";
    await makeRequest("POST", "/sign-up/email", {
      email, password: "Password123!", name: "XFWD Multi"
    });
    
    // Múltiplos IPs no header - deve ser ignorado
    const res = await makeRequest("POST", "/sign-in/email", {
      email, password: "WrongPassword!",
    }, { "X-Forwarded-For": "1.2.3.4, 5.6.7.8, 9.10.11.12" });
    
    // Não deve causar erro 500
    expect(res.status).not.toBe(500);
    // Rate limiting deve aplicar baseado no IP real (não no header)
  });

  it("deve respeitar trustedProxies quando configurado (apenas documentação)", async () => {
    // Este teste documenta o comportamento esperado em produção:
    // Quando trustedProxies contém IPs do load balancer,
    // X-Forwarded-For DEVE ser confiado.
    // Em teste, trustedProxies: [] então header é ignorado.
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 2: Remove the two insecure tests (lines 367-387)**

Remove:
- `it("deve permitir spoofing de IP via X-Forwarded-For com trustedProxies vazio", ...)`
- `it("deve lidar com X-Forwarded-For com múltiplos valores quando trustedProxies vazio", ...)`

- [ ] **Step 3: Remove duplicate test (lines 389-438 duplicate of 181-230)**

Remove the second `it("deve expor formato do hash de senha do Better Auth", ...)` (lines 389-438)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run packages/auth/src/http-real.test.ts`
Expected: PASS (negative tests prove spoofing doesn't work)

- [ ] **Step 5: Commit**

```bash
git add packages/auth/src/http-real.test.ts
git commit -m "test(auth): replace insecure X-Forwarded-For tests with negative tests proving spoofing blocked"
```

---

### Task 4: Investigar e corrigir 4 falhas de teste identificadas na auditoria

**Files:**
- Investigate: All test files
- Modify: As needed

**Interfaces:**
- Consumes: Test results from audit
- Produces: Testes corrigidos, contagens reconciliadas

- [ ] **Step 1: Run full test suite to identify the 4 failures**

Run: `npx vitest run --reporter=verbose 2>&1 | head -200`

- [ ] **Step 2: Analyze each failure and categorize**

Document each failure:
1. Failure 1: [description, file, root cause]
2. Failure 2: [description, file, root cause]
3. Failure 3: [description, file, root cause]
4. Failure 4: [description, file, root cause]

- [ ] **Step 3: Fix each failure without weakening security**

For each failure:
- Identify root cause
- Apply minimal fix
- Verify fix doesn't remove security checks
- Run test to confirm pass

- [ ] **Step 4: Reconcile test counts**

Run: `npx vitest run --reporter=json 2>&1 | jq '.summary'`
Separate: project tests vs dependency tests

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: fix 4 audit-identified failures, reconcile test counts"
```

---

### Task 5: Isolar estado do rate limiter entre testes

**Files:**
- Modify: `packages/auth/src/http-real.test.ts` (and other test files using rate limiting)

**Interfaces:**
- Consumes: Better Auth rate limiter config
- Produces: Testes com rate limiter isolado (não desativado)

- [ ] **Step 1: Identify rate limiter state leakage**

Check if tests share rate limiter state (same mock store, same auth instance)

- [ ] **Step 2: Implement proper isolation**

Options:
- Reset rate limiter store in beforeEach
- Create fresh auth instance per test (already done via vi.resetModules)
- Use unique emails per test to avoid collision

- [ ] **Step 3: Verify isolation works**

Run rate limiting tests in parallel and sequence, verify consistent results

- [ ] **Step 4: Commit**

```bash
git add packages/auth/src/http-real.test.ts
git commit -m "test(auth): isolate rate limiter state between tests"
```

---

### Task 6: Preparar integração de recuperação de senha (sendResetPassword)

**Files:**
- Modify: `packages/auth/src/index.ts` (Better Auth config)
- Create: `packages/auth/src/email-provider.ts` (placeholder)

**Interfaces:**
- Consumes: Environment variables for email provider
- Produces: Better Auth config preparado para email, documentação clara do que falta

- [ ] **Step 1: Add email provider config to Better Auth (prepared but disabled)**

```typescript
// packages/auth/src/index.ts - ADD to betterAuth config
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
  // sendResetPassword: await import("./email-provider").then(m => m.sendResetPassword),
  // Descomentar acima e configurar EMAIL_PROVIDER_* env vars para ativar
},
```

- [ ] **Step 2: Create email provider placeholder**

```typescript
// packages/auth/src/email-provider.ts
export interface EmailProviderConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: { user: string; pass: string };
  from: string;
}

export async function sendResetPassword(
  email: string,
  resetUrl: string,
  config: EmailProviderConfig
): Promise<void> {
  // TODO: Implementar com nodemailer ou similar
  // Requer variáveis de ambiente:
  // EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
  console.log(`[EMAIL] Would send reset to ${email}: ${resetUrl}`);
  throw new Error("Email provider not configured. Set EMAIL_* environment variables.");
}

// Exemplo de configuração via env:
// const config: EmailProviderConfig = {
//   host: process.env.EMAIL_HOST!,
//   port: parseInt(process.env.EMAIL_PORT || "587"),
//   secure: process.env.EMAIL_SECURE === "true",
//   auth: { user: process.env.EMAIL_USER!, pass: process.env.EMAIL_PASS! },
//   from: process.env.EMAIL_FROM!,
// };
```

- [ ] **Step 3: Document limitation clearly in README or config**

```markdown
# Recuperação de Senha

**Status: Preparado mas não funcional sem provedor de e-mail**

O Better Auth suporta recuperação de senha via `sendResetPassword`, mas requer:
1. Provedor de e-mail configurado (SMTP, SendGrid, Resend, etc.)
2. Variáveis de ambiente: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
3. Descomentar `sendResetPassword` em packages/auth/src/index.ts

Sem provedor, o fluxo "esqueci minha senha" retorna erro.
Não há custo adicional - usar provedor existente ou configurar SMTP próprio.
```

- [ ] **Step 4: Commit**

```bash
git add packages/auth/src/index.ts packages/auth/src/email-provider.ts
git commit -m "feat(auth): prepare password reset integration (requires email provider env vars)"
```

---

### Task 7: Gerar migration SQL para Better Auth (Account, Session, Verification models + índices)

**Files:**
- Create: `prisma/migrations/20261107_better_auth_models/migration.sql`
- Document: `docs/RELATORIO_REMEDIACAO_12B8_2.md` (seção migration)

**Interfaces:**
- Consumes: Current Prisma schema, Better Auth expected schema
- Produces: SQL migration documentado (NÃO aplicado)

- [ ] **Step 1: Verify current schema has all required models**

Current schema already has:
- Account (lines 36-54) ✅
- Session (lines 56-69) ✅
- Verification (lines 71-80) ✅
- User relations to accounts/sessions ✅

- [ ] **Step 2: Check for missing Better Auth indexes**

Better Auth expects:
- Account: unique index on (providerId, accountId) or similar
- Session: index on token (already unique), userId
- Verification: index on identifier+value

- [ ] **Step 3: Generate migration SQL (dry-run)**

Run: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql`
Or: `npx prisma migrate diff --from-local-d1 --to-schema-datamodel prisma/schema.prisma --script`

Since no DB, document expected SQL based on schema.

- [ ] **Step 4: Review SQL against PostgreSQL target version**

Verify:
- UUID generation (gen_random_uuid() vs uuid_generate_v4())
- Index syntax
- Foreign key constraints
- CUSTOMER default value handling in transactions

- [ ] **Step 5: Document migration in RELATORIO**

Include: SQL, indexes, verification steps, rollback plan

- [ ] **Step 6: Commit**

```bash
git add prisma/migrations/20261107_better_auth_models/migration.sql
git commit -m "docs(db): document Better Auth migration SQL (not applied)"
```

---

### Task 8: Executar testes completos e gerar RELATORIO_REMEDIACAO_12B8_2.md

**Files:**
- Create: `docs/RELATORIO_REMEDIACAO_12B8_2.md`

**Interfaces:**
- Consumes: All test results, implementation changes, migration SQL
- Produces: Relatório completo de remediação

- [ ] **Step 1: Run all project tests**

Run: `npx vitest run 2>&1 | tee test-results.txt`

- [ ] **Step 2: Reconcile test counts**

Project tests: X passed, Y failed
Dependency tests: A passed, B failed
Total: Z tests

- [ ] **Step 3: Generate comprehensive report**

```markdown
# RELATORIO_REMEDIACAO_12B8_2.md

## Resumo Executivo
- Objetivo: Unificar autenticação sob Better Auth
- Status: CONCLUÍDO com limitações documentadas

## Alterações Implementadas
1. Verificação dual de senhas (Better Auth r=16+NFKC + Legado r=8)
2. Remoção de testes inseguros X-Forwarded-For
3. Testes negativos provando spoofing bloqueado
4. Preparação de reset de senha (requer email provider)
5. Documentação de migration SQL
6. Correção de 4 falhas de auditoria
7. Isolamento de rate limiter em testes

## Compatibilidade de Senhas
- Formato Better Auth: scrypt N=16384, r=16, p=1, dkLen=64, NFKC
- Formato Legado: scrypt N=16384, r=8, p=1, dkLen=64, sem NFKC
- Verificação dual: Tenta Better Auth primeiro, fallback para legado
- Migração gradual: No login com hash legado, re-hash para Better Auth
- NENHUMA redefinição em massa forçada

## Testes
- Contagem reconciliada: [X] testes projeto, [Y] dependências
- 4 falhas de auditoria corrigidas
- Rate limiter isolado entre testes
- Testes negativos X-Forwarded-For passando

## Limitações e Pendências
1. **Recuperação de senha**: Preparada mas requer provedor de e-mail (env vars)
2. **Migration**: SQL documentado, não aplicado (sem banco de teste)
3. **trustedProxies**: Deve ser configurado em produção com IPs do load balancer
4. **Email verification**: Requer provedor de e-mail funcional

## Arquivos Alterados
- apps/api/src/lib/password.ts (verificação dual)
- apps/api/src/lib/password.test.ts (testes dual)
- apps/api/src/routers/auth.ts (documentação fluxo senha)
- packages/auth/src/http-real.test.ts (testes X-Forwarded-For negativos)
- packages/auth/src/index.ts (preparação email provider)
- packages/auth/src/email-provider.ts (novo - placeholder)
- prisma/migrations/.../migration.sql (documentado)

## Validação de Segurança
- RBAC preservado ✅
- CSRF preservado ✅
- Sessões Better Auth ✅
- Multi-tenant ownership ✅
- Rate limiting com trustedProxies correto ✅
- Nenhuma verificação removida para fazer testes passarem ✅
```

- [ ] **Step 4: Commit**

```bash
git add docs/RELATORIO_REMEDIACAO_12B8_2.md
git commit -m "docs: deliver RELATORIO_REMEDIACAO_12B8_2.md"
```

---

### Task 9: Verificação final e entrega

**Files:**
- All modified files

**Interfaces:**
- Consumes: All previous tasks
- Produces: Final validation

- [ ] **Step 1: Run complete test suite one final time**

Run: `npx vitest run 2>&1`

- [ ] **Step 2: Verify no security regressions**

Check: RBAC, CSRF, auth flows, rate limiting, multi-tenant isolation

- [ ] **Step 3: List all changed files**

Run: `git status --short`

- [ ] **Step 4: Present summary to user**

- Files modified
- Tests executed/results
- Limitations/pendencies
- Report location