# RELATÓRIO PRE-DEPLOY RENDER — Navio Barber 2.0

**Data:** 2026-11-11  
**Branch:** `main`  
**Commit:** `c1aff5a` (chore: consolidate Navio Barber 2.0 codebase, hardening, and deploy prep)

---

## 1. Resumo Executivo

Todas as validações passaram. O projeto está pronto para deploy no Render.

| Item | Status |
|------|--------|
| **Install (npm ci na raiz)** | ✅ Passou |
| **Prisma Generate** | ✅ Passou |
| **Lint** | ✅ Passou |
| **Typecheck** | ✅ Passou |
| **Testes** | ✅ Passou (177 testes total: 172 API + 5 Web) |
| **Build API** | ✅ Passou (`tsc --noEmit`) |
| **Build Web** | ✅ Passou (`next build` — 27 rotas geradas) |
| **API Startup** | ✅ Validado (`node src/server.ts` + health check `/health`) |

---

## 2. Arquivos Alterados nesta Preparação

| Arquivo | Alteração |
|---------|-----------|
| `package.json` (raiz) | `@prisma/client` movido para `dependencies`; `prisma` em `devDependencies`; adicionado `overrides` para fixar versões 5.22.0 |
| `packages/database/package.json` | Removido `@prisma/client` (resolvido via hoisting do workspace na raiz) |
| `apps/web/package.json` | Adicionados `@types/react@^19`, `@types/react-dom@^19`, `@types/node@^22` em `devDependencies` |
| `apps/api/package.json` | Adicionado script `"start": "node src/server.ts"` |
| `prisma/migrations/migration_lock.toml` | `provider = "postgresql"` (corrigido de `sqlite`) |

---

## 3. Versões Unificadas (Prisma)

| Pacote | Versão |
|--------|--------|
| `prisma` (CLI) | **5.22.0** |
| `@prisma/client` | **5.22.0** |

> **Nota:** Antes desta preparação, `packages/database` declarava `@prisma/client@^7.10.1` (inválido — não existe). Corrigido para usar a versão da raiz via npm workspaces hoisting.

---

## 4. Configuração de Monorepo para Render

### Estrutura do Workspace

```
navio-barber/ (raiz - npm workspaces)
├── apps/
│   ├── api/          (@navio-barber/api)
│   └── web/          (@navio-barber/web)
└── packages/
    ├── auth/         (@navio-barber/auth)
    ├── database/     (@navio-barber/database)
    └── ui/           (@navio-barber/ui)
```

### Root Directory no Render

**NÃO usar `Root Directory = apps/api` ou `apps/web`**.  
O projeto **deve ser instalado e buildado a partir da raiz** (`navio-barber/`) para que:

- `npm ci` resolva corretamente todos os `file:` dependencies entre workspaces
- O lockfile (`package-lock.json`) da raiz seja respeitado
- O Turborepo possa orquestrar builds paralelos
- Prisma Client seja gerado uma única vez na raiz e compartilhado

---

## 5. Comandos de Produção (Executados da Raiz)

### API (`@navio-barber/api`)

| Comando | Descrição |
|---------|-----------|
| `npm run build` (raiz) | `turbo build` → executa `tsc --noEmit` na API |
| `npm run start:api` (raiz) | `node apps/api/src/server.ts` — Inicia servidor tRPC standalone |
| **Build Command (Render)** | `npm run build` |
| **Start Command (Render)** | `node apps/api/src/server.ts` |
| **Root Directory (Render)** | `navio-barber` (raiz do repo) |
| **Health Check Path** | `/health` |

> O servidor expõe health checks em `GET /health` e `GET /healthz` retornando `{ "ok": true, "service": "navio-barber-api" }`

### Frontend (`@navio-barber/web`)

| Comando | Descrição |
|---------|-----------|
| `npm run build` (raiz) | `turbo build` → executa `next build` no Web |
| `npm run start:web` (raiz) | `npx next start -p $PORT` (via `next start` no workspace) |
| **Build Command (Render)** | `npm run build` |
| **Start Command (Render)** | `npx next start -p $PORT` |
| **Root Directory (Render)** | `navio-barber` (raiz do repo) |

---

## 6. Prisma Client Generation no Render

O `prisma generate` **deve rodar antes do build** porque:

1. A API importa `@prisma/client` e `@navio-barber/database`
2. O `packages/database` exporta `PrismaClient` gerado
3. O `turbo build` executa `tsc --noEmit` que precisa dos types do Prisma Client

