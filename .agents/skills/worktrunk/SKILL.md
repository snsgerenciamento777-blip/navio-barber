---
name: worktrunk
description: Git worktree orchestration for parallel AI agent development. Manages isolated worktrees per agent/task, automated branch naming, diff generation, and clean integration. Essential for Aletheia multi-agent parallel workflows.
argument-hint: "[command] | --worktree-root PATH | --agent-name NAME | --task-id ID | --auto-cleanup"
metadata:
  version: "1.0"
  source: "https://github.com/worktrunk/worktrunk"
  priority: "high"
  category: "git-workflow"
---

# Worktrunk

Git worktree management for parallel AI agent development.

## Why Worktrees?

- **Isolation**: Each agent works in its own directory with independent git state
- **Parallelism**: Multiple agents can modify same files without conflicts
- **Clean Integration**: Diffs generated per worktree, reviewed, then merged
- **Rollback Safety**: Failed worktrees discarded without affecting main
- **Audit Trail**: Complete history per agent/task

## Installation

```bash
# Via Go (recommended)
go install github.com/worktrunk/worktrunk/cmd/worktrunk@latest

# Via binary release
curl -L https://github.com/worktrunk/worktrunk/releases/latest/download/worktrunk_linux_amd64 -o /usr/local/bin/worktrunk
chmod +x /usr/local/bin/worktrunk

# Verify
worktrunk --version
```

## Quick Start

```bash
# Initialize in repo root
cd navio-barber
worktrunk init

# Create worktree for agent
worktrunk create --agent claude-sonnet --task "RF-BB-05-appointments" --base main

# List active worktrees
worktrunk list

# Generate diff from worktree
worktrunk diff --worktree ../navio-barber-claude-sonnet-RF-BB-05

# Integrate approved worktree
worktrunk integrate --worktree ../navio-barber-claude-sonnet-RF-BB-05 --reviewer opus

# Cleanup completed worktrees
worktrunk cleanup --older-than 24h
```

## Aletheia Integration

### Worktree Naming Convention

```
../navio-barber-{agent}-{session-id}-{task-slug}
```

Examples:
- `../navio-barber-claude-sonnet-abc123-RF-BB-05-appointments`
- `../navio-barber-copilot-gpt5-def456-RF-BB-03-services`
- `../navio-barber-agy-gemini-ghi789-RF-CL-01-landing`

### Automated Workflow

```bash
# In Aletheia plan (parallel-worktrees playbook)
phases:
  - id: build
    role: builder
    tier: standard
    isolate: true
    workers: 3
    runner: parallel
    does: |
      # Each worker gets isolated worktree
      worktree_path=$(worktrunk create \
        --agent ${WORKER_AGENT} \
        --task ${TASK_SLUG} \
        --base main \
        --output-path)
      
      # Worker operates in worktree_path
      cd "$worktree_path"
      # ... do work ...
      
      # Generate diff.patch for review
      worktrunk diff --worktree "$worktree_path" > diff.patch
```

### Integration Protocol

```bash
# 1. Review diff
worktrunk diff --worktree ../navio-barber-worker-1 | unslop check --stdin

# 2. Run tests in worktree
cd ../navio-barber-worker-1
npm test

# 3. Integrate if approved
worktrunk integrate \
  --worktree ../navio-barber-worker-1 \
  --reviewer opus \
  --message "RF-BB-05: Appointment booking flow" \
  --squash

# 4. Cleanup
worktrunk remove --worktree ../navio-barber-worker-1
```

## Configuration

`.worktrunk.yaml`:

