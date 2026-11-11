#!/usr/bin/env python3
"""
Bridge Kilo Code → Aletheia v23
Este script pode ser chamado pelo Kilo Code via terminal VS Code
para delegar tarefas à Aletheia.

Security: Input validation prevents command injection.
"""

import json
import subprocess
import sys
import os
import re
from pathlib import Path

ALETHEIA_SCRIPT = Path(__file__).parent.parent / ".agents" / "skills" / "alethe" / "scripts" / "orchestrate.py"

# Strict allowlist for task descriptions - alphanumeric, spaces, basic punctuation, Portuguese chars
# Excludes shell metacharacters: ; & | $ ` < > ( ) { } [ ]
TASK_PATTERN = re.compile(r'^[\w\s\.,_\-:()\[\]{}"\'/\\@#$%&*+=|<>?!áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]+$', re.UNICODE)
MAX_TASK_LENGTH = 5000

VALID_STRATEGIES = {"economy", "balanced", "quality", "research", "parallel", "rescue", "auto"}

def validate_task(task: str) -> None:
    """Validate task description against strict allowlist."""
    if not task:
        raise ValueError("Task description cannot be empty")
    if len(task) > MAX_TASK_LENGTH:
        raise ValueError(f"Task description too long (max {MAX_TASK_LENGTH} chars)")
    if not TASK_PATTERN.match(task):
        raise ValueError("Task description contains invalid characters. Allowed: alphanumeric, spaces, basic punctuation")

def validate_strategy(strategy: str) -> None:
    """Validate strategy against allowlist."""
    if strategy not in VALID_STRATEGIES:
        raise ValueError(f"Invalid strategy. Allowed: {', '.join(sorted(VALID_STRATEGIES))}")

def create_task_plan(task_description: str, strategy: str = "economy") -> dict:
    """Cria um plano JSON para a Aletheia."""
    validate_task(task_description)
    validate_strategy(strategy)
    return {
        "version": 1,
        "strategy": strategy,
        "workers": [
            {
                "id": "claude-worker",
                "provider": "claude",
                "mode": "write",
                "cwd": ".",
                "task": task_description
            }
        ]
    }

def run_aletheia(plan: dict) -> dict:
    """Executa a Aletheia com o plano dado."""
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(plan, f)
        plan_file = f.name

    project_root = Path(__file__).parent.parent
    try:
        # Use list form (no shell), validated inputs only
        result = subprocess.run(
            [sys.executable, str(ALETHEIA_SCRIPT), "run", plan_file],
            capture_output=True,
            text=True,
            timeout=300,
            cwd=project_root,
            shell=False  # Explicit: no shell interpolation
        )
        os.unlink(plan_file)

        if result.returncode == 0:
            return json.loads(result.stdout)
        else:
            return {"error": result.stderr, "returncode": result.returncode}
    except subprocess.TimeoutExpired:
        os.unlink(plan_file)
        return {"error": "Timeout - worker excedeu 300s"}
    except Exception as e:
        os.unlink(plan_file)
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python kilo-letheia-bridge.py \"descrição da tarefa\" [strategy]")
        sys.exit(1)

    task = sys.argv[1]
    strategy = sys.argv[2] if len(sys.argv) > 2 else "economy"

    try:
        plan = create_task_plan(task, strategy)
        result = run_aletheia(plan)
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except ValueError as e:
        print(json.dumps({"error": f"Validation error: {e}"}, indent=2))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": f"Execution error: {e}"}, indent=2))
        sys.exit(1)