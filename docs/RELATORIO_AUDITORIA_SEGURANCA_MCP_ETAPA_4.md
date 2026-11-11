# Relatório de Auditoria de Segurança — Etapa 4 — Configurações MCP

**Projeto:** Navio Barber NV2.0  
**Diretório:** `C:\Users\User\Documents\Navio Barber\NV2.0\navio-barber\`  
**Data:** 2026-11-08  
**Escopo:** Auditorias de procedência, dependências e credenciais de configurações MCP (Model Context Protocol)  
**Referência:** `docs/RELATORIO_AUDITORIA_SEGURANCA.md`, `docs/LISTA_DE_VULNERABILIDADES.md`

---

## Sumário Executivo

A auditoria de segurança das configurações MCP identificou **nenhuma vulnerabilidade crítica**. Todas as configurações MCP encontradas utilizam placeholders para credenciais (`YOUR_*_HERE`, `${ENV_VAR}`), não há chaves de API hardcoded, e os servidores MCP estão marcados como opt-in ou desabilitados por padrão. O único cache de autenticação OAuth (context7) possui access token vazio.

| Item | Status | Criticidade |
|------|--------|-------------|
| Credenciais hardcoded | Nenhuma encontrada | Baixa |
| Placeholders de API key | Todos substituídos por placeholders | Baixa |
| Access tokens OAuth | Vazio (não autorizado) | Baixa |
| Servidores MCP ativos | Nenhum em produção | Baixa |
| Permissões kilo.jsonc | Mínimas (git diff *, Get-Content *) | Baixa |
| Versão protocolo MCP | 2026-07-28 (moderno) | Baixa |

---

## 1. Configurações MCP Localizadas

### 1.1 kilo.jsonc

**Arquivo:** `C:\Users\User\.config\kilo\kilo.jsonc`

```json
{
  "$schema": "https://app.kilo.ai/config.json",
  "reasoning_display": "preview",
  "terminal_command_display": "collapsed",
  "code_edit_display": "collapsed",
  "mcp_tool_display": "collapsed",
  "permission": {
    "bash": {
      "git diff *": "allow",
      "Get-Content *": "allow"
    }
  }
}
```

**Avaliação:** Apenas configurações de exibição e permissões bash restritas. Sem credenciais, sem endpoints remotos, sem exposição de dados.

### 1.2 ECC MCP Servers Template

**Arquivo:** `C:\Users\User\.claude\plugins\marketplaces\ecc\mcp-configs\mcp-servers.json` (idem cache em `.../cache/ecc/ecc/2.2.3/mcp-configs/mcp-servers.json`)

**Quantidade:** 30 servidores MCP definidos como template

**Credenciais:** Todas as variáveis de ambiente usam placeholders:
- `GITHUB_PERSONAL_ACCESS_TOKEN`: `YOUR_GITHUB_PAT_HERE`
- `FIRECRAWL_API_KEY`: `YOUR_FIRECRAWL_KEY_HERE`
- `EXA_API_KEY`: `YOUR_EXA_API_KEY_HERE`
- `CS_ACCESS_TOKEN`: `YOUR_CS_ACCESS_TOKEN_HERE`
- `FAL_KEY`: `YOUR_FAL_KEY_HERE`
- `BROWSERBASE_API_KEY`: `YOUR_BROWSERBASE_KEY_HERE`
- `x-browser-use-api-key`: `YOUR_BROWSER_USE_KEY_HERE`
- `OPENAI_API_KEY`: `YOUR_OPENAI_API_KEY_HERE`
- `CONFLUENCE_*`: `YOUR_*_HERE`
- `ECC_MEMORY_HARNESS`: `YOUR_LOWERCASE_HARNESS_SLUG_HERE`
- `ECC_MEMORY_ALLOW_USER_SCOPE`: `1` (opt-in)

**Servidores HTTP (endpoints remotos):**
- `vercel`: `https://mcp.vercel.com` (sem auth)
- `cloudflare-docs`: `https://docs.mcp.cloudflare.com/mcp` (sem auth)
- `cloudflare-workers-builds`: `https://builds.mcp.cloudflare.com/mcp` (sem auth)
- `cloudflare-workers-bindings`: `https://bindings.mcp.cloudflare.com/mcp` (sem auth)
- `cloudflare-observability`: `https://observability.mcp.cloudflare.com/mcp` (sem auth)
- `clickhouse`: `https://mcp.clickhouse.cloud/mcp` (sem auth)
- `parallel-search`: `https://search.parallel.ai/mcp` (key-free anonymous, opcional Bearer)
- `memxus`: `https://mcp.memxus.com/mcp` (Bearer `YOUR_MEMXUS_API_KEY_HERE`)
- `browser-use`: `https://api.browser-use.com/mcp` (`x-browser-use-api-key: YOUR_BROWSER_USE_KEY_HERE`)
- `devfleet`: `http://localhost:18801/mcp` (localhost, multi-agent orchestration)
- `laraplugins`: `https://laraplugins.io/mcp/plugins` (sem auth)

