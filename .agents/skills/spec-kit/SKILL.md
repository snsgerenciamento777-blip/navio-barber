---
name: spec-kit
description: GitHub Spec Kit — Spec-Driven Development toolkit. Creates specifications before implementation with iterative cycles: Specify → Plan → Tasks → Implement → Converge. Essential for Navio Barber Phase 0 foundation.
argument-hint: "[command] | --integration copilot|claude|cursor | --template default|minimal"
metadata:
  version: "1.3"
  source: "https://github.com/github/spec-kit"
  priority: "critical"
  category: "spec-driven-development"
---

# Spec Kit (GitHub Spec-Driven Development)

Official GitHub toolkit for Spec-Driven Development (SDD).

## Philosophy

**Specs first, code second.** Write specifications that describe WHAT to build, then generate implementation plans and tasks from them.

## Installation

```bash
# Already installed via pip
specify --version
# GitHub Spec Kit - Spec-Driven Development Toolkit
```

## Core Commands

### Initialize Project

```bash
# Initialize with Copilot integration
specify init navio-barber --integration copilot

# Initialize with Claude Code integration
specify init navio-barber --integration claude

# Minimal template (no agent integration)
specify init navio-barber --template minimal
```

### Specification Workflow

```bash
# 1. SPECIFY - Create feature spec
specify new "RF-BB-05: Appointment Booking Flow" --type feature

# 2. PLAN - Generate implementation plan from spec
specify plan SPEC.md --output PLAN.md

# 3. TASKS - Break plan into actionable tasks
specify tasks PLAN.md --output TASKS.md

# 4. IMPLEMENT - Execute tasks (with agent)
# Agent reads TASKS.md and implements

# 5. CONVERGE - Verify implementation matches spec
specify check SPEC.md --implementation src/
```

## Navio Barber Project Structure

After `specify init navio-barber --integration copilot`:

```
navio-barber/
├── .specify/
│   ├── templates/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── scripts/
│   │   ├── check-spec.py
│   │   └── generate-tasks.py
│   └── config.yaml
├── specs/
│   ├── 000-foundation/
│   │   ├── SPEC.md          # Project constitution
│   │   ├── SPEC-BB.md       # Barbeiro domain specs
│   │   ├── SPEC-CL.md       # Cliente domain specs
│   │   └── SPEC-TR.md       # Transversal specs
│   ├── 001-appointments/
│   │   ├── SPEC.md
│   │   ├── PLAN.md
│   │   └── TASKS.md
│   └── ...
├── src/                      # Implementation (generated from specs)
└── CLAUDE.md                 # Updated with SDD workflow
```

## Specification Template (`.specify/templates/spec.md`)

```markdown
# [Feature Name] Specification

> **Status:** Draft | Approved | Implemented | Verified
> **Version:** 1.0
> **Domain:** BB | CL | TR
> **Priority:** P0 | P1 | P2

## 1. Problem Statement

[What problem does this solve? Why now?]

## 2. User Stories

- As a [role], I want to [action], so that [benefit]
- ...

## 3. Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|---------------------|
| FR-01 | ... | P0 | ... |
| FR-02 | ... | P1 | ... |

## 4. Non-Functional Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Response time | < 200ms p95 |
| NFR-02 | Availability | 99.9% |

## 5. Data Model

```prisma
// Prisma schema additions
model Appointment {
  id        String   @id @default(cuid())
  clientId  String
  serviceId String
  // ...
}
```

## 6. API Contract

```yaml
# OpenAPI fragment
paths:
  /appointments:
    post:
      summary: Create appointment
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateAppointmentInput'
      responses:
        '201':
          description: Created
```

## 7. UI/UX Requirements

- [ ] Responsive design (mobile-first)
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Loading states
- [ ] Error handling

## 8. Security & Privacy

- [ ] LGPD compliance (consent, data minimization)
- [ ] Authentication required
- [ ] Authorization (RBAC)
- [ ] Rate limiting

## 9. Testing Requirements

| Test Type | Coverage Target |
|-----------|-----------------|
| Unit | ≥ 80% |
| Integration | ≥ 70% |
| E2E | Critical paths |

## 10. Dependencies

- [ ] Spec X (blocking)
- [ ] External API Y

## 11. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ... | ... | ... | ... |
```

## Plan Template (`.specify/templates/plan.md`)

