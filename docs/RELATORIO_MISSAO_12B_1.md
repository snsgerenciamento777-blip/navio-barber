# RELATORIO_MISSAO_12B_1.md — Recuperação do Ambiente de Testes

**Data:** 2026-11-07  
**Missão:** 12B.1 — Recuperação do Ambiente de Testes  
**Projeto:** Navio Barber 2.0  
**Status:** Concluído

---

## 1. Diagnóstico da Causa Original

### Erro reportado
```
npm error code EUNSUPPORTEDPROTOCOL
npm error Unsupported URL Type "workspace:": workspace:*
```

### Versões do ambiente
| Ferramenta | Versão |
|------------|--------|
| Node.js | v26.13.0 |
| npm (inicial) | 11.20.0 |
| npm (usado para instalação) | 10.9.0 |

### Origem precisa do erro

O erro `EUNSUPPORTEDPROTOCOL` ocorre porque o `npm-package-arg` (biblioteca interna do npm) não reconhece `workspace:*` como um range de versão válido. O stack trace aponta para `npa.resolve()` tentando tratar `workspace:*` como um URL.

**Causa raiz:** Dupla causa:

1. **Pacotes locais sem `package.json`:** O `package.json` da raiz declara `"workspaces": ["apps/*", "packages/*"]`, mas `packages/database`, `packages/auth` e `packages/ui` não tinham `package.json`. Sem um `name` definido, o npm não consegue reconhecê-los como workspaces locais. Quando encontra `workspace:*` como dependência, não encontra o pacote local correspondente e tenta tratá-lo como URL de registro remoto, falhando com `EUNSUPPORTEDPROTOCOL`.

2. **Incompatibilidade do `workspace:*` com Node v26 + npm:** Mesmo após criar os `package.json` locais, o `workspace:*` continuou falhando. Substituído por caminhos `file:` relativos, que funcionam corretamente.

### Etapas tentadas antes da solução
1. `npm install` com npm 11.20.0 → falhou (EUNSUPPORTEDPROTOCOL)
2. `npm install --legacy-workspace-deps` → falhou (mesmo erro)
3. `npm install -g npm@10.9.0` → sucesso na instalação do npm 10.9.0
4. `npm install` com npm 10.9.0 → ainda falhou (EUNSUPPORTEDPROTOCOL)
5. Remoção de `package-lock.json` e `node_modules`, `npm install` limpo → ainda falhou
6. Criação de `package.json` para `packages/database`, `packages/auth`, `packages/ui` → avançou, mas `workspace:*` nas dependências dos apps ainda falhou
7. Substituição de `workspace:*` por `file:../caminho` → **sucesso**

---

## 2. Arquivos Modificados

| Arquivo | Alteração | Justificativa |
|---------|-----------|---------------|
| `packages/database/package.json` | **NOVO** — `{"name": "@navio-barber/database", ...}` | Permitir que o npm reconheça o pacote local como workspace |
| `packages/auth/package.json` | **NOVO** — `{"name": "@navio-barber/auth", ...}` | Permitir que o npm reconheça o pacote local como workspace |
| `packages/ui/package.json` | **NOVO** — `{"name": "@navio-barber/ui", ...}` | Permitir que o npm reconheça o pacote local como workspace |
| `apps/api/package.json` | `@navio-barber/database`: `workspace:*` → `file:../packages/database`; `@navio-barber/auth`: `workspace:*` → `file:../packages/auth` | `workspace:*` não resolvido pelo ambiente npm/Node disponível |
| `apps/web/package.json` | `@navio-barber/ui`: `workspace:*` → `file:../packages/ui`; `@navio-barber/api`: `workspace:*` → `file:../apps/api` | `workspace:*` não resolvido pelo ambiente npm/Node disponível |
| `apps/api/src/lib/password.ts` | Adicionada validação de formato no `verifyPassword()` (retorna `false` se hash não tem `salt:key`) | Corrigir falha de teste: hash malformado causava `TypeError` |
| `apps/api/src/routers/shop-ownership.test.ts` | `toContar` → `toContain` | Corrigir erro de digitação no teste |

### Arquivos criados (novos)
| Arquivo | Conteúdo |
|---------|----------|
| `packages/database/package.json` | Manifesto do pacote `@navio-barber/database` |
| `packages/auth/package.json` | Manifesto do pacote `@navio-barber/auth` |
| `packages/ui/package.json` | Manifesto do pacote `@navio-barber/ui` |

---

## 3. Comando de Instalação Utilizado

```powershell
# 1. Instalar npm 10.9.0 (o package.json especifica packageManager: npm@10.9.0)
npm install -g npm@10.9.0

# 2. Limpar estado anterior (primeira tentativa)
Remove-Item -LiteralPath "package-lock.json" -Recurse -Force
Remove-Item -LiteralPath "node_modules" -Recurse -Force

# 3. Instalar dependências
npm install
```

**Resultado:** `added 750 packages, and audited 761 packages in 4m`

---

## 4. Resultado do Typecheck

O typecheck não pôde ser executado com sucesso devido a erros de configuração pré-existentes no `tsconfig.json` da raiz, não relacionados às alterações desta missão:

| Erro | Linha | Descrição |
|------|-------|-----------|
| `TS5025` | `tsconfig.json:12` | `noFallthroughCaseInSwitch` é opção desconhecida (deveria ser `noFallthroughCasesInSwitch`) |
| `TS5090` | `tsconfig.json:22-27` | Caminhos não-relativos em `paths` sem `baseUrl` definido |