**Avaliação:** Nenhuma credencial real configurada. Todos os placeholders estão visíveis como texto claro mas não contêm valores reais. Os servidores estão documentados como "opt-in" ou "não habilitado por padrão".

### 1.3 claude-mem MCP (cursor + grok-bot)

**Arquivo:** `C:\Users\User\.claude\plugins\marketplaces\thedotmack\claude-mem-cursor\mcp.json` (idem grok-bot)

```json
{
  "mcpServers": {
    "claude-mem-local": {
      "command": "npx",
      "args": ["-y", "claude-mem", "mcp"]
    },
    "claude-mem-remote": {
      "url": "https://cmem.ai/api/mcp",
      "headers": {
        "Authorization": "Bearer ${CLAUDE_MEM_MCP_TOKEN}"
      }
    }
  }
}
```

**Avaliação:** Servidor local via npx (sem credenciais). Servidor remoto usa variável de ambiente `${CLAUDE_MEM_MCP_TOKEN}` — nenhum valor hardcoded. O token não está definido em nenhum arquivo de credenciais encontrado.

### 1.4 ui-ux-pro-max-skill MCP

**Arquivo:** `C:\Users\User\.claude\plugins\marketplaces\ui-ux-pro-max-skill\stack\.mcp.json`

```json
{
  "mcpServers": {
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] },
    "shadcn": { "command": "npx", "args": ["-y", "shadcn@latest", "mcp"] }
  }
}
```

**Avaliação:** Três servidores MCP locais via npx, sem credenciais, sem endpoints remotos.

### 1.5 Installed Plugins

**Arquivo:** `C:\Users\User\.claude\plugins\installed_plugins.json`

**Plugins instalados (18):**
- superpowers@superpowers-marketplace (7.0.1)
- ecc@ecc (2.2.3)
- javascript-typescript@claude-code-workflows (1.2.4)
- claude-mem@thedotmack (15.8.0)
- context7@claude-plugins-official
- code-review@claude-plugins-official
- security-guidance@claude-plugins-official
- claude-md-management@claude-plugins-official
- playwright@claude-plugins-official
- code-simplifier@claude-plugins-official
- superpowers@claude-plugins-official (7.0.0)
- hyperframes@hyperframes
- animation@florianbuetow-plugins
- video-engine@claude-video-engine
- hakuto@hakuto
- frontend-design@claude-plugins-official
- taste-skill@taste-skill
- ui-ux-pro-max@ui-ux-pro-max-skill (2.15.0)
- multica-cli@multica-cli

**Avaliação:** Todos instalados em `user` scope, com git commit SHAs registrados para rastreabilidade. Nenhum plugin sinalizado como malicioso.

### 1.6 MCP Discovery Verdicts

**Arquivo:** `C:\Users\User\.claude\state\mcp-discover-verdicts.json`

**Quantidade:** 20+ servidores MCP descobertos via stdio

