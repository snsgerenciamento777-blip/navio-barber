# STATUS_CONCLUSAO_AUTONOMA.md

Status: Desenvolvimento autônomo em andamento
Última atualização: 2026-11-08

## 1. ETAPAS CONCLUÍDAS

### Missão 27 — Correções operacionais (concluída)

| Problema | Solução | Arquivo(s) |
|----------|---------|------------|
| API não inicia com `npm run dev` | Adicionado `"type": "module"` ao `apps/api/package.json`, extensões `.ts` a imports, `import type` para tipo `Session` | `apps/api/package.json`, `apps/api/src/server.ts`, `apps/api/src/index.ts`, `apps/api/src/lib/rbac.ts`, + todos routers/lib com imports relativos |
| tRPC Context 500 no frontend | Movido `getCsrfToken.useQuery()` para componente `CsrfTokenInitializer` dentro do `<trpc.Provider>` | `apps/web/src/components/trpc-provider.tsx` |
| turbo.json `pipeline` obsoleto | Renomeado para `tasks` | `turbo.json` |
| `packages/auth` e `packages/database` sem `type: module` | Adicionado `"type": "module"` | `packages/auth/package.json`, `packages/database/package.json` |

### Missão 28 — Funcionalidades MVP (concluída)

| Problema | Solução | Arquivo(s) |
|----------|---------|------------|
| Procedure `updateProfessional` ausente | Adicionada procedure `updateProfessional` ao `shopRouter` — atualiza nome, userId, isActive, workingHours | `apps/api/src/routers/shop.ts`, `apps/api/src/index.ts` |
| UI: página de edição de horários do profissional | Criada página `profissionais/[id]/editar` com toggle ativo/inativo e configurador de horários semanal (2ª a domingo) | `apps/web/src/app/profissionais/[id]/editar/page.tsx` |
| UI: link "Editar horários" na página de detalhes do profissional | Adicionado link para `/profissionais/[id]/editar` | `apps/web/src/app/profissionais/[id]/page.tsx` |
| UI: toggle ativo/inativo para serviços | Adicionado botão Ativo/Inativo na listagem de serviços, usando `service.update` mutation | `apps/web/src/app/servicos/page.tsx` |
| UI: toggle bloquear/desbloquear cliente | Adicionado botão Bloquear/Desbloquear na listagem de clientes, usando `customer.update` mutation | `apps/web/src/app/clientes/page.tsx` |

### Serviços em execução

- API tRPC: porta 3001 (`npm run dev`) ✅
- Frontend Next.js: porta 3000 (`npm run dev`) ✅
- Prisma → Supabase: `SELECT 1` OK ✅
- Frontend HTTP: 200 OK ✅

### Qualidade de código

- `turbo typecheck`: ✅ passa (API + Web)
- `turbo lint`: ✅ passa (API + Web)
- `turbo test`: ✅ passa (API: 143 testes em 13 arquivos; Web: 5 testes em 1 arquivo)

## 2. PRÓXIMAS TAREFAS

1. Implementar fluxo de cadastro/login Better Auth no frontend
2. Implementar RBAC na interface (ocultar/mostrar elementos por papel)
3. Validar comunicação frontend↔API end-to-end
4. Dashboard financeiro expandido (opcional, pós-MVP)


## 3. ARQUITETURA ATUAL

- Monorepo: apps/web (Next.js 15), apps/api (tRPC HTTP), packages/database (Prisma), packages/auth (Better Auth)
- Banco: Supabase remoto, migration `20261108000000_init_schema` aplicada
- 19 modelos Prisma, 8 enums, 29 FKs
- Routers tRPC: auth, appointment, service, customer, dashboard, shop, notification, promo, waitlist, review, portfolio
- RBAC implementado: ADMIN, BARBER com permissões granulares
- CSRF proteção em mutations

## 4. PENDÊNCIAS EXTERNAS

- Credenciais de e-mail para recuperação de senha (Better Auth sendResetPassword)
- Firebase credentials para notificações push (FCM service é mock)
- Pagamento online (Mercado Pago/Stripe) — não implementado no MVP (D-01 pendente)