Esses erros existem independentemente das alterações da Missão 12B.1 e são de configuração pré-existente do projeto. Não foram corrigidos para evitar alterar escopo fora da missão.

---

## 5. Resultado Individual dos Quatro Arquivos de Teste

Todos os testes foram executados com **vitest v2.1.9** no ambiente Node v26.13.0.

| Arquivo de Teste | Testes | Passou | Falhou | Status |
|------------------|--------|--------|--------|--------|
| `src/lib/password.test.ts` | 5 | 5 | 0 | ✅ APROVADO |
| `src/routers/shop-ownership.test.ts` | 4 | 4 | 0 | ✅ APROVADO |
| `src/routers/input-validation.test.ts` | 7 | 7 | 0 | ✅ APROVADO |
| `src/routers/multi-tenant-security.test.ts` | 8 | 8 | 0 | ✅ APROVADO |
| **Total** | **24** | **24** | **0** | ✅ **TODOS APROVADOS** |

### Saída completa do vitest

```
Test Files  4 passed (4)
Tests       24 passed (24)
Start at 00:06:36
Duration 2.52s (transform 287ms, setup 0ms, collect 517ms, tests 876ms, environment 2ms, prepare 1.81s)
```

### Detalhe por arquivo

**`password.test.ts` (5 testes):**
- ✅ deve gerar hash diferente para a mesma senha em chamadas diferentes (salt aleatório)
- ✅ deve verificar senha correta
- ✅ deve rejeitar senha incorreta
- ✅ deve rejeitar hash malformado
- ✅ hash deve conter salt e chave separados por dois pontos

**`shop-ownership.test.ts` (4 testes):**
- ✅ deve permitir acesso quando usuário é dono da loja
- ✅ deve rejeitar acesso quando usuário não é dono da loja (loja A vs loja B)
- ✅ deve rejeitar acesso com shopId inexistente
- ✅ erro de proibido deve ter código FORBIDDEN

**`input-validation.test.ts` (7 testes):**
- ✅ deve aceitar busca com até 100 caracteres
- ✅ deve rejeitar busca com mais de 100 caracteres
- ✅ deve aceitar busca ausente
- ✅ deve exigir userId como string
- ✅ deve rejeitar userId ausente
- ✅ deve aceitar dados válidos de criação
- ✅ deve rejeitar startAt inválido

**`multi-tenant-security.test.ts` (8 testes):**
- ✅ usuário da loja A não deve acessar dados da loja B (dashboard)
- ✅ usuário da loja A deve acessar dados da própria loja (dashboard)
- ✅ usuário não deve criar agendamento em loja que não possui (appointment create)
- ✅ usuário não deve modificar agendamento de outra loja (updateStatus/cancel/reschedule)
- ✅ usuário não deve listar clientes de loja que não possui (customer list)
- ✅ usuário não deve obter cliente de outra loja (customer getById)
- ✅ getByPeriod deve ser protectedProcedure (não publicProcedure)
- ✅ customer list/getById/getHistory devem ser protectedProcedure

---

## 6. Falhas Encontradas e Correções Aplicadas

### Falha 1: `toContar` em shop-ownership.test.ts

**Arquivo:** `apps/api/src/routers/shop-ownership.test.ts:64`  
**Erro:** `Invalid Chai property: toContar. Did you mean "toContain"?`  
**Causa:** Erro de digitação no teste — método inexistente `toContar` em vez de `toContain`  
**Correção:** Alterado `toContar("não possui acesso")` para `toContain("não possui acesso")`  
**Resultado após correção:** Teste aprovado

### Falha 2: Hash malformado em verifyPassword

**Arquivo:** `apps/api/src/lib/password.ts:20`  
**Erro:** `TypeError: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined`  
**Causa:** Quando `verifyPassword` recebe um hash sem o separador `:` (ex: `"hash-invalido"`), `hashed.split(":")` retorna um array com um elemento, `key` fica `undefined`, e `Buffer.from(undefined, "hex")` lança TypeError  
**Correção:** Adicionada validação de formato — se `parts.length !== 2`, retorna `false` imediatamente  
**Resultado após correção:** Teste aprovado

---

## 7. Pendências que Impedem a Validação Completa

| Pendência | Descrição | Impacto |
|-----------|-----------|---------|
| Typecheck do tsconfig | Erros pré-existentes (`noFallthroughCaseInSwitch` typo, `paths` sem `baseUrl`) impedem `tsc --noEmit` | Não afeta execução dos testes de segurança (vitest funciona independentemente) |
| Dependências vulneráveis | `npm audit` reportou 21 vulnerabilidades (15 moderate, 3 high, 3 critical) em pacotes de terceiros | Não relacionadas às alterações de segurança da missão; requerem `npm audit fix` separado |
| package-lock.json | Foi removido e recriado durante a recuperação; versão atual reflete o estado pós-instalação | Deve ser commitado junto com as alterações |

---

## Resumo Executivo

O ambiente de testes foi recuperado com sucesso. Todas as 24 vulnerabilidades de segurança testadas em 4 arquivos passaram. A causa raiz foi a ausência de `package.json` nos pacotes locais do monorepo (`packages/database`, `packages/auth`, `packages/ui`) combinada com a incompatibilidade do protocolo `workspace:*` com o ambiente Node v26 + npm disponível. A solução envolveu criar os manifests de pacote ausentes e substituir `workspace:*` por referências `file:` relativas.

**Testes de segurança: 24/24 aprovados ✅**
