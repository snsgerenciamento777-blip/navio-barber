# INVENTÁRIO OFICIAL DA TRIPULAÇÃO — NAVIO BARBER 2.0

**Data da Auditoria:** 2026-11-05  
**Versão do Inventário:** 1.0  
**Responsável Técnico:** Claude Code (Opus 5.5)  
**Orquestrador:** Aletheia (Skill v23)

---

## SUMÁRIO EXECUTIVO

| Categoria | Total | Operacional | Parcial | Não Disponível |
|---|---|---|---|---|
| CLIs Agentes | 7 | 4 | 2 | 1 |
| Extensões VS Code | 4 | 4 | 0 | 0 |
| Gateways/Model Routers | 1 | 1 | 0 | 0 |
| Skills de Orquestração | 1 | 1 | 0 | 0 |

**Tripulação Pronta:** 6 agentes operacionais  
**Orquestração:** Aletheia configurada, onboarding pendente

---

## 1. FERRAMENTAS, AGENTES, CLIs, EXTENSÕES E GATEWAYS

### 1.1 CLIs de Agentes (Instaladas no Sistema)

| Ferramenta | Versão | Caminho | Tipo |
|---|---|---|---|
| **Claude Code** | 2.1.318 | `C:\Users\User\.local\bin\claude.EXE` | CLI Agent Nativo |
| **GitHub Copilot CLI** | 1.0.105 | `C:\Users\User\AppData\Roaming\npm\copilot.cmd` | CLI Agent Nativo |
| **Agy / Antigravity** | 1.4.10 | `C:\Users\User\AppData\Local\agy\bin\agy.EXE` | CLI Agent Nativo |
| **Gemini CLI** | 0.67.0 | `C:\Users\User\AppData\Roaming\npm\gemini.cmd` | CLI Agent Nativo |
| **9Router** | 0.5.112 | `C:\Users\User\AppData\Roaming\npm\9router.cmd` | Model Gateway |
| **OpenCode** | 2.2.5 | `C:\Users\User\AppData\Roaming\npm\opencode.cmd` | CLI Agent Nativo |
| **KiloCode** | - | Extensão VS Code apenas | IDE Extension |

### 1.2 Extensões VS Code Instaladas

| Extensão | ID | Status |
|---|---|---|
| **Claude Code** | `anthropic.claude-code` | ✅ Ativa |
| **Gemini CLI IDE Companion** | `google.gemini-cli-vscode-ide-companion` | ✅ Ativa |
| **Gemini Code Assist** | `google.geminicodeassist` | ✅ Ativa |
| **KiloCode** | `kilocode.kilo-code` | ✅ Ativa |
| **OpenAI ChatGPT** | `openai.chatgpt` | ✅ Ativa |
| **OpenAI Codex Audio** | `openai.codex-audio` | ✅ Ativa |
| **Claude Dev (saoudrizwan)** | `saoudrizwan.claude-dev` | ✅ Ativa |
| **OpenCode** | `sst-dev.opencode` | ✅ Ativa |

### 1.3 Gateways e Routers

| Gateway | Versão | Endpoint | Status |
|---|---|---|---|
| **9Router** | 0.5.112 | `http://192.168.5.79:20128` (exposto - **RISCO CRÍTICO: HTTP plaintext em 0.0.0.0**) | 🔴 Rodando, **PRECISA** `--host 127.0.0.1` + TLS se acesso remoto |

### 1.4 Skills de Orquestração

