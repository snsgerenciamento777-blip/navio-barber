---
name: lgpd-skills
description: LGPD (Lei Geral de Proteção de Dados) compliance toolkit for Brazilian privacy law. Provides automated data mapping, consent management, DPIA templates, data subject rights automation, and compliance checking. Essential for any Brazilian application handling personal data.
argument-hint: "[command] | --project-root PATH | --output lgpd-report.json | --check consent|dpi|rights|retention|all"
metadata:
  version: "2.0"
  source: "https://github.com/lgpd-brasil/lgpd-skills"
  priority: "critical"
  category: "compliance"
---

# LGPD Skills

Comprehensive LGPD (Brazilian General Data Protection Law) compliance toolkit.

## LGPD Overview

Lei Geral de Proteção de Dados (Law 13.709/2018) - Brazilian data protection law requiring:

1. **Legal Basis** - Consent, legitimate interest, contract, legal obligation, vital interest, public task
2. **Data Subject Rights** - Access, correction, deletion, portability, opposition, information
3. **Privacy by Design** - Data minimization, purpose limitation, security by default
4. **DPIA** - Data Protection Impact Assessment for high-risk processing
5. **DPO** - Data Protection Officer appointment (when required)
6. **Breach Notification** - 72 hours to ANPD, affected individuals without undue delay
7. **International Transfer** - Adequacy decisions, standard clauses, BCRs

## Installation

```bash
# CLI tool
pip install lgpd-skills

# Or via npm (Node wrapper)
npm install -g @lgpd/skills

# Verify
lgpd --version
```

## Commands

### Data Mapping (Inventário de Dados)

```bash
# Scan codebase for personal data processing
lgpd map --project-root ./src --output data-map.json

# Generate Article 30 record (ROPA)
lgpd ropa --project-root ./src --output ropa.xlsx

# Identify sensitive data categories
lgpd sensitive-scan --project-root ./src --output sensitive-report.json
```

### Consent Management

```bash
# Audit consent flows
lgpd consent-audit --project-root ./src --output consent-audit.json

# Generate consent templates
lgpd consent-templates --output consent-templates/

# Validate consent records
lgpd consent-validate --records consent-logs.json --schema lgpd-consent-schema.json
```

### DPIA (Data Protection Impact Assessment)

```bash
# Run DPIA wizard
lgpd dpia --project-root ./src --output dpia-report.pdf

# Check if DPIA required
lgpd dpia-check --processing "biometric authentication" --scale "large" --output dpia-need.json

# Template for common scenarios
lgpd dpia-template --scenario "employee-monitoring" --output dpia-template.docx
```

### Data Subject Rights (Direitos do Titular)

```bash
# Generate request handlers
lgpd rights-handlers --project-root ./src --framework nextjs --output src/app/api/lgpd/

# Simulate request fulfillment
lgpd rights-simulate --request-type access --subject-email user@example.com --output simulation.log

# Check retention compliance
lgpd retention-check --project-root ./src --policy retention-policy.yaml --output retention-report.json
```

### Compliance Reporting

```bash
# Full compliance report
lgpd report --project-root ./src --output lgpd-compliance-report.pdf

# ANPD notification template
lgpd breach-notification --incident breach-details.json --output anpd-notification.pdf

# Training materials
lgpd training --audience developers --output lgpd-training.md
```

## Navio Barber Integration

### Project Data Map

```yaml
# lgpd-data-map.yaml
project: "navio-barber"
version: "2.0"
data_controller: "Navio Barber Ltda"
dpo: "privacy@naviobarber.com.br"

processing_activities:
  - name: "Client Booking Management"
    legal_basis: "contract"
    data_categories:
      - "identification: name, phone, email"
      - "contact: phone, email"
      - "preferences: service history, notes"
      - "special_category: none"
    recipients: ["barbershop_staff", "notification_service"]
    retention: "5 years after last appointment"
    transfers: []
    security_measures: ["encryption_at_rest", "encryption_in_transit", "access_control"]
    dpia_required: false

  - name: "Professional Performance Analytics"
    legal_basis: "legitimate_interest"
    data_categories:
      - "identification: professional_id, name"
      - "performance: revenue, appointments, ratings"
    recipients: ["admin_dashboard"]
    retention: "2 years"
    transfers: []
    security_measures: ["pseudonymization", "access_control"]
    dpia_required: false

  - name: "Marketing Communications"
    legal_basis: "consent"
    data_categories:
      - "contact: phone, email"
      - "preferences: marketing_opt_in"
    recipients: ["whatsapp_api", "email_service"]
    retention: "until withdrawal"
    transfers: ["whatsapp_business_api"]
    security_measures: ["consent_logs", "opt_out_mechanism"]
    dpia_required: false
```

### Consent Flow Implementation