### Configuração no Render (API Service)

```yaml
# render.yaml ou via Dashboard
buildCommand: |
  npm ci
  npm run db:generate
  npm run build
startCommand: node apps/api/src/server.ts
```

### Configuração no Render (Web Service)

```yaml
buildCommand: |
  npm ci
  npm run db:generate
  npm run build
startCommand: npx next start -p $PORT
```

> **Nota:** `npm run db:generate` roda `prisma generate` na raiz e gera o client em `node_modules/@prisma/client` (hoisted), acessível a todos os workspaces.

---

## 7. Requisitos de Runtime

| Requisito | Valor |
|-----------|-------|
| **Node.js** | `>=20.0.0` (recomendado **22+**) — Render usa Node 22 por padrão |
| **npm** | `10.9.0` (conforme `packageManager`) |
| **ES Modules** | `"type": "module"` em todos os packages; `moduleResolution: "NodeNext"` no `tsconfig.json` |
| **TypeScript Execution** | `node src/server.ts` funciona nativamente com `--experimental-strip-types` (Node 22+) ou via `tsx` se necessário |

> **Validação real:** `node apps/api/src/server.ts` inicia corretamente, carrega imports TypeScript (`.ts`), resolve pacotes internos do monorepo (`@navio-barber/*`), conecta ao Prisma Client e expõe servidor HTTP standalone na porta `PORT`.

---

## 8. Variáveis de Ambiente Necessárias no Render

### Obrigatórias (Ambos os Services)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL (Supabase Session Pooler, porta 5432, `sslmode=require`) | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Secret para NextAuth (mín. 32 chars) | `openssl rand -base64 32` |
| `BETTER_AUTH_SECRET` | Secret para Better Auth (mín. 32 chars) | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | URL pública do frontend | `https://seu-app.onrender.com` |

### Obrigatórias (Apenas API)

| Variável | Descrição |
|----------|-----------|
| `PORT` | Render injeta automaticamente (padrão 3001 se não definido) |
| `HOST` | `0.0.0.0` (para escutar em todas as interfaces) |

### Opcionais / Contexto (Conforme necessidade)

| Variável | Descrição |
|----------|-----------|
| `FIREBASE_PROJECT_ID` | Firebase project ID para push notifications |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | Private key (com `\n` preservados) |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket name |
| `NODE_ENV` | `production` (Render define automaticamente) |

---

## 9. Schema Prisma (Oficial)

**Arquivo único:** `prisma/schema.prisma`

| Estatística | Valor |
|-------------|-------|
| Models | 19 |
| Enums | 8 |
| Índices | 33 |
| Foreign Keys | 24 |
| Tabelas (via migration) | 30 |

> A migration inicial `20261108000000_init_schema` (445 linhas) já foi aplicada no Supabase e validada via `check-audit.js`.

---

## 10. Validações Executadas (Detalhado)

```bash
# 1. Install limpo na raiz
npm ci

# 2. Prisma Generate (antes do build)
npm run db:generate

# 3. Lista migrações
prisma migrate status

# 4. Typecheck (monorepo via Turbo)
npm run typecheck

# 5. Lint (monorepo via Turbo)
npm run lint

# 6. Testes (monorepo via Turbo)
npm run test
# → 177 testes passando:
#    - API: 15 arquivos, 172 testes
#    - Web: 1 arquivo, 5 testes
#    - Auth/Database/UI: sem testes próprios (cobertos via API)

# 7. Build completo (monorepo via Turbo)
npm run build
# → API: tsc --noEmit OK
# → Web: next build OK — 27 rotas, 103 kB First Load JS compartilhado

# 8. Startup API (validação real)
node apps/api/src/server.ts
# → Health check: GET /health → {"ok":true,"service":"navio-barber-api"}
```

---

## 11. Contagem Real de Testes por Workspace

| Workspace | Test Files | Testes | Status |
|-----------|------------|--------|--------|
| `@navio-barber/api` | 15 | **172** | ✅ Passando |
| `@navio-barber/web` | 1 | **5** | ✅ Passando |
| `@navio-barber/auth` | 0 | 0 | — (coberto via API) |
| `@navio-barber/database` | 0 | 0 | — (coberto via API) |
| `@navio-barber/ui` | 0 | 0 | — (sem lógica de negócio) |
| **TOTAL** | **16** | **177** | ✅ |