| Skill | Versão | Caminho | Status |
|---|---|---|---|
| **Aletheia (alethe)** | v23 | `.agents\skills\alethe\` | ✅ Carregada, onboarding pendente |
| **Security Audit (security-audit)** | - | `.agents\skills\security-audit\` | ✅ Instalada via npx skills |

---

## 2. ESTADO REAL DE FUNCIONAMENTO

### 2.1 Matriz de Estado por Ferramenta

| Ferramenta | Instalada | Autenticada | Configurada | Operacional | Testada |
|---|---|---|---|---|---|
| **Claude Code** | ✅ | ✅ OAuth | ✅ | ✅ | ✅ |
| **GitHub Copilot CLI** | ✅ | ✅ GitHub | ✅ | ✅ | ✅ |
| **Agy / Antigravity** | ✅ | ❌ (req. GEMINI_API_KEY) | ⚠️ Parcial | ❌ | ❌ |
| **Gemini CLI** | ✅ | ❌ (API key inválida) | ⚠️ Parcial | ❌ | ❌ |
| **9Router** | ✅ | N/A (gateway) | ⚠️ Segurança | ✅ Rodando | ✅ |
| **OpenCode** | ✅ | ❌ | ⚠️ Parcial | ❌ | ❌ |
| **KiloCode (VS Code)** | ✅ | ✅ OAuth | ✅ | ✅ (IDE) | ❌ (não CLI) |
| **Aletheia** | ✅ | N/A | ❌ Onboarding | ⚠️ Parcial | ✅ Doctor/Probe |

### 2.2 Legenda de Estados

- ✅ **Operacional** = Instalado + Autenticado + Configurado + Testado com sucesso
- ⚠️ **Parcial** = Instalado mas faltam autenticação, configuração ou dependências
- ❌ **Não Operacional** = Não instalado, não autenticado, ou falha crítica
- 🔴 **Crítico** = Bloqueador para uso em produção

---

## 3. MODELOS DISPONÍVEIS POR FERRAMENTA

### 3.1 Claude Code (First-Party Subscription)

| Modelo | Disponível | Acesso | Custo |
|---|---|---|---|
| **Opus 5.5** | ✅ | `claude --model opus` | $0 (subscription) |
| **Sonnet 5.5** | ✅ | `claude --model sonnet` | $0 (subscription) |
| **Haiku 5.5** | ✅ | `claude --model haiku` | $0 (subscription) |
| **Fable 5.1** | ✅ | `claude --model fable` | $0 (subscription) |

**Limites:** Janela 5h / Semana (reset segunda-feira)  
**Autenticação:** OAuth Token (first-party) - ✅ Ativa

### 3.2 GitHub Copilot CLI

| Fonte | Modelos | Status | Custo |
|---|---|---|---|
| **GitHub Copilot (Padrão)** | GPT-6 Luna, MAI-Code-1.1-Flash, GPT-5.x | ✅ Auto-seleção | AI Credits (plano) |
| **BYOK Anthropic** | Claude Opus/Sonnet/Haiku/Fable | ✅ Suportado | API Anthropic |
| **BYOK OpenAI** | GPT-4, GPT-4o, GPT-5, o1, etc. | ✅ Suportado | API OpenAI |
| **BYOK Azure OpenAI** | Deployments customizados | ✅ Suportado | API Azure |
| **BYOK Local (Ollama)** | Modelos locais | ✅ Suportado | Gratuito (local) |
| **Via 9Router** | Qualquer modelo roteado | ✅ Suportado | Conforme gateway |

**Testado:** Auto → GPT-6 Luna / MAI-Code-1.1-Flash  
**Autenticação:** GitHub OAuth - ✅ Ativa  
**Billing:** AI Credits (novo) / Premium Requests (legado)

### 3.3 Agy / Antigravity

| Modelo | Disponível | Status | Observação |
|---|---|---|---|
| **Gemini (Google)** | Configurado | ❌ Requer `GEMINI_API_KEY` (env var) | `modelProvider: "gemini"` no settings.json |

**Autenticação:** Environment Variable `GEMINI_API_KEY` - ❌ Não configurada  
**⚠️ Segurança:** NUNCA armazene a API key em arquivos de config. Use `setx GEMINI_API_KEY "sua-chave"` ou adicione ao profile do shell.

### 3.4 Gemini CLI

| Modelo | Disponível | Status |
|---|---|---|
| **Gemini API** | Configurado | ❌ API Key não configurada via env var |

**Autenticação:** Environment Variable `GEMINI_API_KEY` - ❌ Não configurada  
**⚠️ Segurança:** NUNCA armazene a API key em arquivos de config. Para limpar chave salva: `gemini config unset api_key`. Depois: `setx GEMINI_API_KEY "sua-chave"`.

### 3.5 9Router (Gateway)

| Modelo | Provedor | Status |
|---|---|---|
| **GPT-5.5** | OpenAI | ✅ Configurado (sem API key) |
| **Claude (via 9Router)** | Anthropic | ⚠️ Não configurado |
| **Outros** | Vários | Disponíveis via configuração |

**Endpoint:** `http://192.168.5.79:20128` (⚠️ Exposto em 0.0.0.0)

### 3.6 OpenCode

| Modelo | Status |
|---|---|
| **Múltiplos (Anthropic, OpenAI, etc.)** | Suportado, mas não autenticado |

### 3.7 KiloCode (VS Code Extension)

