---
name: opencode
description: OpenCode - Open source AI coding agent with multi-model support (Claude, GPT, Gemini, local models). Provides CLI and TUI interfaces for autonomous coding tasks. Use as tertiary worker in Aletheia orchestration.
argument-hint: "[command] | --model MODEL | --provider PROVIDER | --session SESSION_ID"
metadata:
  version: "1.0"
  source: "https://github.com/opencode-ai/opencode"
  priority: "medium"
  category: "ai-agent"
---

# OpenCode

Open source AI coding agent with multi-model support.

## Features

- **Multi-Model**: Claude (Anthropic), GPT (OpenAI), Gemini (Google), local (Ollama)
- **CLI + TUI**: Terminal UI for interactive work, CLI for automation
- **Session Management**: Persistent sessions with history
- **Tool Access**: File ops, shell, git, search, LSP
- **Configuration**: YAML-based, project and global configs

## Installation

```bash
# Via npm
npm install -g @opencode-ai/opencode

# Via binary
curl -fsSL https://opencode.ai/install.sh | sh

# Verify
opencode --version
```

## Configuration

`~/.config/opencode/config.yaml`:

```yaml
# Global configuration
providers:
  anthropic:
    api_key: "${ANTHROPIC_API_KEY}"
    models:
      - "claude-opus-5-5"
      - "claude-sonnet-5-5"
      - "claude-haiku-5-5"
  
  openai:
    api_key: "${OPENAI_API_KEY}"
    models:
      - "gpt-5"
      - "gpt-5.5"
      - "gpt-4o"
      - "gpt-4o-mini"
  
  google:
    api_key: "${GEMINI_API_KEY}"
    models:
      - "gemini-1.5-pro"
      - "gemini-1.5-flash"
      - "gemini-2.0-flash-exp"

  ollama:
    base_url: "http://localhost:11434"
    models:
      - "llama3.1:70b"
      - "codellama:34b"

# Default model
default_model: "claude-sonnet-5-5"

# Agent settings
agent:
  max_turns: 20
  permission_mode: "ask"  # ask, allow, deny
  working_directory: "."

# TUI settings
tui:
  theme: "dark"
  show_line_numbers: true
```

## Usage

### Interactive TUI

```bash
# Start TUI
opencode

# Start with specific model
opencode --model claude-sonnet-5-5

# Resume session
opencode --session abc123
```

### Headless CLI (for Aletheia)

```bash
# Single prompt
opencode -p "Implement UserService per SPEC.md" --model claude-sonnet-5-5

# With session isolation
opencode -p "Task description" --session-id worker-123 --model gpt-5

# JSON output for parsing
opencode -p "Task" --output-format json --model gemini-1.5-pro
```

### Aletheia Integration

```yaml
# In playbooks.yaml adapters
adapters:
  opencode:
    command: "opencode"
    args:
      - "-p"
      - "{task}"
      - "--model"
      - "{model}"
      - "--session-id"
      - "{session_id}"
      - "--output-format"
      - "json"
    promptTransport: "argument"
    outputFormat: "jsonl"
    capabilities:
      readOnly: false
      write: true
      resume: true
      structuredOutput: true
      tokenUsage: true
```

### Provider Configuration for Navio Barber

```yaml
# Project-specific .opencode.yaml
providers:
  anthropic:
    api_key: "${ANTHROPIC_API_KEY}"
    models:
      - "claude-opus-5-5"    # Lead/Arquiteto
      - "claude-sonnet-5-5"  # Implementador
      - "claude-haiku-5-5"   # Reviewer
  
  openai:
    api_key: "${OPENAI_API_KEY}"
    models:
      - "gpt-5"              # Alternative architect
      - "gpt-4o"             # Alternative implementer
  
  google:
    api_key: "${GEMINI_API_KEY}"
    models:
      - "gemini-1.5-pro"     # Research/analysis
      - "gemini-1.5-flash"   # Fast tasks

default_model: "claude-sonnet-5-5"

# Aletheia tier mapping
tiers:
  cheap:
    provider: "google"
    model: "gemini-1.5-flash"
  standard:
    provider: "anthropic"
    model: "claude-sonnet-5-5"
  strong:
    provider: "anthropic"
    model: "claude-opus-5-5"
```

## Authentication

```bash
# Set API keys (one-time)
export ANTHROPIC_API_KEY="sk-ant-..."
export OPENAI_API_KEY="sk-..."
export GEMINI_API_KEY="AIza..."

# Or use opencode config
opencode config set providers.anthropic.api_key "sk-ant-..."
opencode config set providers.openai.api_key "sk-..."
opencode config set providers.google.api_key "AIza..."
```

## Navio Barber Role

| Tier | Provider | Model | Use Case |
|------|----------|-------|----------|
| Cheap | Google | gemini-1.5-flash | Research, scouting, mechanical edits |
| Standard | Anthropic | claude-sonnet-5-5 | Feature implementation |
| Strong | Anthropic | claude-opus-5-5 | Architecture, complex bugs |

## Status for Navio Barber

- ✅ Installed
- ❌ Not authenticated (needs API keys)
- ⚠️ Partial configuration
- ❌ Not tested with Aletheia

## Next Steps

1. Set `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` environment variables
2. Run `opencode config set` for each provider
3. Test with `opencode -p "Hello" --model claude-sonnet-5-5`
4. Add to Aletheia playbooks.yaml adapters
5. Test in Aletheia `complete` playbook as tertiary provider

## Notes

- OpenCode is **tertiary** worker - used when Claude/Copilot/Agy quota exhausted
- Supports all major model providers via BYOK
- TUI useful for interactive debugging
- Session isolation via `--session-id` matches Aletheia requirements