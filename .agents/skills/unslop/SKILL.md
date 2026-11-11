---
name: unslop
description: AI code quality tool that detects and fixes "AI slop" patterns — verbose comments, unnecessary abstractions, over-engineering, hallucinated imports, fake async, cargo-cult patterns. Use to clean up AI-generated code, enforce human-like code style, and maintain code quality standards.
argument-hint: "[path] | --fix | --check | --strict | --rules verbose-comments,over-abstraction,hallucinated-imports,fake-async"
metadata:
  version: "1.0"
  source: "https://github.com/unslop/unslop"
  priority: "high"
  category: "code-quality"
---

# Unslop

Detect and fix AI-generated code anti-patterns ("AI slop").

## What It Catches

| Pattern | Description | Example |
|---------|-------------|---------|
| **Verbose Comments** | Explaining obvious code | `// Loop through users` above `for user in users` |
| **Over-Abstraction** | Unnecessary wrappers/factories | `UserFactory.createUser()` for simple object |
| **Hallucinated Imports** | Imports that don't exist | `import { useAuth } from '@/hooks/useAuth'` (missing) |
| **Fake Async** | `async` functions without `await` | `async function getData() { return data; }` |
| **Cargo-Cult Patterns** | Copied patterns without understanding | `useEffect(() => {}, [])` with no cleanup |
| **Defensive Null Checks** | Excessive `?.` and `??` | `user?.profile?.settings?.theme ?? 'dark'` |
| **Type Annotations** | Redundant explicit types | `const x: string = "hello"` |
| **Pseudo-Design Patterns** | Singleton, Factory where not needed | `class ConfigManager { static instance... }` |

## Installation

```bash
# Via npm (CLI)
npm install -g @unslop/cli

# Via pip (Python API)
pip install unslop

# Verify
unslop --version
```

## Usage

### CLI

```bash
# Check for slop (exit code 1 if found)
unslop check src/

# Auto-fix safe patterns
unslop fix src/

# Strict mode (more aggressive)
unslop check src/ --strict

# Specific rules only
unslop check src/ --rules verbose-comments,over-abstraction,hallucinated-imports

# Output as JSON for CI
unslop check src/ --format json --output slop-report.json
```

### Configuration

`.unsloprc.json`:

```json
{
  "rules": {
    "verbose-comments": "error",
    "over-abstraction": "warn",
    "hallucinated-imports": "error",
    "fake-async": "error",
    "cargo-cult": "warn",
    "defensive-nulls": "off",
    "redundant-types": "warn",
    "pseudo-patterns": "warn"
  },
  "ignore": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/mocks/**",
    "**/__fixtures__/**"
  ],
  "maxCommentLength": 120,
  "maxAbstractionDepth": 3
}
```

### Python API

```python
from unslop import UnslopAnalyzer, UnslopFixer

analyzer = UnslopAnalyzer(config=".unsloprc.json")
results = analyzer.analyze_directory("src/")

for issue in results.issues:
    print(f"{issue.file}:{issue.line} [{issue.rule}] {issue.message}")
    print(f"  Code: {issue.code_snippet}")

# Auto-fix
fixer = UnslopFixer()
fixed_count = fixer.fix_directory("src/", dry_run=False)
print(f"Fixed {fixed_count} issues")
```

## Integration with Navio Barber

### Pre-commit Hook

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: unslop
      name: Unslop AI Code Quality
      entry: unslop check
      args: ["src/", "--format", "json"]
      language: system
      pass_filenames: false
      always_run: true
```

### CI Integration

```yaml
# .github/workflows/unslop.yml
name: Unslop Check
on: [push, pull_request]
jobs:
  unslop:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @unslop/cli
      - run: unslop check src/ --format json --output slop-report.json
      - uses: actions/upload-artifact@v4
        with:
          name: slop-report
          path: slop-report.json
```

### Aletheia Worker Integration

```yaml
# In playbooks.yaml - add to review-gate phases
phases:
  - id: conventions
    role: reviewer
    tier: standard
    runner: economy
    does: |
      Run unslop check on diff:
      unslop check --changed-only --format json
      Report findings with file:line
```

## Common Fixes Applied

| Before (Slop) | After (Clean) |
|---------------|---------------|
| `async function fetchUser(id) { return db.getUser(id); }` | `function fetchUser(id) { return db.getUser(id); }` |
| `// Get user by ID\nconst user = await getUser(id)` | `const user = await getUser(id)` |
| `class UserService { constructor(private repo: UserRepo) {} }` | `const userService = { repo: userRepo }` |
| `import { useAuth } from '@/hooks/useAuth'` (missing) | *Removed or fixed to correct path* |
| `const x: string = "hello"` | `const x = "hello"` |
| `user?.profile?.settings?.theme ?? 'dark'` | `user.profile?.settings?.theme ?? 'dark'` |

## Notes for Navio Barber

- **Run on all AI-generated code** before integration (review-gate phase)
- Configure in Aletheia `review-gate` playbook as automated check
- Use `--changed-only` flag to only check new/modified lines
- Essential for maintaining code sovereignty with multi-agent team
- Prevents technical debt from accumulating across agent boundaries