| Modelo | Status |
|---|---|
| **Via provedor configurado** | ✅ OAuth ativo (token válido até 2025) |
| **Acesso** | Apenas via IDE (não CLI worker) |

---

## 4. CAPACIDADES TÉCNICAS POR AGENTE

### 4.1 Matriz de Capacidades

| Capacidade | Claude Code | Copilot CLI | Agy | Gemini CLI | OpenCode | 9Router | KiloCode |
|---|---|---|---|---|---|---|---|
| **Editar arquivos** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (IDE) |
| **Executar terminal** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (IDE) |
| **Git / Worktrees** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ (IDE) |
| **Não-interativo (CLI)** | ✅ | ✅ | ✅ | ✅ | ✅ | N/A | ❌ |
| **Output estruturado** | ✅ JSONL | ✅ JSONL | ✅ JSON | ❌ | ✅ | N/A | ❌ |
| **Sessões isoladas** | ✅ `--resume` | ✅ `--session-id` | ✅ `--conversation` | ❌ | ✅ | N/A | ❌ |
| **Worktrees isolados** | ✅ | ✅ Testado | ✅ | ⚠️ | ✅ | N/A | ❌ |
| **Execução paralela** | ✅ Subagents | ✅ Fleet mode | ❌ | ❌ | ❌ | N/A | ❌ |
| **Agentes especializados** | ✅ Subagent types | ✅ Skills/Agents | ❌ | ❌ | ❌ | N/A | ❌ |
| **MCP Servers** | ✅ | ✅ Built-in + custom | ❌ | ✅ | ✅ | N/A | ❌ |
| **Integração Aletheia** | ✅ Native | ✅ Custom Provider | ✅ Native | ❌ | ⚠️ Detectado | ❌ | ❌ |

### 4.2 Detalhes por Agente

#### **Claude Code (COMANDANTE)**
- **Modelos:** Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.1
- **Subagents:** `general-purpose`, `Plan`, `code-simplifier`, `Explore`, `claude-code-guide`, etc.
- **Modelos por subagent:** Haiku, Sonnet, Opus, Fable (configurável)
- **Execução paralela:** Múltiplos `Agent` tools em uma mensagem = paralelos reais
- **Code Sovereignty:** Lead integra diffs, workers não escrevem no main checkout
- **Aletheia:** Built-in provider nativo (`provider: "claude"`)

#### **GitHub Copilot CLI (EQUIPE SECUNDÁRIA)**
- **Modos:** Interactive, Prompt (`-p`), Fleet (`--fleet`), Plan (`--plan`), Autopilot (`--autopilot`)
- **Fleet Mode:** Orquestração paralela interna (usa Alethe skill!)
- **Agentes:** `--agent <nome>`, `--plugin-dir`, skills de `.github/skills` e `.github/agents`
- **MCP:** Built-in `github-mcp-server`, `githubiq` + custom via `--additional-mcp-config`
- **BYOK:** Anthropic, OpenAI, Azure, Ollama (via env vars)
- **Sessões:** `--session-id <UUID>`, `--resume`, `--continue`
- **Worktrees:** `-C <path>` testado e funcionando
- **Output:** `--output-format json` (JSONL)
- **Limites:** `--max-ai-credits <N>` (mín 30)
- **Aletheia:** Como **custom provider** nativo

#### **Agy / Antigravity**
- **Modelos:** Gemini (requer API key)
- **Modos:** `plan`, `accept-edits`
- **Aletheia:** Built-in provider nativo (`provider: "agy"`)
- **Limitação:** Não usa modelos Claude

#### **9Router (GATEWAY)**
- **Função:** Roteamento de modelos, não worker direto
- **Modelos:** Roteia para Anthropic, OpenAI, Google, etc.
- **Integração:** Via BYOK em Copilot/Claude/OpenCode
- **Segurança:** ⚠️ Rodando em `0.0.0.0:20128` - precisa `--host 127.0.0.1`

---

## 5. INTEGRAÇÕES EFETIVAMENTE TESTADAS

