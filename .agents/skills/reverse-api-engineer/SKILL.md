---
name: reverse-api-engineer
description: Reverse engineer APIs from web/mobile applications using network traffic analysis, request/response capture, and automated OpenAPI spec generation. Use when you need to discover undocumented APIs, understand backend contracts, or create API specifications from existing applications.
argument-hint: "[target URL | HAR file | PCAP file] | --output openapi.yaml | --format openapi|postman|insomnia"
metadata:
  version: "1.0"
  source: "https://github.com/anthropics/reverse-api-engineer"
  priority: "critical"
  category: "reverse-engineering"
---

# Reverse API Engineer

Reverse engineer APIs from live applications by capturing and analyzing network traffic.

## Capabilities

- **Traffic Capture**: Intercept HTTP/HTTPS requests via proxy, browser devtools (HAR), or packet capture (PCAP)
- **API Discovery**: Automatically group endpoints by path patterns, identify authentication, pagination, rate limits
- **Schema Inference**: Generate OpenAPI 3.1 specs with request/response schemas, examples, and error models
- **Authentication Analysis**: Detect auth schemes (Bearer, API Key, Cookie, OAuth, custom headers)
- **Rate Limit Detection**: Identify and document rate limiting headers and behaviors
- **GraphQL Introspection**: Parse GraphQL queries/mutations and generate SDL

## Installation

```bash
# Via pip (recommended)
pip install reverse-api-engineer

# Or via uv
uv pip install reverse-api-engineer

# Verify
reverse-api --version
```

## Usage

### From HAR file (browser export)
```bash
reverse-api har export.har --output api-spec.yaml --format openapi
```

### From live proxy (mitmproxy integration)
```bash
# Start proxy
reverse-api proxy --port 8080 --output api-spec.yaml

# Configure browser/app to use proxy, then browse the target app
# Press Ctrl+C to stop and generate spec
```

### From PCAP (network capture)
```bash
reverse-api pcap capture.pcap --output api-spec.yaml --filter "host api.example.com"
```

### From mitmproxy dump
```bash
reverse-api mitm dumpfile --output api-spec.yaml
```

## Output Formats

- `openapi` - OpenAPI 3.1 YAML (default)
- `postman` - Postman Collection v2.1
- `insomnia` - Insomnia v4/5 format
- `markdown` - Human-readable documentation

## Integration with Navio Barber

For Hora do Estilo reverse engineering:

```bash
# 1. Capture traffic while using Hora do Estilo app
reverse-api proxy --port 8080 --output hora-do-estilo-api.yaml

# 2. Or export HAR from browser devtools and convert
reverse-api har hora-do-estilo.har --output hora-do-estilo-api.yaml

# 3. Generate TypeScript types
reverse-api generate hora-do-estilo-api.yaml --lang typescript --output types/
```

## Configuration

Create `.reverse-api-config.yaml`:

```yaml
# Authentication patterns to detect
auth_patterns:
  - header: "Authorization"
    prefix: "Bearer "
  - header: "X-API-Key"
  - cookie: "session"

# Endpoint grouping
group_by:
  - path_prefix: "/api/v1"
  - domain: "api.horadoestilo.com.br"

# Rate limit headers to track
rate_limit_headers:
  - "X-RateLimit-Limit"
  - "X-RateLimit-Remaining"
  - "Retry-After"

# Pagination patterns
pagination:
  - param: "page"
  - param: "offset"
  - header: "Link"
```

## Output Example

```yaml
openapi: 3.1.0
info:
  title: Hora do Estilo API
  version: 1.0.0
servers:
  - url: https://api.horadoestilo.com.br/v1
paths:
  /appointments:
    get:
      summary: List appointments
      parameters:
        - name: date
          in: query
          schema:
            type: string
            format: date
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AppointmentList'
components:
  schemas:
    AppointmentList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/Appointment'
        pagination:
          $ref: '#/components/schemas/Pagination'
```

## Notes for Navio Barber

- Use with Playwright MCP for automated browser capture
- Combine with Context7 MCP for API documentation lookup
- Output feeds directly into Spec Kit for spec-driven development
- Essential for Phase 0 reverse engineering of Hora do Estilo reference app