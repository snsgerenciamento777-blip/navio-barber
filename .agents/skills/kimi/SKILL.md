---
name: kimi
description: Kimi Code (Moonshot AI) - AI coding assistant with large context window (200k+ tokens). Strong at long-form reasoning, codebase analysis, and multi-file tasks. Use for complex architectural analysis and large-context tasks.
argument-hint: "[command] | --model kimi-k2 | --context-window 200k"
metadata:
  version: "1.0"
  source: "https://github.com/moonshotai/kimi-code"
  priority: "low"
  category: "ai-agent"
---

# Kimi Code (Moonshot AI)

AI coding agent with industry-leading context window (200k+ tokens).

## Key Features

- **Massive Context**: 200k+ token context window (vs 128k-200k for others)
- **Long-Form Reasoning**: Excels at multi-file analysis, architecture reviews
- **Codebase Understanding**: Can ingest entire repositories
- **Multi-Language**: Strong in Python, TypeScript, Go, Rust, C++
- **Chinese/English**: Native bilingual support

## Installation

```bash
# Via npm (if published)
npm install -g @moonshotai/kimi-code

# Via binary release
# Check https://github.com/moonshotai/kimi-code/releases

# Via pip
pip install kimi-code

# Verify
kimi --version
```

## Current Status for Navio Barber

- ❌ **Not installed** - Package availability varies
- ❌ Not authenticated
- ❌ Not configured
- ❌ Not tested

## Installation Options

### Option 1: Official CLI (when available)

```bash
# Check official sources
# https://kimi.moonshot.cn/code
# https://github.com/moonshotai/kimi-code
```

### Option 2: Via 9Router / OpenCode (BYOK)

```yaml
# In OpenCode config
providers:
  moonshot:
    api_key: "${MOONSHOT_API_KEY}"
    base_url: "https://api.moonshot.cn/v1"
    models:
      - "kimi-k2-0711"
      - "kimi-k2-0905"

# In 9Router
# Add Moonshot as custom provider
```

### Option 3: Direct API Access

```python
# Python wrapper for Kimi API
import openai

client = openai.OpenAI(
    api_key=os.environ["MOONSHOT_API_KEY"],
    base_url="https://api.moonshot.cn/v1"
)

response = client.chat.completions.create(
    model="kimi-k2-0905",
    messages=[{"role": "user", "content": "Analyze this codebase..."}],
    max_tokens=8192
)
```

## Navio Barber Use Cases

| Use Case | Why Kimi |
|----------|----------|
| **Full codebase analysis** | 200k context fits entire Navio Barber repo |
| **Architecture review** | Long-form reasoning across multiple files |
| **Reverse engineering correlation** | Correlate Hora do Estilo API specs with UI |
| **Spec Kit convergence** | Verify implementation matches spec across all files |
| **LGPD compliance audit** | Scan entire codebase for data handling patterns |

## Aletheia Integration (Future)

```yaml
# When available, add to playbooks.yaml
adapters:
  kimi:
    command: "kimi"
    args:
      - "--print"
      - "{task}"
      - "--model"
      - "kimi-k2"
      - "--session-id"
      - "{session_id}"
    promptTransport: "argument"
    outputFormat: "jsonl"
    capabilities:
      readOnly: false
      write: true
      resume: true
      structuredOutput: true
      tokenUsage: true
```

## Tier Mapping (Projected)

| Tier | Model | Use Case |
|------|-------|----------|
| Cheap | kimi-k2 (flash) | Fast research, summarization |
| Standard | kimi-k2 | Multi-file implementation |
| Strong | kimi-k2 (pro) | Architecture, complex analysis |

## Authentication

```bash
# When API access available
export MOONSHOT_API_KEY="sk-..."

# Or via config
kimi config set api_key "sk-..."
```

## Next Steps for Navio Barber

1. **Monitor availability** - Check https://kimi.moonshot.cn/code for CLI release
2. **Get API access** - Apply for Moonshot API if CLI not available
3. **Configure via 9Router/OpenCode** - Use as BYOK provider
4. **Test context capacity** - Feed entire codebase for analysis
5. **Add to Aletheia** - As specialized "analyst" tier provider

## Notes

- **Low priority** - Not yet available as installable CLI
- **High potential** - 200k context is unique differentiator
- **Best for**: Architecture reviews, full-repo analysis, spec convergence
- **Fallback**: Use via OpenCode/9Router with Moonshot API when available
- Monitor Moonshot AI announcements for CLI releases