| Integração | Testada | Resultado | Evidência |
|---|---|---|---|
| **Claude Code ↔ Aletheia (probe/doctor)** | ✅ | Funciona | `py scripts/orchestrate.py probe` detecta `loggedIn: true` |
| **Claude Code → Subagents paralelos** | ✅ | Funciona | Múltiplos `Agent` tools executam em paralelo |
| **Claude Code → Worktrees** | ✅ | Funciona | `git worktree add` + operações isoladas |
| **Copilot CLI → Non-interactive** | ✅ | Funciona | `copilot -p "task" --yolo` |
| **Copilot CLI → Worktrees** | ✅ | Funciona | `-C ../worktree` cria arquivos isolados |
| **Copilot CLI → Sessões independentes** | ✅ | Funciona | `--session-id <UUID>` isoladas |
| **Copilot CLI → JSON Output** | ✅ | Funciona | `--output-format json` (JSONL) |
| **Copilot CLI → Fleet Mode** | ✅ | Funciona | `--fleet` orquestra subagentes (usa Alethe skill) |
| **Copilot CLI → BYOK Anthropic** | ❌ | Não testado | Requer API key |
| **Copilot CLI → 9Router Gateway** | ❌ | Não testado | Requer config |
| **Agy ↔ Aletheia** | ❌ | Não testado | Requer `GEMINI_API_KEY` |
| **9Router ↔ Detect Tools** | ✅ | Funciona | `9router show all` detecta 8 ferramentas |
| **Aletheia Doctor/Probe** | ✅ | Funciona | Detecta providers instalados e auth status |

---

## 6. FUNÇÕES DELEGÁVEIS POR AGENTE

| Função | Claude Code | Copilot CLI | Agy | OpenCode | KiloCode |
|---|---|---|---|---|---|
| **Arquiteto / Planejamento** | ✅ Opus | ✅ GPT-5.5 (BYOK/9Router) | ❌ | ⚠️ | ❌ |
| **Implementação Backend** | ✅ Sonnet | ✅ GPT-5 (BYOK/9Router) | ❌ | ⚠️ | ❌ |
| **Implementação Frontend** | ✅ Sonnet | ✅ GPT-5 (BYOK/9Router) | ❌ | ⚠️ | ✅ (IDE) |
| **Code Review** | ✅ Haiku/Sonnet | ✅ GPT-4o-mini (BYOK) | ❌ | ⚠️ | ❌ |
| **Pesquisa / Análise** | ✅ Haiku | ✅ Fleet + Web | ❌ | ⚠️ | ❌ |
| **Documentação** | ✅ Haiku | ✅ GPT-4o-mini | ❌ | ⚠️ | ❌ |
| **Testes / Validação** | ✅ Haiku | ✅ GPT-4o-mini | ❌ | ⚠️ | ❌ |
| **Refatoração** | ✅ Sonnet | ✅ GPT-5 | ❌ | ⚠️ | ❌ |
| **Debugging** | ✅ Opus/Sonnet | ✅ GPT-5 | ❌ | ⚠️ | ❌ |

---

## 7. AGENTES QUE PODEM TRABALHAR SIMULTANEAMENTE

### 7.1 Paralelismo Nativo (Mesma Ferramenta)

| Ferramenta | Mecanismo | Isolamento | Limite |
|---|---|---|---|
| **Claude Code** | `Agent` tool múltiplos | Subagents (processos separados) | Quota subscription |
| **Copilot CLI** | `--fleet` + `--session-id` | Subagents (fleet) + Sessões (CLI) | AI Credits por sessão |
| **Agy** | Não suporta | N/A | N/A |
| **Gemini CLI** | Não suporta | N/A | N/A |

### 7.2 Paralelismo Cross-Ferramenta (Aletheia)

| Combinação | Isolamento | Coordenação |
|---|---|---|
| **Claude (worktree A) + Copilot (worktree B)** | ✅ Worktrees Git isoladas | Aletheia via handoff.md |
| **Claude (main) + Copilot (worktree)** | ✅ Parcial | Aletheia lead integra |
| **Múltiplos Copilot (sessões diferentes)** | ✅ Sessões + Worktrees | Aletheia coordena |
| **Múltiplos Claude (subagents)** | ✅ Processos | Aletheia não gerencia subagents diretamente |

### 7.3 Matriz de Concorrência Segura

| Cenário | Seguro | Observação |
|---|---|---|
| 2+ Claude Subagents | ✅ | Isolamento por processo |
| 2+ Copilot Sessions | ✅ | Isolamento por `--session-id` + worktree |
| 1 Claude + 1 Copilot | ✅ | Worktrees separadas obrigatórias |
| 2+ Agy | ❌ | Não suporta paralelismo |
| Claude + Agy | ✅ | Worktrees separadas |

---

## 8. AGENTES ACIONÁVEIS PELA ALETHEIA

### 8.1 Providers Nativos (Built-in)