```typescript
// src/lib/lgpd/consent.ts
import { z } from 'zod';

export const ConsentRecordSchema = z.object({
  subjectId: z.string(),
  purpose: z.enum(['booking', 'marketing', 'analytics', 'notifications']),
  legalBasis: z.enum(['consent', 'contract', 'legitimate_interest', 'legal_obligation']),
  granted: z.boolean(),
  grantedAt: z.date(),
  withdrawnAt: z.date().optional(),
  ipAddress: z.string(),
  userAgent: z.string(),
  version: z.string(), // Policy version
});

export type ConsentRecord = z.infer<typeof ConsentRecordSchema>;

// Consent service with LGPD compliance
export class LGPDConsentService {
  async recordConsent(record: ConsentRecord) {
    // Store with audit trail
    await db.consentLog.create({ data: record });
    
    // Sync to marketing platforms if marketing consent
    if (record.purpose === 'marketing' && record.granted) {
      await this.syncToMarketing(record.subjectId, record.purpose);
    }
  }

  async withdrawConsent(subjectId: string, purpose: ConsentRecord['purpose']) {
    await db.consentLog.update({
      where: { subjectId_purpose: { subjectId, purpose } },
      data: { granted: false, withdrawnAt: new Date() }
    });
    
    // Propagate withdrawal
    await this.propagateWithdrawal(subjectId, purpose);
  }

  async getConsentStatus(subjectId: string) {
    return db.consentLog.findMany({ where: { subjectId } });
  }
}
```

### Data Subject Rights API

```typescript
// src/app/api/lgpd/rights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LGPDRightsService } from '@/lib/lgpd/rights';

export async function POST(request: NextRequest) {
  const { type, subjectEmail, verificationCode } = await request.json();
  
  const service = new LGPDRightsService();
  
  switch (type) {
    case 'access':
      const data = await service.exportSubjectData(subjectEmail);
      return NextResponse.json({ data, format: 'json' });
      
    case 'deletion':
      await service.deleteSubjectData(subjectEmail, verificationCode);
      return NextResponse.json({ success: true });
      
    case 'portability':
      const portable = await service.exportPortableData(subjectEmail);
      return NextResponse.json({ data: portable, format: 'json' });
      
    case 'correction':
      const { field, value } = await request.json();
      await service.correctSubjectData(subjectEmail, field, value);
      return NextResponse.json({ success: true });
      
    default:
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  }
}
```

### Retention Policy

```yaml
# retention-policy.yaml
policies:
  - collection: "appointments"
    retention: "5 years"
    trigger: "last_appointment_date"
    action: "anonymize"
    legal_basis: "tax_obligation"
    
  - collection: "clients"
    retention: "2 years"
    trigger: "last_activity_date"
    action: "delete"
    legal_basis: "legitimate_interest"
    exceptions:
      - "active_appointments"
      - "pending_payments"
      
  - collection: "marketing_consents"
    retention: "indefinite"
    trigger: "withdrawal"
    action: "update_status"
    legal_basis: "consent"
    
  - collection: "analytics_events"
    retention: "13 months"
    trigger: "event_timestamp"
    action: "delete"
    legal_basis: "legitimate_interest"
```

## Automated Compliance Checks

```bash
# Pre-deployment check
lgpd check --project-root ./src --fail-on critical --output pre-deploy-report.json

# CI integration
lgpd check --project-root ./src --format sarif --output lgpd-sarif.json
```

### CI Pipeline

```yaml
# .github/workflows/lgpd-compliance.yml
name: LGPD Compliance
on: [push, pull_request]
jobs:
  lgpd-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install lgpd-skills
      - run: lgpd check --project-root ./src --fail-on critical --format sarif --output lgpd-sarif.json
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: lgpd-sarif.json
```

## ANPD (Autoridade Nacional de Proteção de Dados) Integration

```python
# lgpd/anpd_notifier.py
import httpx
from datetime import datetime

class ANPDNotifier:
    BASE_URL = "https://api.anpd.gov.br/v1"
    
    async def notify_breach(self, incident: BreachIncident) -> NotificationReceipt:
        """Notify ANPD within 72 hours as required by Art. 48"""
        payload = {
            "controller": {
                "name": "Navio Barber Ltda",
                "cnpj": "00.000.000/0000-00",
                "dpo_contact": "privacy@naviobarber.com.br"
            },
            "incident": {
                "description": incident.description,
                "detected_at": incident.detected_at.isoformat(),
                "affected_data_categories": incident.data_categories,
                "affected_subjects_count": incident.subjects_count,
                "likely_consequences": incident.consequences,
                "measures_taken": incident.measures,
                "measures_planned": incident.planned_measures
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.BASE_URL}/breach-notifications",
                json=payload,
                headers={"Authorization": f"Bearer {settings.ANPD_API_TOKEN}"}
            )
            return NotificationReceipt(**response.json())
```

## Notes for Navio Barber

- **Critical** for Brazilian market compliance (Phase 0 foundation)
- Run `lgpd map` during Phase 0 to establish data inventory
- Integrate consent flows in Phase 0 Auth Setup (Task 0.5)
- DPIA required for biometric auth, large-scale profiling, sensitive data
- DPO designation needed if processing sensitive data at scale
- All Phase 3 tasks must pass `lgpd check` before deployment
- Document LGPD compliance in `docs/lgpd-compliance.md`