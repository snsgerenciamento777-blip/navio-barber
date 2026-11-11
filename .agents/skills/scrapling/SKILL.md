---
name: scrapling
description: High-performance, async-first web scraping framework for Python with built-in anti-bot bypass, JavaScript rendering, and structured data extraction. Use when you need to scrape modern SPAs, handle dynamic content, bypass Cloudflare/anti-bot, or extract structured data from complex web pages.
argument-hint: "[url | --selector CSS/XPATH] | --output json|csv|yaml | --render js|static | --bypass cloudflare|datadome|none"
metadata:
  version: "2.0"
  source: "https://github.com/ D4Vinci/Scrapling"
  priority: "critical"
  category: "web-scraping"
---

# Scrapling

Modern, async web scraping framework with anti-bot bypass and JavaScript rendering.

## Key Features

- **Async-first**: Built on `httpx` and `asyncio` for high concurrency
- **JS Rendering**: Playwright/Pyppeteer integration for SPA scraping
- **Anti-Bot Bypass**: Cloudflare, DataDome, Akamai, PerimeterX, etc.
- **Structured Extraction**: CSS/XPath selectors with automatic pagination
- **Session Management**: Cookie persistence, header rotation, proxy support
- **Rate Limiting**: Built-in polite scraping with configurable delays

## Installation

```bash
# Core (static scraping)
pip install scrapling

# With JavaScript rendering (Playwright)
pip install "scrapling[playwright]"
playwright install chromium

# With all extras
pip install "scrapling[all]"
```

## Quick Start

```python
import asyncio
from scrapling import Adaptor, PlayWrightFetcher

async def scrape_hora_do_estilo():
    # Static fetching (fast)
    adaptor = Adaptor.get("https://horadoestilo.com.br")
    
    # Extract with CSS selectors
    services = adaptor.css(".service-card::text").getall()
    prices = adaptor.css(".price::text").getall()
    
    # JavaScript rendering for SPA
    fetcher = PlayWrightFetcher(headless=True)
    page = await fetcher.get("https://app.horadoestilo.com.br/booking")
    await page.wait_for_selector(".calendar-slot")
    
    slots = page.css(".calendar-slot::attr(data-time)").getall()
    return {"services": services, "prices": prices, "slots": slots}

asyncio.run(scrape_hora_do_estilo())
```

## Anti-Bot Bypass

```python
from scrapling.fetchers import CloudflareBypassFetcher

# Automatic Cloudflare challenge solving
fetcher = CloudflareBypassFetcher(
    headless=True,
    challenge_timeout=30,
    proxy="http://proxy:port"  # Optional
)

adaptor = await fetcher.get("https://protected-site.com")
# Cloudflare challenge solved automatically
```

## Structured Data Extraction

```python
from scrapling.extractors import AutoExtractor

extractor = AutoExtractor()

# Define extraction schema
schema = {
    "professionals": {
        "selector": ".professional-card",
        "fields": {
            "name": ".name::text",
            "rating": ".rating::attr(data-value)",
            "services": ".service-tag::text",
            "avatar": "img::attr(src)"
        },
        "multiple": True
    },
    "pagination": {
        "selector": ".pagination .next::attr(href)",
        "follow": True
    }
}

data = await extractor.extract(url, schema)
# Returns typed, validated data matching schema
```

## Integration with Navio Barber

### Hora do Estilo Reverse Engineering

```python
# scrapers/hora_do_estilo.py
import asyncio
from scrapling import Adaptor, PlayWrightFetcher
from scrapling.extractors import AutoExtractor

HORA_DO_ESTILO_SCHEMA = {
    "establishment": {
        "selector": ".establishment-info",
        "fields": {
            "name": "h1::text",
            "address": ".address::text",
            "phone": ".phone::text",
            "hours": ".hours-table tr"
        }
    },
    "professionals": {
        "selector": ".professional-card",
        "multiple": True,
        "fields": {
            "name": ".prof-name::text",
            "specialties": ".specialty-tag::text",
            "schedule": ".schedule-grid .slot::attr(data-time)",
            "rating": ".stars::attr(data-rating)"
        }
    },
    "services": {
        "selector": ".service-item",
        "multiple": True,
        "fields": {
            "name": ".service-name::text",
            "duration": ".duration::text",
            "price": ".price::text",
            "commission": ".commission::text"
        }
    }
}

async def reverse_engineer_hora_do_estilo():
    fetcher = PlayWrightFetcher(headless=True)
    extractor = AutoExtractor()
    
    # Public pages (no auth)
    public_data = await extractor.extract(
        "https://horadoestilo.com.br",
        HORA_DO_ESTILO_SCHEMA
    )
    
    # Authenticated booking flow
    page = await fetcher.get("https://app.horadoestilo.com.br/login")
    # ... handle login ...
    
    booking_data = await extractor.extract(
        "https://app.horadoestilo.com.br/booking",
        BOOKING_SCHEMA
    )
    
    return {**public_data, **booking_data}
```

## CLI Usage

```bash
# Single page scrape
scrapling "https://horadoestilo.com.br" --selector ".service-card" --output services.json

# Crawl with pagination
scrapling crawl "https://horadoestilo.com.br/professionals" \
  --pagination ".pagination .next::attr(href)" \
  --selector ".professional-card" \
  --output professionals.jsonl

# With JavaScript rendering
scrapling "https://app.horadoestilo.com.br" --render js --wait ".calendar-slot" --output booking.html
```

## Configuration

`.scrapling.yaml`:

```yaml
defaults:
  timeout: 30
  retries: 3
  delay_range: [1, 3]  # seconds between requests
  user_agent_rotation: true
  follow_redirects: true

bypass:
  cloudflare: true
  datadome: true
  akamai: false

playwright:
  headless: true
  browser: chromium
  viewport: {width: 1920, height: 1080}
  locale: pt-BR

proxies:
  - http://proxy1:port
  - http://proxy2:port
```

## Output for Reverse Engineering

Combines with `reverse-api-engineer`:

```bash
# 1. Scrape UI to discover endpoints
scrapling crawl "https://app.horadoestilo.com.br" --render js --output ui-map.json

# 2. Capture API traffic via proxy
# (use reverse-api-engineer proxy simultaneously)

# 3. Correlate UI actions with API calls
# Generate complete API spec with UI context
```

## Notes for Navio Barber

- **Critical** for Hora do Estilo reverse engineering (Phase 0)
- Use with Playwright MCP for browser automation
- Output feeds `reverse-api-engineer` for API discovery
- Respect robots.txt and terms of service
- Use for reference app analysis only, not production scraping