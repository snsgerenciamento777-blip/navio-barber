# Security Audit Report — Navio Barber 2.0 (QUICK Profile)

**Run ID:** `sec-audit-2026-11-06-001`  
**Date:** 2026-11-06  
**Profile:** QUICK (coarsened ledger units, 1 hunter wave + 1 critic pass)  
**Target:** `C:\Users\User\Documents\Navio Barber\NV2.0\navio-barber`  
**Source Ref:** `61895eb` (initial commit, dirty worktree)  
**Auditor:** Cloudflare Security Audit Skill (via Claude Code)

---

## Executive Summary

| Metric | Count |
|--------|-------|
| **Total Findings** | 5 |
| **CRITICAL** | 1 |
| **HIGH** | 1 |
| **MEDIUM** | 2 |
| **LOW** | 1 |
| **INFORMATIONAL** | 0 |
| **NEEDS_VALIDATION** | 3 |

**Coverage:** Authentication, Authorization, API Keys/Secrets, tRPC Endpoints, Prisma/Database, Dependencies, Business Logic

---

## Findings by Severity

### 🔴 CRITICAL

#### FIND-001: Plaintext Password Storage in User Registration
**File:** `apps/api/src/routers/auth.ts:41`  
**Attack Class:** Sensitive Data Exposure / Authentication Bypass  
**Boundary:** Admin tRPC mutation (`adminProcedure`) → Prisma `user.create`  
**Principal:** Authenticated admin user (or any principal who can call the mutation)  
**Resource:** `User.passwordHash` column (PostgreSQL)  
**Result:** Plaintext passwords stored in database, readable by any database accessor

**Evidence:**
```typescript
// apps/api/src/routers/auth.ts:38-45
const user = await ctx.prisma.user.create({
  data: {
    email: input.email,
    passwordHash: input.password, // Em produção: hash com bcrypt  <-- BUG: not hashed!
    name: input.name,
    role: input.role,
  },
});
```

**Impact:** 
- Full account takeover for all registered users
- Credential stuffing across services (password reuse)
- Violates LGPD Art. 46 (security measures for personal data)
- Better Auth's own email/password flow expects hashed passwords — this bypasses it entirely

**Remediation:** Hash password with bcrypt/scrypt/argon2 before storage. Use Better Auth's `api.createUser` or hash via `bcrypt.hash(password, 12)`.

---

### 🟠 HIGH

#### FIND-002: Missing Authorization Check on `dashboard.getSummary` — Shop Access via Any `userId`
**File:** `apps/api/src/routers/dashboard.ts:6-71`  
**Attack Class:** Authorization Bypass / Cross-Tenant Data Access  
**Boundary:** Protected tRPC query (`protectedProcedure`) → Prisma queries scoped by `input.userId`  
**Principal:** Any authenticated user  
**Resource:** All shop data (appointments, customers, revenue) for arbitrary `shopId` passed as `userId`  
**Result:** Authenticated user can read dashboard data for any shop by supplying its ID

**Evidence:**
```typescript
// apps/api/src/routers/dashboard.ts:6-71
getSummary: protectedProcedure
  .input(z.object({ userId: z.string(), date: z.string().datetime().optional() }))
  .query(async ({ ctx, input }) => {
    const appointmentsToday = await ctx.prisma.appointment.findMany({
      where: { shopId: input.userId, ... },  // <-- No check that ctx.session.user owns this shop
      ...
    });
    // Similar for customers, revenue, upcoming appointments
  })
```

**Impact:**
- Cross-shop data leakage (appointments, customer PII, revenue)
- Business intelligence exposure to competitors
- Violates multi-tenancy isolation

**Remediation:** Derive `shopId` from `ctx.session.user.shops` (or a user→shop mapping) instead of accepting it as input. Add authorization middleware verifying shop ownership.

---

### 🟡 MEDIUM

