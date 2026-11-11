# INVENTARIO_FERRAMENTAS_NAVIO.md

Relatório de instalação e validação do ambiente de desenvolvimento Navio Barber 2.0.
Data: 2026-11-05 | Operador: Kilo (Alethe v23) | Aprovado para revisão do comandante.

## Resumo executivo

Todas as 4 ferramentas solicitadas foram instaladas e validadas individualmente, sem sobrescrever configurações existentes, sem exposição de credenciais, sem custos e sem modificar o código-fonte do Navio Barber.

RAM total: 8,4 GB (~7,8 GB utilizável). Prioridade: economia de RAM, estabilidade, custo zero.

---

## 1. Web Lens

| Campo | Valor |
|---|---|
| Nome | Web Lens |
| Versão | 0.2.17 |
| Repositório | https://github.com/collectiveai-team/vscode-web-lens |
| Licença | MIT |
| Local de instalação | `%USERPROFILE%\.vscode\extensions\collectiveai-team.web-lens-0.2.17` |
| Status de funcionamento | Instalado e ativo no VS Code 1.144.0 (confirmado via `code --list-extensions`) |
| Consumo aproximado de recursos | Baixo; painel de navegador embarcado sob demanda, sem residência permanente |
| Integração com Copilot | Não é MCP; entrega contexto (HTML, screenshot, logs) ao agente via clipboard ou comando de inserção |
| Integração com Aletheia v23 | Possível: operador pode usar Web Lens para inspecionar páginas e colar evidências nos briefs dos workers; não é um worker CLI |

## 2. Playwright MCP

| Campo | Valor |
|---|---|
| Nome | Playwright MCP (`@playwright/mcp`) |
| Versão | latest (via npx) |
| Repositório | https://github.com/microsoft/playwright-mcp |
| Licença | Apache-2.0 |
| Local de instalação | Configurado como servidor MCP do usuário em `~/.copilot/mcp-config.json`; execução via npx sob demanda |
| Status de funcionamento | Adicionado com sucesso (`copilot mcp list` confirma: playwright, local, tools: \*) |
| Consumo aproximado de recursos | Baixo/Médio; inicia navegador headless somente quando chamado |
| Integração com Copilot | Sim — servidor MCP local disponível para o Copilot CLI |
| Integração com Aletheia v23 | Possível: pode ser usado como ferramenta de inspeção visual em workers de revisão ou diagnóstico, respeitando o contrato de não-delegação |

## 3. Context7 MCP

| Campo | Valor |
|---|---|
| Nome | Context7 Documentation MCP Server (`@upstash/context7-mcp`) |
| Versão | 4.5.0 |
| Repositório | https://github.com/upstash/context7 |
| Licença | MIT |
| Local de instalação | Configurado como servidor MCP do usuário em `~/.copilot/mcp-config.json`; execução via npx sob demanda |
| Status de funcionamento | Respondendo: `initialize` e `tools/list` retornam 2 ferramentas (`resolve-library-id`, `query-docs`) |
| Consumo aproximado de recursos | Muito baixo; chamada HTTP sob demanda, sem residência |
| Integração com Copilot | Sim — servidor MCP local disponível para o Copilot CLI |
| Integração com Aletheia v23 | Possível: workers podem consultar documentação atualizada de bibliotecas/frameworks durante briefs de pesquisa |

## 4. API Reverse Engineer

| Campo | Valor |
|---|---|
| Nome | API Reverse Engineer |
| Versão | 1.10.0 |
| Repositório | https://github.com/ctala/api-reverse-engineer |
| Licença | MIT |
| Local de instalação | Clonado em `%TEMP%\api-reverse-engineer`; pronto para carregar como extensão descompactada no Chrome |
| Status de funcionamento | Validado: carregado com sucesso como extensão descompactada (`--load-extension`) em perfil Chrome separado |
| Consumo aproximado de recursos | Baixo; extensão inativa até ser aberta pelo usuário |
| Integração com Copilot | Não (extensão de navegador, não MCP) |
| Integração com Aletheia v23 | Limitada: pode gerar evidências de inspeção de API que o operador incorpora nos relatórios; não interage diretamente com workers |

---

## Validação por ferramenta (Etapa 4)

| Ferramenta | Teste | Resultado |
|---|---|---|
| Web Lens | `code --list-extensions` | `collectiveai-team.web-lens` presente ✅ |
| Playwright MCP | `copilot mcp list` | `playwright` (local) listado ✅ |
| Context7 MCP | `tools/list` via protocolo MCP | 2 ferramentas retornadas ✅ |
| API Reverse Engineer | Chrome `--load-extension` | Extensão carregada em perfil separado ✅ |

---

## Segurança (Etapa 3)

- Nenhuma configuração MCP existente foi sobrescrita (o Copilot não tinha MCPs antes; apenas `github-mcp-server` builtin já existia).
- Nenhum arquivo foi apagado.
- Nenhuma API key, cookie ou token foi exposto ou exportado.
- Nenhuma autenticação existente foi alterada.
- Nenhum dado privado de terceiros foi acessado.
- O código-fonte do Navio Barber não foi modificado.
- Nenhum serviço pago ou dependência com cobrança obrigatória foi instalado.
- Todas as fontes são os repositórios oficiais indicados.

---

## Próximos passos

A instalação está concluída. Nenhuma engenharia reversa foi iniciada e nenhuma alteração foi feita no aplicativo. Relatório submetido para aprovação do comandante antes de qualquer uso das ferramentas.
