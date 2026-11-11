---
name: mattpocock-skills
description: Matt Pocock's TypeScript/React skills collection — advanced TypeScript patterns, React performance, testing strategies, and library authoring techniques. Curated from total-typescript.com and mattpocock.uk.
argument-hint: "[skill-name] | --list | --category typescript|react|testing|library"
metadata:
  version: "1.0"
  source: "https://github.com/mattpocock/skills"
  priority: "medium"
  category: "typescript-expertise"
---

# Matt Pocock Skills

Expert TypeScript, React, and testing patterns from Matt Pocock (Total TypeScript).

## Skill Categories

### TypeScript Mastery

| Skill | Description | Use When |
|-------|-------------|----------|
| **type-inference** | Master type inference, avoid annotations | Writing generic libraries, complex types |
| **conditional-types** | `extends`, `infer`, distributive conditionals | Type transformations, API response types |
| **template-literals** | String manipulation at type level | Route types, event names, CSS-in-JS |
| **mapped-types** | `Record`, `Pick`, `Omit`, custom mapped types | Transforming object types, API clients |
| **branded-types** | Nominal typing for primitives | `UserId`, `Email`, `Currency` type safety |
| **assertion-functions** | `asserts`, `is` predicates | Runtime validation with type narrowing |
| **module-augmentation** | Extend third-party types | Adding properties to `Window`, `Express.Request` |

### React Performance

| Skill | Description | Use When |
|-------|-------------|----------|
| **memoization** | `useMemo`, `useCallback`, `React.memo` | Preventing unnecessary re-renders |
| **virtualization** | `react-window`, `tanstack-virtual` | Large lists, tables, calendars |
| **code-splitting** | `lazy`, `Suspense`, route-based splitting | Reducing bundle size, faster TTI |
| **context-optimization** | Splitting contexts, selectors | Avoiding context re-render cascades |
| **server-components** | RSC patterns, streaming, Suspense | Next.js App Router, data fetching |

### Testing Strategies

| Skill | Description | Use When |
|-------|-------------|----------|
| **testing-library** | RTL patterns, user-centric tests | Component testing, integration tests |
| **msw** | Mock Service Worker for API mocking | Integration tests, E2E without backend |
| **vitest** | Fast unit tests, type-safe mocking | Unit tests, component tests |
| **playwright** | E2E testing, visual regression | Critical user flows, cross-browser |
| **contract-testing** | Pact, Schemathesis | API contract validation |

### Library Authoring

| Skill | Description | Use When |
|-------|-------------|----------|
| **exports-map** | `package.json` exports, subpath imports | Publishing npm packages |
| **declaration-files** | `.d.ts` generation, `tsconfig` config | TypeScript library consumers |
| **peer-dependencies** | Managing peer deps, version ranges | React/UI libraries |
| **bundling** | `tsup`, `rollup`, `esbuild` config | Building for ESM/CJS |

## Installation

```bash
# Clone skills repository
git clone https://github.com/mattpocock/skills.git .mattpocock-skills

# Or install individual skill packages
npm install -g @total-typescript/tsconfig
npm install -g @total-typescript/type-helpers
```

## Quick Reference: Navio Barber Patterns

### 1. Branded Types for Domain IDs

```typescript
// src/lib/types/branded.ts
type Brand<T, B> = T & { __brand: B };

export type UserId = Brand<string, 'UserId'>;
export type ProfessionalId = Brand<string, 'ProfessionalId'>;
export type AppointmentId = Brand<string, 'AppointmentId'>;
export type ServiceId = Brand<string, 'ServiceId'>;
export type EstablishmentId = Brand<string, 'EstablishmentId'>;

// Constructors
export const createUserId = (id: string): UserId => id as UserId;
export const createProfessionalId = (id: string): ProfessionalId => id as ProfessionalId;

// Usage in tRPC
export const appointmentRouter = createTRPCRouter({
  getById: protectedProcedure
    .input(z.object({ id: z.string().transform(createAppointmentId) }))
    .query(async ({ ctx, input }) => {
      // input.id is AppointmentId, not string
      return ctx.db.appointment.findUnique({ where: { id: input.id } });
    }),
});
```