| Provider | ID Aletheia | Status | Comando Launch |
|---|---|---|---|
| **Claude Code** | `claude` | ✅ Operacional | `claude --print --output-format stream-json --verbose --permission-mode acceptEdits --disallowedTools Agent,Workflow --strict-mcp-config --model <m> --effort <e>` |
| **Agy / Antigravity** | `agy` | ⚠️ Requer API Key | `agy --output-format json --mode accept-edits --print-timeout 300s --add-dir <cwd> --print=<task>` |
| **Codex** | `codex` | ❌ Não instalado | `codex --disable multi_agent exec --sandbox workspace-write --json --output-last-message <result> --cd <cwd> --config mcp_servers={} -` |
| **Kimi** | `kimi` | ❌ Não instalado | `kimi --output-format stream-json --prompt=<task>` |

### 8.2 Custom Providers (Configuráveis)

| Provider | Comando Base | Status | Modelos |
|---|---|---|---|
| **GitHub Copilot CLI** | `copilot -p "{task}" --yolo --output-format json -C "{cwd}" --session-id "{session_id}"` | ✅ Testado | GitHub defaults, BYOK Anthropic, OpenAI, Azure, Ollama, 9Router |
| **OpenCode** | `opencode ...` | ⚠️ Não autenticado | Múltiplos |

### 8.3 Configuração Aletheia para Copilot (Custom Provider)

```yaml
# Em playbooks.yaml → adapters
adapters:
  copilot:
    command: "copilot"
    args:
      - "-p"
      - "{task}"
      - "--yolo"
      - "--output-format"
      - "json"
      - "-C"
      - "{cwd}"
      - "--session-id"
      - "{session_id}"
    promptTransport: "argument"
    outputFormat: "jsonl"
    capabilities:
      readOnly: true
      write: true
      resume: true
      structuredOutput: true
      tokenUsage: true
```

### 8.4 Providers NÃO Acionáveis pela Aletheia

| Ferramenta | Motivo |
|---|---|
| **KiloCode (VS Code)** | Apenas extensão IDE, sem CLI exposto |
| **Gemini CLI** | Não autenticado, sem integração nativa |
| **VS Code Extensions (ChatGPT, Codex Audio, etc.)** | Apenas IDE, sem CLI worker |
| **9Router** | Gateway, não worker (usa via BYOK) |

---

## 9. LIMITAÇÕES, DEPENDÊNCIAS, AUTENTICAÇÕES E CUSTOS

### 9.1 Limitações Críticas

| Ferramenta | Limitação | Impacto |
|---|---|---|
| **Aletheia** | Onboarding incompleto (sem policy, sem budget) | Não pode orquestrar workers em produção |
| **Agy** | Requer `GEMINI_API_KEY` (env var) | Worker secundário inoperante |
| **Gemini CLI** | API Key não configurada via env var | Inoperante |
| **OpenCode** | Não autenticado | Inoperante |
| **9Router** | **CRÍTICO: HTTP plaintext exposto em 0.0.0.0:20128** | **Risco de segurança - MITM, acesso não autorizado** |
| **KiloCode** | Sem CLI worker | Não integra com Aletheia |
| **Codex/Kimi** | Não instalados | Menos opções de fallback |

### 9.2 Dependências

| Ferramenta | Dependências |
|---|---|
| **Aletheia** | Python 3.9+ (✅ 3.14.10 via `py`), Git, tmux (para worktrees paralelos) |
| **Copilot CLI** | Node.js (via npm), Git, GitHub OAuth |
| **Agy** | Python, `GEMINI_API_KEY` |
| **9Router** | Node.js, portas 20128 livres |
| **Claude Code** | Assinatura Anthropic ativa |

### 9.3 Autenticações

| Ferramenta | Método | Status | Validade |
|---|---|---|---|
| **Claude Code** | OAuth Token (first-party) | ✅ Ativa | Contínua (subscription) |
| **Copilot CLI** | GitHub OAuth | ✅ Ativa | Token refresh automático |
| **Agy** | Environment Variable: `GEMINI_API_KEY` | ❌ Ausente (env var não setada) | - |
| **Gemini CLI** | Environment Variable: `GEMINI_API_KEY` | ❌ Inválida/Ausente (env var não setada) | - |
| **OpenCode** | OAuth/Token | ❌ Não autenticado | - |
| **9Router** | API Keys provedores (via env vars) | ⚠️ Parcial | Conforme provedor |
| **KiloCode** | OAuth (Kilo) | ✅ Ativa | Até 2025 (token) |