```markdown
# [Feature Name] Implementation Plan

> **Spec:** specs/XXX/SPEC.md
> **Generated:** YYYY-MM-DD

## Architecture

[High-level approach: components, patterns, data flow]

## Components

| Component | Type | Responsibility | Files |
|-----------|------|----------------|-------|
| AppointmentRouter | tRPC Router | API endpoints | src/server/routers/appointment.ts |
| BookingService | Service | Business logic | src/server/services/booking.ts |
| AppointmentCalendar | React Component | UI | src/components/calendar/ |

## Database Changes

```prisma
// Migration: 20261106_appointments
model Appointment { ... }
```

## API Endpoints

| Method | Path | Handler | Auth | Rate Limit |
|--------|------|---------|------|------------|
| POST | /api/appointments | createAppointment | Barbeiro | 30/min |
| GET | /api/appointments | listAppointments | Barbeiro | 60/min |

## Implementation Steps

1. **Database** - Create migration, run `prisma migrate dev`
2. **Types** - Generate tRPC types from schema
3. **Backend** - Implement router + service
4. **Frontend** - Build calendar + booking flow
5. **Tests** - Unit + integration + E2E
6. **Docs** - Update API docs

## Effort Estimate

| Phase | Agent | Model | Effort | Duration |
|-------|-------|-------|--------|----------|
| Database | Sonnet | sonnet | medium | 30 min |
| Backend | Sonnet | sonnet | medium | 2 hr |
| Frontend | Sonnet | sonnet | medium | 3 hr |
| Tests | Haiku | haiku | low | 1 hr |
```

## Tasks Template (`.specify/templates/tasks.md`)

```markdown
# [Feature Name] Tasks

> **Plan:** specs/XXX/PLAN.md
> **Generated:** YYYY-MM-DD

## Task List

- [ ] **TASK-001**: Create Prisma migration for Appointment model
  - **Files**: `prisma/migrations/20261106_appointments/`
  - **Check**: `npx prisma migrate dev`
  - **Agent**: Sonnet

- [ ] **TASK-002**: Implement tRPC router for appointments
  - **Files**: `src/server/routers/appointment.ts`
  - **Check**: `npm run typecheck && npm test`
  - **Agent**: Sonnet

- [ ] **TASK-003**: Implement BookingService business logic
  - **Files**: `src/server/services/booking.ts`
  - **Check**: `npm test`
  - **Agent**: Sonnet

- [ ] **TASK-004**: Build AppointmentCalendar React component
  - **Files**: `src/components/calendar/AppointmentCalendar.tsx`
  - **Check**: `npm run lint && npm test`
  - **Agent**: Sonnet

- [ ] **TASK-005**: Write unit tests for BookingService
  - **Files**: `src/server/services/booking.test.ts`
  - **Check**: `npm test -- booking.test.ts`
  - **Agent**: Haiku

- [ ] **TASK-006**: Write E2E tests for booking flow
  - **Files**: `tests/e2e/booking.spec.ts`
  - **Check**: `npm run test:e2e`
  - **Agent**: Haiku
```

## Integration with Aletheia

### Spec Kit → Aletheia Plan

```bash
# 1. Comandante creates spec
specify new "RF-BB-05: Appointment Booking" --type feature

# 2. Comandante generates plan
specify plan specs/001-appointments/SPEC.md --output specs/001-appointments/PLAN.md

# 3. Comandante generates tasks
specify tasks specs/001-appointments/PLAN.md --output specs/001-appointments/TASKS.md

# 4. Aletheia reads TASKS.md and creates orchestration plan
/alethe new "RF-BB-05 Implementation" \
  --playbook plan-execute \
  --why "Spec-driven implementation from Spec Kit tasks" \
  --lead claude:opus

# 5. Aletheia executes with workers
```

### Automated Spec Validation

```yaml
# In Aletheia review-gate playbook
phases:
  - id: conventions
    role: reviewer
    tier: standard
    does: |
      # Check implementation matches spec
      specify check specs/001-appointments/SPEC.md --implementation src/
      
      # Run unslop on diff
      unslop check --changed-only
      
      # Run LGPD compliance check
      lgpd check --project-root src/
```

## Navio Barber Phase 0 Tasks

```bash
# Initialize project with Spec Kit
cd navio-barber
specify init navio-barber --integration copilot

# Create project constitution
specify new "Project Constitution" --type constitution
# Edit specs/000-foundation/SPEC.md with project principles

# Create domain specs
specify new "Barbeiro Domain (RF-BB-01 to RF-BB-11)" --type domain
specify new "Cliente Domain (RF-CL-01 to RF-CL-10)" --type domain
specify new "Transversal (RF-TR-01 to RF-TR-04, RNF-01 to RNF-05)" --type domain

# Generate plans for each domain
specify plan specs/000-foundation/SPEC-BB.md --output specs/000-foundation/PLAN-BB.md
specify plan specs/000-foundation/SPEC-CL.md --output specs/000-foundation/PLAN-CL.md
specify plan specs/000-foundation/SPEC-TR.md --output specs/000-foundation/PLAN-TR.md

# Generate tasks
specify tasks specs/000-foundation/PLAN-BB.md --output specs/000-foundation/TASKS-BB.md
# ... etc
```

## Notes for Navio Barber

- **Critical** for Phase 0 (Foundation) - all implementation flows from specs
- Use `--integration copilot` for Copilot Fleet compatibility
- Specs live in `specs/` directory, version-controlled
- `specify check` runs in Aletheia `review-gate` for every feature
- Constitution (SPEC.md) defines project-wide constraints
- Each feature gets SPEC → PLAN → TASKS → Implementation → Verify cycle
- Enables parallel work: specs define contracts, workers implement independently