### 2. Template Literal Types for Routes

```typescript
// src/lib/types/routes.ts
type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RouteParams<T extends string> = 
  T extends `${infer _}:${infer Param}/${infer Rest}`
    ? Param | RouteParams<Rest>
    : T extends `${infer _}:${infer Param}`
      ? Param
      : never;

export type AppRoutes = 
  | '/api/appointments'
  | '/api/appointments/:id'
  | '/api/services'
  | '/api/services/:id'
  | '/api/professionals'
  | '/api/professionals/:id'
  | '/api/clients'
  | '/api/clients/:id';

export type AppRouteParams = RouteParams<AppRoutes>;
// Result: 'id'

// Type-safe route builder
export const buildRoute = <T extends AppRoutes>(
  route: T,
  params: Record<RouteParams<T>, string>
): string => {
  return route.replace(/:(\w+)/g, (_, key) => params[key as RouteParams<T>]);
};

// Usage: buildRoute('/api/appointments/:id', { id: 'abc123' }) // ✓
// buildRoute('/api/appointments/:id', { wrong: 'abc' }) // ✗ Type error
```

### 3. Conditional Types for API Responses

```typescript
// src/lib/types/api.ts
type SuccessResponse<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Type guard
export function isSuccess<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}

// Usage in tRPC
export const appointmentRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
    .query(async ({ ctx, input }): Promise<ApiResponse<Appointment[]>> => {
      const [data, total] = await Promise.all([
        ctx.db.appointment.findMany({ /* ... */ }),
        ctx.db.appointment.count()
      ]);
      
      return {
        success: true,
        data,
        meta: { page: input.page, limit: input.limit, total }
      };
    }),
});
```

### 4. Assertion Functions for Validation

```typescript
// src/lib/validation/assertions.ts
import { z } from 'zod';

export function assertValidAppointmentInput(
  input: unknown
): asserts input is CreateAppointmentInput {
  const result = CreateAppointmentInputSchema.safeParse(input);
  if (!result.success) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Invalid appointment input',
      cause: result.error.flatten().fieldErrors
    });
  }
}

// Usage - TypeScript narrows type after assertion
export function processBooking(input: unknown) {
  assertValidAppointmentInput(input);
  // input is now CreateAppointmentInput
  return bookingService.create(input);
}
```

### 5. Mapped Types for Partial Updates

```typescript
// src/lib/types/utils.ts
// Make all properties optional but preserve nullability
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
};

// For PATCH endpoints - only provided fields, but typed
export type PartialUpdate<T> = {
  [K in keyof T]?: T[K] extends undefined ? never : T[K]
};

// Usage
type UpdateAppointmentInput = PartialUpdate<Pick<Appointment, 'status' | 'notes' | 'serviceId'>>;
// Result: { status?: AppointmentStatus; notes?: string | null; serviceId?: string }

// In tRPC
.update: protectedProcedure
  .input(z.object({
    id: z.string(),
    data: UpdateAppointmentInputSchema
  }))
  .mutation(async ({ ctx, input }) => {
    // input.data only contains provided fields, fully typed
    return ctx.db.appointment.update({
      where: { id: input.id },
      data: input.data
    });
  })
```

### 6. Module Augmentation for Better Auth

```typescript
// src/lib/auth/types.ts
import { DefaultSession } from 'better-auth';

declare module 'better-auth' {
  interface Session {
    user: {
      id: string;
      role: 'barbeiro' | 'admin' | 'cliente';
      establishmentId?: string;
      professionalId?: string;
    } & DefaultSession['user'];
  }
  
  interface User {
    role: 'barbeiro' | 'admin' | 'cliente';
    establishmentId?: string;
    professionalId?: string;
  }
}

// Now session.user.role is typed everywhere
```