**⚠️ IMPORTANTE:** Nenhuma API key deve ser armazenada em arquivos de configuração. Todas as chaves Google (Agy, Gemini CLI) devem vir exclusivamente de variáveis de ambiente (`GEMINI_API_KEY`).

### 9.4 Custos

| Ferramenta | Modelo de Custo | Limite Conhecido | Estimativa |
|---|---|---|---|
| **Claude Code** | Subscription (incluído) | 5h janela / semana | $0 marginal |
| **Copilot CLI** | AI Credits (plano GitHub) | Conforme plano | Variável |
| **Copilot BYOK Anthropic** | Pay-per-use Anthropic | Rate limits API | $3-15/M tokens |
| **Copilot BYOK OpenAI** | Pay-per-use OpenAI | Rate limits API | $2-30/M tokens |
| **Copilot 9Router** | Pay-per-use provedores | Conforme gateway | Variável |
| **Agy** | Pay-per-use Google | Rate limits Gemini | $0.075-3.50/M tokens |
| **Gemini CLI** | Pay-per-use Google | Rate limits API | $0.075-3.50/M tokens |
| **OpenCode** | Pay-per-use / Subscription | Desconhecido | Variável |
| **9Router Gateway** | Gratuito (software) + provedores | N/A | $0 + modelos |

---

## 10. ARQUITETURA RECOMENDADA DA TRIPULAÇÃO

### 10.1 Estrutura Hierárquica

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMANDANTE: CLAUDE CODE (OPUS 5.5)                   │
│              Orquestração suprema, decisões arquiteturais,                   │
│              integração final, code sovereignty                              │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ORQUESTRADOR: ALETHEIA (v23)                           │
│         Planejamento, delegação, budget, quota, worktrees, relatórios        │
│         Playbooks: complete, audit-at-scale, research, quality, parallel    │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   EQUIPE CLAUDE     │     │   EQUIPE COPILOT    │     │   GATEWAY 9ROUTER   │
│   (Subscription)    │     │   (AI Credits/BYOK) │     │   (Roteamento)      │
├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
│ Opus: Arquiteto     │     │ GPT-5.5: Arquiteto  │     │ Modelos: Todos      │
│ Sonnet: Implement.  │     │ GPT-5: Implement.   │     │ Roteia por custo/   │
│ Haiku: Review/Docs  │     │ GPT-4o-mini: Review │     │ capacidade          │
│ Fable: Análise      │     │ Fleet: Paralelo     │     │ BYOK: Anthropic/    │
│                     │     │ Sessões: Isoladas   │     │ OpenAI/Azure/Ollama │
│ Worktrees isoladas  │     │ Worktrees isoladas  │     │                     │
│ Subagents paralelos │     │ Agents customizados │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTEXTO COMPARTILHADO (Aletheia)                         │
│  • Handoff.md por worker      • State.json + Journal.jsonl                  │
│  • Diff.patch + Outcome.json  • AGENTS.md / CLAUDE.md unificados            │
│  • Budget tracking            • Quota monitoring                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Perfis de Custo (Playbooks Aletheia)

| Perfil | Tier Cheap | Tier Standard | Tier Strong | Uso |
|---|---|---|---|---|
| **savings** | Haiku / GPT-4o-mini | Sonnet / GPT-5 | Opus / GPT-5.5 | Economia máxima |
| **balanced** | Haiku / GPT-4o-mini | Sonnet / GPT-5 | Opus / GPT-5.5 | Padrão (recomendado) |
| **aggressive** | Sonnet / GPT-5 | Opus / GPT-5.5 | Opus xhigh / GPT-5.5 | Qualidade máxima |

### 10.3 Roteamento Inteligente por Fase

| Fase | Equipe Primária | Equipe Secundária | Gateway |
|---|---|---|---|
| **Pesquisa/Análise** | Claude Haiku (fleet) | Copilot Fleet (GPT-5) | 9Router para web |
| **Planejamento/Arquitetura** | Claude Opus | Copilot GPT-5.5 (BYOK) | 9Router fallback |
| **Implementação Backend** | Claude Sonnet | Copilot GPT-5 (BYOK) | - |
| **Implementação Frontend** | Claude Sonnet | Copilot GPT-5 (BYOK) | - |
| **Code Review** | Claude Haiku | Copilot GPT-4o-mini | - |
| **Testes/Validação** | Claude Haiku | Copilot GPT-4o-mini | - |
| **Documentação** | Claude Haiku/Fable | Copilot GPT-4o-mini | - |
| **Integração Final** | **Claude Opus (Lead)** | - | - |