```yaml
repo_root: "."
worktree_root: ".."  # Parent directory for worktrees
naming:
  template: "navio-barber-{agent}-{session}-{task}"
  max_length: 100

defaults:
  base_branch: "main"
  auto_fetch: true
  shallow: false

agents:
  claude:
    prefix: "claude"
    models: ["opus", "sonnet", "haiku", "fable"]
  copilot:
    prefix: "copilot"
    models: ["gpt-5", "gpt-4o", "gpt-4o-mini"]
  agy:
    prefix: "agy"
    models: ["gemini-1.5-pro", "gemini-1.5-flash"]

integration:
  require_review: true
  reviewer: "opus"
  squash: true
  delete_after_integrate: true
  run_tests: true
  test_command: "npm test"

cleanup:
  auto_remove_integrated: true
  max_age_hours: 48
  keep_failed: true  # For debugging
```

## CLI Reference

```bash
# Create worktree
worktrunk create \
  --agent claude-sonnet \
  --task "RF-BB-05" \
  --base main \
  --session-id abc123 \
  [--output-path]  # Prints path only for scripting

# List worktrees
worktrunk list [--agent AGENT] [--status active|integrated|failed]

# Show diff
worktrunk diff --worktree PATH [--base main] [--format unified|json]

# Integrate
worktrunk integrate \
  --worktree PATH \
  --reviewer opus \
  --message "Commit message" \
  [--squash] \
  [--no-verify]

# Remove worktree
worktrunk remove --worktree PATH [--force]

# Cleanup old worktrees
worktrunk cleanup [--older-than 24h] [--dry-run]

# Status overview
worktrunk status
```

## Navio Barber Workflow Examples

### Phase 1: Parallel Services + Clients CRUD

```bash
# Comandante (Opus) orchestrates
worktrunk create --agent claude-sonnet --task "RF-BB-03-services" --base main --session-id s1
worktrunk create --agent claude-sonnet --task "RF-BB-04-clients" --base main --session-id s1

# Worker 1 (Sonnet) in ../navio-barber-claude-sonnet-s1-RF-BB-03-services
# Worker 2 (Sonnet) in ../navio-barber-claude-sonnet-s1-RF-BB-04-clients

# Both implement independently, generate diffs
# Opus reviews both diffs, integrates sequentially
```

### Phase 2: Frontend + Backend Parallel

```bash
# Frontend worktree
worktrunk create --agent copilot-gpt5 --task "RF-CL-03-frontend" --base main

# Backend worktree  
worktrunk create --agent claude-sonnet --task "RF-CL-03-backend" --base main

# Shared Prisma schema in main - both read, neither writes to same files
# Frontend owns: src/app/client/**, src/components/booking/**
# Backend owns: src/server/routers/booking/**, prisma/migrations/**
```

## Integration with Other Tools

### With Aletheia

```python
# Aletheia worker wrapper
import subprocess
import json

def create_worker_worktree(agent: str, task: str, session: str) -> str:
    result = subprocess.run([
        "worktrunk", "create",
        "--agent", agent,
        "--task", task,
        "--session-id", session,
        "--output-path"
    ], capture_output=True, text=True, check=True)
    return result.stdout.strip()

def get_worktree_diff(worktree_path: str) -> str:
    result = subprocess.run([
        "worktrunk", "diff", "--worktree", worktree_path
    ], capture_output=True, text=True, check=True)
    return result.stdout

def integrate_worktree(worktree_path: str, reviewer: str, message: str):
    subprocess.run([
        "worktrunk", "integrate",
        "--worktree", worktree_path,
        "--reviewer", reviewer,
        "--message", message,
        "--squash"
    ], check=True)
```

### With Spec Kit

```bash
# Specs in main, implementation in worktrees
# Spec Kit specs/ directory stays in main
# Worktrees reference specs via absolute paths

worktrunk create --agent claude-sonnet --task "spec-RF-BB-05" --base main
# Worker reads specs from main checkout, writes implementation in worktree
```

## Notes for Navio Barber

- **Essential** for Aletheia `parallel-worktrees` playbook (Phases 1-3)
- Each worker gets own worktree via `isolate: true` in playbook
- Worktree paths passed to workers via plan JSON
- Diff.patch files are the integration artifact
- Opus (Comandante) is the only integration authority
- Auto-cleanup after integration keeps workspace clean
- Failed worktrees preserved for debugging (48h default)