### 7. React Context Optimization

```typescript
// src/lib/react/optimized-context.tsx
import { createContext, useContext, useMemo, ReactNode } from 'react';

// Split context by update frequency
interface AppContextStatic {
  theme: 'light' | 'dark';
  locale: string;
}

interface AppContextDynamic {
  user: User | null;
  notifications: Notification[];
}

// Static context - rarely changes
const StaticContext = createContext<AppContextStatic | null>(null);
export const StaticProvider = ({ children }: { children: ReactNode }) => {
  const value = useMemo(() => ({ theme: 'dark', locale: 'pt-BR' }), []);
  return <StaticContext.Provider value={value}>{children}</StaticContext.Provider>;
};

// Dynamic context - changes frequently
const DynamicContext = createContext<AppContextDynamic | null>(null);
export const DynamicProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const value = useMemo(() => ({ user, notifications }), [user, notifications]);
  return <DynamicContext.Provider value={value}>{children}</DynamicContext.Provider>;
};

// Selectors prevent unnecessary re-renders
export const useUser = () => useContext(DynamicContext)?.user ?? null;
export const useNotifications = () => useContext(DynamicContext)?.notifications ?? [];
export const useTheme = () => useContext(StaticContext)?.theme ?? 'dark';
```

### 8. MSW for Integration Testing

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  http.post('/api/appointments', async ({ request }) => {
    const body = await request.json();
    
    // Validate with Zod
    const result = CreateAppointmentInputSchema.safeParse(body);
    if (!result.success) {
      return HttpResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: { id: 'apt_123', ...body, status: 'pending' }
    });
  }),
  
  http.get('/api/appointments', () => {
    return HttpResponse.json({
      success: true,
      data: [],
      meta: { page: 1, limit: 20, total: 0 }
    });
  })
];

export const server = setupServer(...handlers);
```

```typescript
// tests/integration/appointment.test.ts
import { server } from '../mocks/handlers';
import { render, screen, waitFor } from '@testing-library/react';
import { AppointmentBooking } from '@/components/booking/AppointmentBooking';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('creates appointment via API', async () => {
  render(<AppointmentBooking professionalId="prof_123" />);
  
  // Fill form, submit
  await userEvent.click(screen.getByRole('button', { name: /confirmar/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/agendamento confirmado/i)).toBeInTheDocument();
  });
});
```

## Navio Barber Adoption Checklist

- [ ] **Branded IDs** for all domain entities (UserId, AppointmentId, etc.)
- [ ] **Template literal routes** for type-safe API client
- [ ] **Conditional ApiResponse** for all tRPC endpoints
- [ ] **Assertion functions** for input validation
- [ ] **DeepPartial/PartialUpdate** for PATCH endpoints
- [ ] **Module augmentation** for Better Auth types
- [ ] **Split React contexts** for performance
- [ ] **MSW handlers** for all API endpoints in tests
- [ ] **Vitest + Testing Library** for unit/integration tests
- [ ] **Playwright** for E2E critical paths (booking, payment)

## Resources

- **Total TypeScript**: https://www.totaltypescript.com
- **Matt Pocock's Blog**: https://www.mattpocock.uk
- **TypeScript Tutorials**: https://www.totaltypescript.com/tutorials
- **React Performance**: https://www.totaltypescript.com/react-performance
- **Testing Patterns**: https://www.totaltypescript.com/testing

## Notes for Navio Barber

- **Medium priority** - improves code quality and developer experience
- Apply branded types in Phase 0 (Schema Prisma - Task 0.4)
- Template literal routes for tRPC client generation
- Conditional types for all API responses (consistent error handling)
- MSW setup in Phase 0 (CI/CD Base - Task 0.6)
- Context optimization for Phase 1+ dashboard components
- These patterns compound: earlier adoption = more consistency