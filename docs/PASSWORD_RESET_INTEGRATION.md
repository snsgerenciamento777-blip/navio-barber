# Password Reset Integration - sendResetPassword

## Current Implementation (Development)

**File:** `packages/auth/src/index.ts` (lines 70-103)

```typescript
const RESET_URLS_DIR = join(process.cwd(), "tmp", "password-resets");

async function sendResetPassword({
  user,
  url,
  token,
}: { user: { id: string; email: string; name?: string }; url: string; token: string }): Promise<void> {
  // Writes reset URL to local file
  // Logs to console for easy access in development
}
```

**Behavior:**
- Creates `tmp/password-resets/reset-{userId}-{timestamp}.txt` with reset URL
- Logs to console: `[Better Auth sendResetPassword] Usuario: {email} | Token: {token} | URL: {url}`
- Budget: R$ 0,00 (no paid email service)

## Production Configuration

To enable real email delivery in production, configure one of:

### Option 1: Resend (Recommended)
```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@seudominio.com
```

### Option 2: SendGrid
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@seudominio.com
```

### Option 3: Nodemailer (SMTP)
```env
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.seuprovedor.com
SMTP_PORT=587
SMTP_USER=seu_usuario
SMTP_PASS=sua_senha
SMTP_FROM=noreply@seudominio.com
```

## Implementation for Production

When ready to implement real email sending, update `packages/auth/src/index.ts`:

```typescript
import { sendEmail } from "./lib/email"; // Create this helper

async function sendResetPassword({ user, url, token }) {
  if (process.env.NODE_ENV === "production" && process.env.EMAIL_PROVIDER) {
    await sendEmail({
      to: user.email,
      subject: "Redefinição de Senha - Navio Barber",
      html: `<p>Clique <a href="${url}">aqui</a> para redefinir sua senha.</p>`,
    });
    return;
  }
  
  // Fallback to development behavior
  // ... existing file/console logic
}
```

## Better Auth Reset Password Flow

1. User requests reset at `/api/auth/forget-password` with email
2. Better Auth generates token and calls `sendResetPassword({ user, url, token })`
3. User clicks link: `/api/auth/reset-password?token={token}`
4. User submits new password at `/api/auth/reset-password`
5. Better Auth calls `onPasswordReset` callback
6. Password hash stored in `Account.password` (Better Auth format: scrypt r=16+NFKC)

## Testing Reset Flow (Development)

```bash
# 1. Request reset
curl -X POST http://localhost:3000/api/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com"}'

# 2. Check console for reset URL or file in tmp/password-resets/
cat tmp/password-resets/reset-*.txt

# 3. Access reset URL in browser or curl
curl -X POST "http://localhost:3000/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"password": "NewPassword123!", "token": "TOKEN_FROM_URL"}'
```

## Security Notes

- Reset tokens are single-use and expire (default: 1 hour)
- Rate limiting applies to `/forget-password` and `/reset-password` endpoints
- HTTPS required in production (secure cookies)
- Token entropy: 32 bytes (cryptographically secure)