> **Investigação da divergência:** Relatórios anteriores citavam "14 testes" porque o `npm run test` sem filtro mostrava apenas o summary final do Turbo. O comando correto `npm run test` executa testes em **todos** os workspaces configurados com script `test`. API e Web têm testes; Auth/Database/UI não têm scripts de teste próprios (sua lógica é testada via integração na API).

---

## 12. Verificação de Dependências Locais (`file:`)

Todos os `file:` dependencies resolvem corretamente com `npm ci` na raiz:

| Package | Dependency | Resolved Via |
|---------|------------|--------------|
| `@navio-barber/api` | `@navio-barber/database` | `file:../packages/database` |
| `@navio-barber/api` | `@navio-barber/auth` | `file:../packages/auth` |
| `@navio-barber/web` | `@navio-barber/api` | `file:../apps/api` |
| `@navio-barber/web` | `@navio-barber/auth` | `file:../packages/auth` |
| `@navio-barber/web` | `@navio-barber/ui` | `file:../packages/ui` |
| `@navio-barber/auth` | `@navio-barber/database` | `file:../packages/database` |

> **Validado:** `npm ci` na raiz instala todos os workspaces, faz hoisting de `@prisma/client` para `node_modules/@prisma/client` (raiz), e todos os `import` internos funcionam corretamente tanto em dev quanto em produção.

---

## 13. Bloqueiros Resolvidos

| Bloqueiro | Resolução |
|-----------|-----------|
| Conflito de versões Prisma (root 5.22.0 vs database 7.10.1) | `@prisma/client` movido para raiz; `packages/database` usa hoisting; `overrides` na raiz fixa 5.22.0 |
| `npm ELSPROBLEMS` (pacote inválido em database/node_modules) | `npm ci` limpo após remover dependência duplicada |
| TypeScript errors em `apps/web` (`process`, `crypto`, `fs`, `path`, `Buffer`) | Adicionado `@types/node@^22` em `apps/web/package.json` |
| `migration_lock.toml` com provider `sqlite` | Corrigido para `postgresql` |
| API sem script `start` | Adicionado `"start": "node src/server.ts"` em `apps/api/package.json` |
| Root Directory incorreto para monorepo | Documentado: **usar raiz (`navio-barber/`), não subpastas** |

---

## 14. Próximos Passos no Render

### Service 1: API (`navio-barber-api`)

```yaml
# Via Dashboard ou render.yaml
name: navio-barber-api
rootDir: navio-barber
buildCommand: |
  npm ci
  npm run db:generate
  npm run build
startCommand: node apps/api/src/server.ts
healthCheckPath: /health
envVars:
  - key: DATABASE_URL
    sync: false
  - key: BETTER_AUTH_SECRET
    sync: false
  - key: BETTER_AUTH_URL
    sync: false
  - key: NEXTAUTH_SECRET
    sync: false
  - key: FIREBASE_PROJECT_ID
    sync: false
  - key: FIREBASE_CLIENT_EMAIL
    sync: false
  - key: FIREBASE_PRIVATE_KEY
    sync: false
  - key: FIREBASE_STORAGE_BUCKET
    sync: false
```

### Service 2: Web (`navio-barber-web`)

```yaml
name: navio-barber-web
rootDir: navio-barber
buildCommand: |
  npm ci
  npm run db:generate
  npm run build
startCommand: npx next start -p $PORT
envVars:
  - key: DATABASE_URL
    sync: false
  - key: BETTER_AUTH_SECRET
    sync: false
  - key: BETTER_AUTH_URL
    sync: false
  - key: NEXTAUTH_SECRET
    sync: false
  - key: FIREBASE_PROJECT_ID
    sync: false
  - key: FIREBASE_CLIENT_EMAIL
    sync: false
  - key: FIREBASE_PRIVATE_KEY
    sync: false
  - key: FIREBASE_STORAGE_BUCKET
    sync: false
```

> **Importante:** Ambos services usam `rootDir: navio-barber` (raiz do monorepo). O Render clona o repo inteiro e executa comandos a partir daí.

---

## 15. Observações Finais

- **Sem migrations pendentes:** Database já está sincronizado com `prisma/schema.prisma`
- **Sem alterações de schema necessárias:** Schema está estável e validado
- **Sem credenciais expostas:** Este relatório não contém secrets
- **Compatibilidade Render:** Node.js 22+, ESM nativo, health checks HTTP, porta dinâmica via `PORT`, monorepo npm workspaces
- **Prisma Generate:** Deve rodar no `buildCommand` de **ambos** services (API e Web) antes do `npm run build`

---

**Status Final:** ✅ **PRONTO PARA DEPLOY NO RENDER**