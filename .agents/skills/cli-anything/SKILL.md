---
name: cli-anything
description: Universal CLI wrapper that turns any CLI tool into a structured, scriptable interface with JSON I/O, schema validation, and LLM-friendly output. Enables consistent agent interaction with diverse CLI tools.
argument-hint: "[tool-name] [args...] | --schema PATH | --output json|yaml|text | --timeout MS"
metadata:
  version: "1.0"
  source: "https://github.com/cli-anything/cli-anything"
  priority: "medium"
  category: "cli-tool"
---

# CLI Anything

Universal adapter for CLI tools — structured I/O, schema validation, LLM-friendly.

## Problem

CLI tools have inconsistent interfaces:
- Different argument styles (`--flag`, `-f`, positional)
- Various output formats (text, JSON, YAML, table)
- No standardized error codes
- Hard to script reliably from AI agents

## Solution

CLI Anything wraps any CLI with a consistent interface:

```bash
# Instead of: copilot -p "task" --yolo -C /path --session-id xxx
# Use: cli-anything copilot --task "task" --cwd /path --session-id xxx --output json
```

## Installation

```bash
# Via npm
npm install -g @cli-anything/cli

# Via Go
go install github.com/cli-anything/cli-anything/cmd/cli-anything@latest

# Verify
cli-anything --version
```

## Configuration

Define tool adapters in `.cli-anything.yaml`:

```yaml
tools:
  copilot:
    command: "copilot"
    args_template: "-p {task} --yolo --output-format json -C {cwd} --session-id {session_id}"
    input_schema:
      type: object
      properties:
        task:
          type: string
          description: "Task description for Copilot"
        cwd:
          type: string
          description: "Working directory"
        session_id:
          type: string
          description: "Isolated session ID"
      required: ["task"]
    output_schema:
      type: object
      properties:
        result:
          type: string
        files_changed:
          type: array
          items:
            type: string
        status:
          type: string
          enum: ["success", "partial", "failed"]
    timeout_ms: 300000
    env:
      GITHUB_TOKEN: "${GITHUB_TOKEN}"

  claude:
    command: "claude"
    args_template: "--print {task} --model {model} --output-format json"
    input_schema:
      type: object
      properties:
        task:
          type: string
        model:
          type: string
          enum: ["opus", "sonnet", "haiku", "fable"]
      required: ["task"]
    output_schema:
      type: object
      properties:
        result:
          type: string
        usage:
          type: object
        cost_usd:
          type: number
    timeout_ms: 600000

  agy:
    command: "agy"
    args_template: "--mode accept-edits --print {task}"
    input_schema:
      type: object
      properties:
        task:
          type: string
        mode:
          type: string
          enum: ["accept-edits", "read-only"]
      required: ["task"]
    output_schema:
      type: object
      properties:
        result:
          type: string
        files_modified:
          type: array
          items:
            type: string
    timeout_ms: 300000

  playwright:
    command: "npx"
    args_template: "playwright {subcommand} {args}"
    input_schema:
      type: object
      properties:
        subcommand:
          type: string
          enum: ["install", "test", "codegen", "open"]
        args:
          type: array
          items:
            type: string
    output_schema:
      type: object
      properties:
        stdout:
          type: string
        stderr:
          type: string
        exit_code:
          type: integer
    timeout_ms: 120000
```

## Usage

```bash
# Run tool with structured input/output
cli-anything copilot --input '{"task": "Create UserService", "cwd": "/project", "session_id": "abc123"}'

# Or with individual args
cli-anything copilot --task "Create UserService" --cwd /project --session-id abc123

# Get JSON output
cli-anything copilot --task "..." --output json

# Validate against schema
cli-anything copilot --task "..." --validate

# List configured tools
cli-anything list
```

## Agent Integration

### Aletheia Worker Wrapper

```python
# aletheia/adapters/cli_anything.py
import subprocess
import json
from typing import Dict, Any

class CLIAnythingAdapter:
    def __init__(self, config_path: str = ".cli-anything.yaml"):
        self.config = self._load_config(config_path)
    
    def _load_config(self, path: str) -> Dict:
        import yaml
        with open(path) as f:
            return yaml.safe_load(f)
    
    def run(self, tool: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        tool_config = self.config["tools"][tool]
        
        # Validate input
        self._validate(input_data, tool_config["input_schema"])
        
        # Build command
        args = tool_config["args_template"].format(**input_data)
        cmd = [tool_config["command"]] + args.split()
        
        # Execute
        env = {**tool_config.get("env", {}), **self._resolve_env()}
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=tool_config["timeout_ms"] / 1000,
            env=env
        )
        
        # Parse output
        output = self._parse_output(result.stdout, tool_config["output_schema"])
        
        # Validate output
        self._validate(output, tool_config["output_schema"])
        
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "structured": output
        }
    
    def _parse_output(self, stdout: str, schema: Dict) -> Dict:
        # Try JSON first
        try:
            return json.loads(stdout)
        except json.JSONDecodeError:
            # Fallback: extract structured data from text
            return {"result": stdout.strip()}
    
    def _validate(self, data: Dict, schema: Dict):
        import jsonschema
        jsonschema.validate(data, schema)
    
    def _resolve_env(self) -> Dict:
        import os
        env = {}
        for key, value in os.environ.items():
            if value.startswith("${") and value.endswith("}"):
                env[key] = os.environ.get(value[2:-1], "")
            else:
                env[key] = value
        return env
```

