---
name: claude-mem
description: Cross-session memory and knowledge management for Claude Code. Captures observations, builds project knowledge base, enables continuity across sessions. Use for persistent context, learning from past work, and maintaining project memory.
argument-hint: "[command] | --project PROJECT | --query QUERY | --save MEMORY"
metadata:
  version: "1.0"
  source: "https://github.com/claude-mem/claude-mem"
  priority: "high"
  category: "memory"
---

# Claude Mem

Persistent cross-session memory for Claude Code projects.

## What It Does

- **Observation Capture**: Automatically saves decisions, patterns, learnings
- **Smart Search**: Semantic search across all past sessions
- **Timeline**: Chronological project history with context
- **Knowledge Bases**: Build domain-specific "brains" from observations
- **Session Continuity**: Resume exactly where you left off

## Installation

```bash
# Via pip (Python package)
pip install claude-mem

# Or via npm (CLI wrapper)
npm install -g @claude-mem/cli

# Verify
claude-mem --version
```

## Core Concepts

### Observations

Structured notes captured during work:

```yaml
# Auto-captured example
type: "decision"
title: "Chose Prisma over Drizzle for ORM"
content: |
  Selected Prisma for Navio Barber because:
  1. Better TypeScript integration with generated types
  2. Migration system handles schema evolution safely
  3. Team familiarity from previous projects
  4. Excellent VS Code extension support
tags: ["architecture", "database", "orm", "prisma"]
project: "navio-barber"
timestamp: "2026-11-06T10:30:00Z"
session_id: "abc123"
```

### Memory Types

| Type | Purpose | Examples |
|------|---------|----------|
| `decision` | Architectural/technical choices | ORM selection, auth provider, state management |
| `pattern` | Reusable code patterns | tRPC router structure, React component patterns |
| `learning` | Things learned during development | "Prisma middleware for soft deletes", "tRPC context typing" |
| `issue` | Problems encountered & solutions | "Copilot session timeout fix", "9Router port conflict" |
| `preference` | User/project preferences | "Use Haiku for reviews", "Portuguese commit messages" |
| `context` | Project context for handoff | Current sprint, blockers, next steps |

## Commands

### Save Memory

```bash
# Save observation manually
claude-mem save "Chose Tailwind CSS v4 for styling" \
  --type decision \
  --tags architecture,styling \
  --project navio-barber

# Save from file
claude-mem save --file decision-log.md --project navio-barber
```

### Search Memory

```bash
# Smart search (semantic)
claude-mem search "How did we handle authentication?" --project navio-barber

# Dumb search (keyword)
claude-mem dumb-search "Prisma" --project navio-barber

# Timeline view
claude-mem timeline --project navio-barber --since "2026-11-01"
```

### Knowledge Agents

```bash
# Build domain-specific knowledge base
claude-mem knowledge-agent create "navio-architecture" \
  --project navio-barber \
  --tags architecture,database,api

# Query knowledge agent
claude-mem knowledge-agent ask "navio-architecture" \
  "What's the tRPC router pattern we use?"
```

### Session Management

```bash
# Generate handoff for next session
claude-mem handoff --project navio-barber --output HANDOFF.md

# Weekly digest
claude-mem weekly-digest --project navio-barber --week 2026-W45

# Project timeline report
claude-mem timeline-report --project navio-barber --output journey.md
```

## Navio Barber Integration

### Project Configuration

```yaml
# .claude-mem.yaml
project: "navio-barber"
auto_capture: true
capture_types:
  - decision
  - pattern
  - learning
  - issue
  - preference

# Auto-capture triggers
triggers:
  git_commit: true
  file_write: true
  test_failure: true
  agent_handoff: true

# Knowledge agents to maintain
knowledge_agents:
  - name: "navio-architecture"
    description: "System architecture decisions and patterns"
    tags: ["architecture", "database", "api", "frontend"]
  - name: "navio-lgpd"
    description: "LGPD compliance decisions and implementations"
    tags: ["lgpd", "privacy", "compliance", "data-protection"]
  - name: "navio-agents"
    description: "Multi-agent orchestration patterns and configs"
    tags: ["aletheia", "agents", "orchestration", "worktrees"]
  - name: "navio-reverse-engineering"
    description: "Hora do Estilo reverse engineering findings"
    tags: ["reverse-engineering", "hora-do-estilo", "api-discovery"]
```

### Automated Capture Hooks

```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "command": "claude-mem capture --tool {{tool}} --file {{file}} --project navio-barber"
      }
    ],
    "SessionEnd": [
      {
        "command": "claude-mem handoff --project navio-barber --output .claude/HANDOFF.md"
      }
    ]
  }
}
```