#### FIND-003: `shop.getSettings` and `shop.getProfessionals` Are Public Procedures Exposing Shop Data
**File:** `apps/api/src/routers/shop.ts:6-15, 35-42`  
**Attack Class:** Information Disclosure / Reconnaissance  
**Boundary:** Public tRPC query (`publicProcedure`) → Prisma `shop.findUnique` / `professional.findMany`  
**Principal:** Unauthenticated actor  
**Resource:** Shop details (name, address, phone, email, category, logo), professional names  
**Result:** Enumeration of all shops and their staff via ID guessing

**Evidence:**
```typescript
// shop.ts:6-15
getSettings: publicProcedure
  .input(z.object({ shopId: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.prisma.shop.findUnique({ where: { id: input.shopId }, ... });
  }),
// shop.ts:35-42
getProfessionals: publicProcedure
  .input(z.object({ shopId: z.string(), isActive: z.boolean().optional() }))
  .query(async ({ ctx, input }) => {
    return ctx.prisma.professional.findMany({ where: { shopId: input.shopId, ... } });
  })
```

**Impact:**
- Shop enumeration and profiling
- Professional names harvestable for social engineering
- Low direct impact but aids targeted attacks

**Remediation:** Change to `protectedProcedure` or add rate-limiting + API key for public read access. If truly public (e.g., booking page), implement a separate public API with scoped fields.

---

#### FIND-004: `customer.list` and `customer.getById` Are Public Procedures Exposing Customer PII
**File:** `apps/api/src/routers/customer.ts:7-50`  
**Attack Class:** Information Disclosure / PII Exposure  
**Boundary:** Public tRPC query (`publicProcedure`) → Prisma `customer.findMany` / `customer.findUnique`  
**Principal:** Unauthenticated actor  
**Resource:** Customer full name, phone, email, birth date, preferences, appointment history  
**Result:** Full customer database enumeration via `shopId` guessing

**Evidence:**
```typescript
// customer.ts:7-34
list: publicProcedure
  .input(z.object({ shopId: z.string(), status: ..., search: ... }))
  .query(async ({ ctx, input }) => {
    return ctx.prisma.customer.findMany({ where: { shopId: input.shopId, ... } });
  }),
// customer.ts:36-50
getById: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.prisma.customer.findUnique({ where: { id: input.id }, include: { appointments: ... } });
  })
```

**Impact:**
- LGPD violation (Art. 7, 18 — lawful basis, data subject rights)
- Customer PII harvestable at scale
- Appointment history reveals behavioral patterns

**Remediation:** Require authentication (`protectedProcedure`). Scope results to authenticated user's shop. Add audit logging for customer data access.

---

### 🔵 LOW

#### FIND-005: `appointment.getAvailableSlots` and `appointment.getByPeriod` Are Public Procedures
**File:** `apps/api/src/routers/appointment.ts:11-56, 310-330`  
**Attack Class:** Information Disclosure / Business Logic Reconnaissance  
**Boundary:** Public tRPC query (`publicProcedure`) → Prisma `appointment.findMany`  
**Principal:** Unauthenticated actor  
**Resource:** Professional schedules, booked slots, appointment details (with customer/service/professional includes)  
**Result:** Schedule enumeration, capacity planning intelligence

**Evidence:**
```typescript
// appointment.ts:11-56
getAvailableSlots: publicProcedure
  .input(z.object({ date: z.string().datetime(), professionalId: z.string(), serviceId: z.string() }))
  .query(...)
// appointment.ts:310-330
getByPeriod: publicProcedure
  .input(z.object({ startDate: z.string().datetime(), endDate: z.string().datetime(), userId: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.prisma.appointment.findMany({ where: { shopId: input.userId, ... }, include: { customer: true, ... } });
  })
```

**Impact:**
- Competitive intelligence (booking density, popular services/times)
- Professional schedule exposure
- `getByPeriod` includes customer PII via `include: { customer: true }`

**Remediation:** Restrict to `protectedProcedure`. If public booking flow needed, create a dedicated public endpoint with minimal fields (no customer PII).

---

## Needs Validation (Blockers: Missing Deployment/Config Evidence)