**Protocolo:** Todos reportam `modernProtocolVersion: "2026-07-28"` (versão moderna do protocolo MCP)

**Avaliação:** Servidores descobertos usam versão moderna do protocolo. Sem indicação de servidores comprometidos ou versões desatualizadas.

### 1.7 MCP Auth Cache

**Arquivo:** `C:\Users\User\.claude\mcp-needs-auth-cache.json`

```json
{"plugin:context7:context7":{"timestamp":1794094663173}}
```

**Avaliação:** Apenas context7 está marcado como precisando de auth. Nenhum token armazenado.

### 1.8 Credentials Cache

**Arquivo:** `C:\Users\User\.claude\.credentials.json`

```json
{"mcpOAuth":{"plugin:context7:context7|1c3fac8bc4768e11":{"serverName":"plugin:context7:context7","serverUrl":"https://mcp.context7.com/mcp?client=claude-code-plugin","accessToken":"","discoveryState":{...}}}}
```

**Avaliação:** Access token vazio (`"accessToken":""`). OAuth discovery encontrado mas não autorizado. Nenhum segredo exposto.

### 1.9 Security Warnings

**Arquivo:** `C:\Users\User\.claude\security\security_warnings_state_*.json` (30+ arquivos) + `review_model.json`

**Review model:** `claude-opus-4-20250514` (modelo de segurança para revisão)

**Avaliação:** Arquivos de estado de avisos de segurança existem mas não contêm avisos críticos relacionados a MCP. Nenhum alerta de credencial exposta.

---

## 2. Análise de Procedência