### Aletheia Integration

```python
# aletheia/memory_integration.py
import subprocess
import json

class ClaudeMemIntegration:
    def __init__(self, project: str = "navio-barber"):
        self.project = project
    
    def capture_orchestration_decision(self, decision: str, context: dict):
        """Capture Aletheia orchestration decisions"""
        tags = ["aletheia", "orchestration"] + context.get("tags", [])
        subprocess.run([
            "claude-mem", "save", decision,
            "--type", "decision",
            "--tags", ",".join(tags),
            "--project", self.project
        ])
    
    def capture_worker_result(self, worker: str, task: str, outcome: dict):
        """Capture worker outcomes for learning"""
        content = f"Worker {worker} on task {task}: {outcome.get('status')}"
        if outcome.get('learnings'):
            content += f"\nLearnings: {outcome['learnings']}"
        
        subprocess.run([
            "claude-mem", "save", content,
            "--type", "learning",
            "--tags", f"aletheia,worker,{worker}",
            "--project", self.project
        ])
    
    def get_relevant_context(self, query: str) -> str:
        """Get relevant past context for current task"""
        result = subprocess.run([
            "claude-mem", "search", query,
            "--project", self.project,
            "--format", "markdown",
            "--limit", "5"
        ], capture_output=True, text=True)
        return result.stdout
    
    def generate_handoff(self) -> str:
        """Generate handoff document for next session"""
        result = subprocess.run([
            "claude-mem", "handoff",
            "--project", self.project,
            "--output", "-"
        ], capture_output=True, text=True)
        return result.stdout
```

## Navio Barber Knowledge Agents

### 1. Architecture Knowledge Agent

```bash
claude-mem knowledge-agent create "navio-architecture" \
  --project navio-barber \
  --tags architecture,database,api,frontend,auth \
  --description "All architectural decisions for Navio Barber 2.0"
```

**Queries:**
- "What's our tRPC router pattern?"
- "How do we handle database migrations?"
- "What's the authentication flow?"
- "What are the React component conventions?"

### 2. LGPD Compliance Knowledge Agent

```bash
claude-mem knowledge-agent create "navio-lgpd" \
  --project navio-barber \
  --tags lgpd,privacy,compliance,data-protection,consent \
  --description "LGPD compliance decisions and implementations"
```

**Queries:**
- "What's our consent flow for marketing?"
- "How do we handle data subject access requests?"
- "What's the retention policy for appointments?"
- "Do we need a DPIA for biometric auth?"

### 3. Agent Orchestration Knowledge Agent

```bash
claude-mem knowledge-agent create "navio-agents" \
  --project navio-barber \
  --tags aletheia,agents,orchestration,worktrees,copilot,claude \
  --description "Multi-agent team configuration and patterns"
```

**Queries:**
- "What's the Aletheia playbook for parallel features?"
- "How do we configure Copilot adapter?"
- "What's the worktree naming convention?"
- "How do we handle quota exhaustion?"

### 4. Reverse Engineering Knowledge Agent

```bash
claude-mem knowledge-agent create "navio-reverse-engineering" \
  --project navio-barber \
  --tags reverse-engineering,hora-do-estilo,api-discovery,scrapling \
  --description "Hora do Estilo reference app analysis findings"
```

**Queries:**
- "What API endpoints did we discover in Hora do Estilo?"
- "What's the appointment booking flow?"
- "What authentication does the app use?"
- "What are the service/price structures?"

## Workflow Examples

### Starting a New Session

```bash
# 1. Get project context
claude-mem timeline --project navio-barber --since "2026-11-01" --limit 20

# 2. Check for open decisions
claude-mem search "undecided" --project navio-barber

# 3. Query knowledge agents
claude-mem knowledge-agent ask "navio-architecture" "Current tech stack decisions"
```

### During Development

```bash
# After making architectural decision
claude-mem save "Use Better Auth for authentication with email/phone + password" \
  --type decision --tags architecture,auth --project navio-barber

# After solving a tricky issue
claude-mem save "Fixed 9Router binding to 0.0.0.0 by using --host 127.0.0.1" \
  --type issue --tags 9router,security,networking --project navio-barber
```

### End of Session

```bash
# Generate handoff for next session
claude-mem handoff --project navio-barber --output .claude/HANDOFF.md

# Or let hook do it automatically
```

## Notes for Navio Barber

- **High priority** - enables continuity across long multi-agent project
- Auto-capture via hooks reduces manual effort
- Knowledge agents provide instant context for complex questions
- Timeline reports create project narrative for stakeholders
- Handoff documents ensure seamless session transitions
- Integrates with Aletheia for orchestration decision tracking
- Essential for maintaining context with 7-agent team