| ID | Finding | Missing Evidence | Validation Plan |
|----|---------|------------------|-----------------|
| NV-001 | Cookie `secure` flag only in production | `NODE_ENV` value in deployed environment | Owner: confirm `NODE_ENV=production` in prod; test cookie attributes |
| NV-002 | Better Auth `baseURL` matches deployed origin | Deployed URL vs `BETTER_AUTH_URL` | Owner: verify no redirect/CSRF mismatch |
| NV-003 | Database `DATABASE_URL` uses TLS/SSL | Connection string in production | Owner: confirm `sslmode=require` or managed PG with enforced TLS |

---

## Coverage Statement (QUICK Profile)

| Surface | Boundary | Attack Classes Covered | Status |
|---------|----------|------------------------|--------|
| Authentication | Better Auth email/password, tRPC `login`/`register`/`me`/`logout` | Credential stuffing, plaintext storage, session fixation | ✅ Covered |
| Authorization | `protectedProcedure`, `adminProcedure`, shop-scoped queries | Horizontal/vertical privilege escalation, cross-tenant access | ✅ Covered |
| API Keys/Secrets | `.env.example`, `BETTER_AUTH_SECRET`, Firebase keys | Hardcoded secrets, weak generation | ✅ Covered (template only) |
| tRPC Endpoints | 6 routers × 26 procedures | Unauthorized access, input validation, PII exposure | ✅ Covered |
| Prisma/Database | 13 models, 6 enums, indexes, relations | Over-privileged access, missing constraints, audit logging | ✅ Covered |
| Dependencies | Root + 3 workspace packages | Known CVEs, supply chain | ⚠️ Partial (no `npm audit` run) |
| Business Logic | Appointment rules, customer blocking, no-show, setup flow | State machine bypass, race conditions, logic flaws | ✅ Covered |

**Gaps (QUICK profile limitation):** No dependency vulnerability scan (`npm audit`), no runtime testing, no prior-run comparison (first audit), no follow-up hunter wave (deferred: NV-001–003, dependency scan).

---

## Remediation Priority Order

1. **FIND-001 (CRITICAL)** — Hash passwords immediately; audit existing records
2. **FIND-002 (HIGH)** — Derive shopId from session; add ownership check
3. **FIND-003 (MEDIUM)** — Protect shop endpoints; add rate limits
4. **FIND-004 (MEDIUM)** — Protect customer endpoints; scope to session shop
5. **FIND-005 (LOW)** — Protect appointment endpoints; minimize public API surface
6. **NV-001–003** — Validate deployment config before production

---

## Limitations

- **QUICK profile**: Coarsened ledger units (surface × boundary × attack class), single hunter wave, single critic pass. Deferred findings marked `needs_validation`.
- **Static analysis only**: No sandboxed local execution, no `npm audit`, no fuzzing, no runtime penetration testing.
- **First run**: No prior coverage ledger or findings to carry forward.
- **Environment-dependent findings** (NV-001–003) require owner validation in deployed context.

---

## Appendix: Files Examined

- `prisma/schema.prisma` — Database schema, models, enums, indexes
- `packages/auth/src/index.ts` — Better Auth configuration
- `apps/api/src/index.ts` — tRPC context, procedures (`publicProcedure`, `protectedProcedure`, `adminProcedure`)
- `apps/api/src/routers/auth.ts` — Authentication endpoints
- `apps/api/src/routers/appointment.ts` — Appointment management
- `apps/api/src/routers/service.ts` — Service management
- `apps/api/src/routers/customer.ts` — Customer management
- `apps/api/src/routers/dashboard.ts` — Dashboard/summary endpoints
- `apps/api/src/routers/shop.ts` — Shop settings and professionals
- `apps/api/src/routers/_app.ts` — Router composition
- `.env.example` — Environment variable template
- `package.json` (root, api, web) — Dependency manifests

---

*Report generated by Cloudflare Security Audit Skill (QUICK profile) — defensive, source-first methodology. Findings require independent verification before remediation.*