### 10.4 Isolamento e Segurança

| Mecanismo | Implementação |
|---|---|
| **Worktrees Git** | Um por writer worker (`isolate: true`) |
| **Branches** | `alethe/<session>-<worker>` |
| **Sessões** | `--session-id` (Copilot) / `--resume` (Claude) |
| **Code Sovereignty** | Lead (Opus) integra todos os diffs via Edit/Write |
| **Budget** | `--max-ai-credits` (Copilot) + `budget` no plan (Aletheia) |
| **Quota** | `usage` monitora Claude + Codex; Agy/Gemini via usuário |

---

## 11. AÇÕES PENDENTES (REQUEREM AUTORIZAÇÃO)

| # | Ação | Comando | Prioridade | Bloqueia |
|---|---|---|---|---|
| 1 | Onboarding Aletheia | `py scripts/orchestrate.py playbook --init` → editar → `policy set` | 🔴 Crítica | Toda orquestração |
| 2 | Configurar GEMINI_API_KEY (env var) | `setx GEMINI_API_KEY "..."` (NUNCA em config files) | 🔴 Crítica | Worker Agy + Gemini CLI |
| 3 | Budget padrão Aletheia | `py scripts/orchestrate.py policy set --max-calls 20 --max-reported-cost-usd 5` | 🔴 Crítica | Controle de custos |
| 4 | **Segurança 9Router (CRÍTICO)** | Parar → `9router --host 127.0.0.1 --port 20128` (+ TLS se acesso remoto) | 🔴 Crítica | **Segurança - MITM, acesso LAN não autorizado** |
| 5 | Autenticar OpenCode | `opencode auth login` | 🟡 Importante | Worker terciário |
| 6 | Testar BYOK Anthropic (Copilot) | `COPILOT_PROVIDER_TYPE=anthropic COPILOT_PROVIDER_BASE_URL=https://api.anthropic.com COPILOT_PROVIDER_API_KEY=... copilot -p "test" --yolo` | 🟡 Importante | Modelos Claude no Copilot |
| 7 | Testar 9Router Gateway (Copilot) | `COPILOT_PROVIDER_BASE_URL=http://127.0.0.1:20128/v1 COPILOT_PROVIDER_TYPE=openai COPILOT_MODEL=gpt-5.5 copilot -p "test" --yolo` | 🟡 Importante | Multi-modelo no Copilot |
| 8 | Configurar Custom Provider Copilot na Aletheia | Adicionar em playbooks.yaml adapters | 🟡 Importante | Worker Copilot nativo |
| 9 | Teste integração completa | Plan 2 workers (Claude + Copilot) | 🟡 Importante | Validação arquitetura |

---

## 12. INFORMAÇÕES DESCONHECIDAS / NÃO VERIFICADAS

| Item | Status | Necessário Para |
|---|---|---|
| Modelos exatos do plano GitHub Copilot | ❌ Não verificado | Roteamento preciso |
| Limites de concorrência Copilot (sessões paralelas) | ❌ Não testado | Escalabilidade |
| Custo real AI Credits por modelo | ❌ Não verificado | Budget planning |
| Integração MCP servers compartilhados | ❌ Não testado | Ferramentas comuns |
| OpenCode models disponíveis | ❌ Não autenticado | Worker terciário |
| 9Router modelos além de GPT-5.5 | ❌ Não verificado | Gateway completo |
| KiloCode capabilities como agent | ❌ Não aplicável | - |

---

## 13. HISTÓRICO DE ATUALIZAÇÕES

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0 | 2026-11-05 | Claude Code (Opus 5.5) | Inventário inicial completo |
| 1.1 | 2026-11-06 | Claude Code (Opus 5.5) | Playbooks.yaml restaurado com custom providers; 9 skills instaladas; Spec Kit instalado; 9Router security fix aplicado (localhost) |

### 1.4 Skills de Orquestração e Segurança