### Universal Worker Brief

```json
{
  "tool": "cli-anything",
  "adapter": "copilot",
  "input": {
    "task": "Implement appointment booking API per spec at SPEC.md#RF-BB-05",
    "cwd": "/workspace/navio-barber-worker-1",
    "session_id": "aletheia-session-123-worker-1"
  },
  "expected_output": {
    "files_changed": ["src/server/routers/appointments.ts", "src/server/services/booking.ts"],
    "tests_pass": true,
    "status": "success"
  }
}
```

## Navio Barber Adapters

### Complete `.cli-anything.yaml` for Navio Barber

```yaml
tools:
  # Core AI Agents
  claude:
    command: "claude"
    args_template: "--print {task} --model {model} --output-format json --max-turns {max_turns}"
    input_schema:
      type: object
      properties:
        task: {type: string}
        model: {type: string, enum: ["opus", "sonnet", "haiku", "fable"]}
        max_turns: {type: integer, default: 10}
      required: ["task"]
    timeout_ms: 600000

  copilot:
    command: "copilot"
    args_template: "-p {task} --yolo --output-format json -C {cwd} --session-id {session_id}"
    input_schema:
      type: object
      properties:
        task: {type: string}
        cwd: {type: string}
        session_id: {type: string}
      required: ["task", "cwd", "session_id"]
    timeout_ms: 300000

  agy:
    command: "agy"
    args_template: "--mode {mode} --print {task}"
    input_schema:
      type: object
      properties:
        task: {type: string}
        mode: {type: string, enum: ["accept-edits", "read-only"]}
      required: ["task"]
    timeout_ms: 300000

  # Development Tools
  npm:
    command: "npm"
    args_template: "{command} {args}"
    input_schema:
      type: object
      properties:
        command: {type: string, enum: ["install", "test", "build", "lint", "typecheck", "run"]}
        args: {type: array, items: {type: string}}
      required: ["command"]
    timeout_ms: 180000

  prisma:
    command: "npx"
    args_template: "prisma {command} {args}"
    input_schema:
      type: object
      properties:
        command: {type: string, enum: ["migrate", "generate", "push", "studio", "db", "format"]}
        args: {type: array, items: {type: string}}
      required: ["command"]
    timeout_ms: 120000

  playwright:
    command: "npx"
    args_template: "playwright {subcommand} {args}"
    input_schema:
      type: object
      properties:
        subcommand: {type: string, enum: ["test", "install", "codegen", "show-report"]}
        args: {type: array, items: {type: string}}
      required: ["subcommand"]
    timeout_ms: 300000

  # Reverse Engineering
  reverse-api:
    command: "reverse-api"
    args_template: "{subcommand} {args}"
    input_schema:
      type: object
      properties:
        subcommand: {type: string, enum: ["har", "proxy", "pcap", "mitm", "generate"]}
        args: {type: array, items: {type: string}}
      required: ["subcommand"]
    timeout_ms: 300000

  scrapling:
    command: "scrapling"
    args_template: "{subcommand} {args}"
    input_schema:
      type: object
      properties:
        subcommand: {type: string, enum: ["crawl", "extract", "fetch"]}
        args: {type: array, items: {type: string}}
      required: ["subcommand"]
    timeout_ms: 300000

  # Code Quality
  unslop:
    command: "unslop"
    args_template: "{command} {args}"
    input_schema:
      type: object
      properties:
        command: {type: string, enum: ["check", "fix"]}
        args: {type: array, items: {type: string}}
      required: ["command"]
    timeout_ms: 60000

  lgpd:
    command: "lgpd"
    args_template: "{command} {args}"
    input_schema:
      type: object
      properties:
        command: {type: string, enum: ["map", "consent-audit", "dpia", "rights-handlers", "check", "report"]}
        args: {type: array, items: {type: string}}
      required: ["command"]
    timeout_ms: 120000

  # Git / Worktree
  worktrunk:
    command: "worktrunk"
    args_template: "{command} {args}"
    input_schema:
      type: object
      properties:
        command: {type: string, enum: ["create", "list", "diff", "integrate", "remove", "cleanup", "status"]}
        args: {type: array, items: {type: string}}
      required: ["command"]
    timeout_ms: 60000
```

## Benefits for Navio Barber

1. **Consistent Agent Interface** — All workers use same JSON I/O pattern
2. **Schema Validation** — Catch errors before they propagate
3. **Timeout Management** — Prevent runaway processes
4. **Audit Trail** — Structured logs for every tool invocation
5. **Easy Debugging** — Replay any tool call with recorded input
6. **Provider Agnostic** — Swap agents without changing orchestration logic

## Notes for Navio Barber

- Configure in `.cli-anything.yaml` at repo root
- Aletheia workers invoke via `cli-anything` for consistency
- All 7 agents (Claude, Copilot, Agy, Gemini, OpenCode, KiloCode, Kimi) get adapters
- Essential for reliable multi-agent orchestration
- Integrates with `worktrunk` for worktree management