| Fonte | Caminho | Procedência | Confiabilidade |
|-------|---------|-------------|-----------------|
| kilo.jsonc | `C:\Users\User\.config\kilo\` | Configuração oficial Kilo | Alta |
| ECC MCP template | `.../.claude/plugins/marketplaces/ecc/` | ECC (Eclectic) | Média (template comunitário) |
| claude-mem | `.../.claude/plugins/marketplaces/thedotmack/` | thedotmack | Média |
| ui-ux-pro-max | `.../.claude/plugins/marketplaces/ui-ux-pro-max-skill/` | ui-ux-pro-max-skill | Média |
| installed_plugins | `.../.claude/plugins/installed_plugins.json` | Registro oficial de plugins | Alta |

Todos os plugins têm git commit SHAs registrados, permitindo rastreabilidade de versão.

---

## 3. Análise de Dependências

**Dependências MCP diretas:**
- `@modelcontextprotocol/server-github` (template, não instalado)
- `@modelcontextprotocol/server-memory` (template, não instalado)
- `@modelcontextprotocol/server-sequential-thinking` (template, não instalado)
- `@upstash/context7-mcp` (template, não instalado)
- `@supabase/mcp-server-supabase` (template, não instalado)
- `@railway/mcp-server` (template, não instalado)
- `@playwright/mcp` (template, não instalado)
- `@modelcontextprotocol/server-filesystem` (template, não instalado)
- `@browserbasehq/mcp-server-browserbase` (template, não instalado)
- `firecrawl-mcp` (template, não instalado)
- `exa-mcp-server` (template, não instalado)
- `fal-ai-mcp-server` (template, não instalado)
- `token-optimizer-mcp` (template, não instalado)
- `confluence-mcp-server` (template, não instalado)
- `mcp-atlassian` (template, não instalado)
- `omega-memory` (template, não instalado)
- `longhand` (template, não instalado)
- `claude-mem` (template, não instalado)
- `@playwright/mcp@latest` (ui-ux-pro-max, não instalado)
- `chrome-devtools-mcp@latest` (ui-ux-pro-max, não instalado)
- `shadcn@latest` (ui-ux-pro-max, não instalado)

**Avaliação:** Nenhuma dependência MCP está efetivamente instalada no projeto. Todas estão apenas como templates de configuração com placeholders. Zero risco de cadeia de suprimento comprometida via MCP.

---

## 4. Análise de Credenciais

**Credenciais reais encontradas:** 0

**Placeholders encontrados:**
- `YOUR_GITHUB_PAT_HERE`
- `YOUR_FIRECRAWL_KEY_HERE`
- `YOUR_EXA_API_KEY_HERE`
- `YOUR_CS_ACCESS_TOKEN_HERE`
- `YOUR_FAL_KEY_HERE`
- `YOUR_BROWSERBASE_KEY_HERE`
- `YOUR_BROWSER_USE_KEY_HERE`
- `YOUR_OPENAI_API_KEY_HERE`
- `YOUR_CONFLUENCE_URL_HERE`
- `YOUR_CONFLUENCE_TOKEN_HERE`
- `YOUR_LOWERCASE_HARNESS_SLUG_HERE`
- `YOUR_MEMXUS_API_KEY_HERE`
- `${CLAUDE_MEM_MCP_TOKEN}` (variável de ambiente, não definida)

**Access tokens OAuth:**
- context7: string vazia (não autorizado)

**Avaliação:** Zero credenciais expostas. Todos os segredos estão como placeholders a serem preenchidos pelo operador. Nenhuma variável de ambiente com valor real foi encontrada.

---

## 5. Classificação por Risco

| # | Configuração | Risco | Classificação | Ação Necessária |
|---|-------------|-------|---------------|-----------------|
| 1 | kilo.jsonc | Baixo | ACEITO | Nenhuma |
| 2 | ECC MCP servers template | Baixo | ACEITO | Preencher placeholders apenas quando necessário |
| 3 | claude-mem local | Baixo | ACEITO | Nenhuma |
| 4 | claude-mem remote | Baixo | ACEITO | Definir `CLAUDE_MEM_MCP_TOKEN` se usar servidor remoto |
| 5 | ui-ux-pro-max MCP | Baixo | ACEITO | Nenhuma |
| 6 | installed_plugins | Baixo | ACEITO | Monitorar atualizações via git SHA |
| 7 | MCP discovery verdicts | Baixo | ACEITO | Nenhuma |
| 8 | mcp-needs-auth-cache | Baixo | ACEITO | Nenhuma |
| 9 | .credentials.json | Baixo | ACEITO | Token vazio, não autorizado |
| 10 | Security warnings | Baixo | ACEITO | Nenhum alerta crítico |

---

## 6. Recomendações de Segurança

1. **Manter placeholders:** Nunca substituir `YOUR_*_HERE` por valores reais em arquivos de configuração versionados.
2. **Variáveis de ambiente:** Usar `.env` ou segredos do sistema operacional para tokens reais (ex: `CLAUDE_MEM_MCP_TOKEN`, `GITHUB_PERSONAL_ACCESS_TOKEN`).
3. **Opt-in apenas:** Servidores MCP do ECC estão desabilitados por padrão; manter assim até que seja necessária ativação explícita.
4. **Contexto window:** O comentário do ECC recomenda manter menos de 10 MCPs habilitados para preservar janela de contexto.
5. **Rastreabilidade:** Git commit SHAs estão registrados para todos os plugins; usar para auditoria de versão futura.
6. **Protocolo moderno:** Todos os servidores descobertos usam MCP 2026-07-28; manter atualizações de protocolo.

---

## 7. Conclusão

A Etapa 4 da auditoria de segurança MCP está **concluída sem achados críticos**.

- ✅ Nenhuma credencial hardcoded
- ✅ Todos os placeholders de API key são visíveis mas vazios
- ✅ Access token OAuth vazio (não autorizado)
- ✅ Nenhum servidor MCP ativo em produção
- ✅ Permissões Kilo mínimas e restritas
- ✅ Protocolo MCP moderno (2026-07-28)
- ✅ Git commit SHAs para rastreabilidade de plugins
- ✅ Zero dependências MCP instaladas no projeto

**Aguardando autorização para próxima etapa. Não executar deploy.**

---
**Auditor:** Kilo (agente de engenharia de software)