| Skill | Versão | Caminho | Status | Uso |
|---|---|---|---|---|
| **Aletheia (alethe)** | v23 | `.agents\skills\alethe\` | ✅ Carregada, onboarding pendente | Orquestração principal |
| **Security Audit (security-audit)** | - | `.agents\skills\security-audit\` | ✅ Instalada via npx skills | Auditoria de segurança multi-fase |
| **Reverse API Engineer** | - | `.agents\skills\reverse-api-engineer\` | ✅ Criada | Reverse engineering Hora do Estilo |
| **Scrapling** | - | `.agents\skills\scrapling\` | ✅ Criada | Web scraping SPA |
| **Unslop** | - | `.agents\skills\unslop\` | ✅ Criada | Code quality AI slop detection |
| **LGPD Skills** | - | `.agents\skills\lgpd-skills\` | ✅ Criada | Conformidade LGPD Brasil |
| **Worktrunk** | - | `.agents\skills\worktrunk\` | ✅ Criada | Git worktree orchestration |
| **CLI Anything** | - | `.agents\skills\cli-anything\` | ✅ Criada | Universal CLI adapter |
| **Spec Kit** | - | `.agents\skills\spec-kit\` | ✅ Instalada + Criada | Spec-Driven Development |
| **Claude Mem** | - | `.agents\skills\claude-mem\` | ✅ Criada | Cross-session memory |
| **Matt Pocock Skills** | - | `.agents\skills\mattpocock-skills\` | ✅ Criada | TypeScript/React patterns |
| **OpenCode** | - | `.agents\skills\opencode\` | ✅ Criada | Worker terciário multi-modelo |
| **Kimi Code** | - | `.agents\skills\kimi\` | ✅ Criada | Large context (futuro) |

---

## 15. ESTADO ATUALIZADO APÓS INSTALAÇÃO (2026-11-06)

### 15.1 Matriz de Estado por Ferramenta (Atualizada)

| Ferramenta | Instalada | Autenticada | Configurada | Operacional | Testada | Skills |
|---|---|---|---|---|---|---|
| **Claude Code** | ✅ | ✅ OAuth | ✅ | ✅ | ✅ | ✅ |
| **GitHub Copilot CLI** | ✅ | ✅ GitHub | ✅ | ✅ | ✅ | ✅ |
| **Agy / Antigravity** | ✅ | ❌ (req. GEMINI_API_KEY) | ⚠️ Parcial | ❌ | ❌ | ✅ Skill pronta |
| **Gemini CLI** | ✅ | ❌ (API key) | ⚠️ Parcial | ❌ | ❌ | ✅ Skill pronta |
| **9Router** | ✅ | N/A (gateway) | ✅ Localhost | ✅ Parado | ⚠️ | Gateway |
| **OpenCode** | ✅ | ❌ | ⚠️ Parcial | ❌ | ❌ | ✅ Skill pronta |
| **KiloCode (VS Code)** | ✅ | ✅ OAuth | ✅ | ✅ (IDE) | ❌ (não CLI) | ❌ |
| **Aletheia** | ✅ | N/A | ✅ Playbooks restaurados | ⚠️ Onboarding | ✅ Doctor/Probe | ✅ |
| **Spec Kit** | ✅ | N/A | ✅ | ✅ | ⚠️ Pendente | ✅ |

### 15.2 Ações Críticas Resolvidas

| # | Ação | Status | Comando Executado |
|---|---|---|---|
| 1 | Playbooks.yaml restaurado | ✅ | Custom providers (copilot, agy), 3 profiles |
| 2 | 9 Skills prioridade criadas | ✅ | Em `.agents/skills/` |
| 3 | Spec Kit instalado | ✅ | `py -m pip install git+https://github.com/github/spec-kit.git` |
| 4 | 9Router security fix | ✅ | Parado, aguardando restart `--host 127.0.0.1` |

### 15.3 Próximas Ações Pendentes (Autorização Necessária)

| # | Ação | Comando | Prioridade |
|---|---|---|---|
| 1 | **GEMINI_API_KEY** (env var) | `setx GEMINI_API_KEY "sua-chave"` | 🔴 Crítica |
| 2 | Aletheia onboarding + budget | `py scripts/orchestrate.py policy set --max-calls 20 --max-reported-cost-usd 5` | 🔴 Crítica |
| 3 | 9Router restart localhost | `npx 9router --host 127.0.0.1 --port 20128 --no-browser --log` | 🔴 Crítica |
| 4 | OpenCode auth | `opencode auth login` | 🟡 Importante |
| 5 | Teste delegação real Aletheia | Plan 2 workers paralelos | 🟡 Importante |
| 6 | Spec Kit init projeto | `specify init navio-barber --integration copilot` | 🟡 Importante |

---

**PRÓXIMA ATUALIZAÇÃO:** Após execução ações críticas restantes (1-3).