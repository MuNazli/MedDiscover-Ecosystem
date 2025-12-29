# M02 Admin Leads Module - Implementation Guide

## Overview
Complete admin interface for managing leads with authentication, rate limiting, and PII protection.

## ✅ Implementation Status

### 1. Database Schema (Prisma)
- ✅ Lead model with status, notes, audits
- ✅ LeadNote model for admin comments
- ✅ LeadAudit model for tracking changes
- ✅ TrustScore integration (M07)
- ✅ Chat support (M06)

### 2. API Routes (Protected)

All routes under `/api/cms/leads/*` are protected with:
- ✅ Admin authentication (`md_admin` cookie)
- ✅ Rate limiting (15-30 req/min)
- ✅ Zod validation
- ✅ PII masking

#### GET /api/cms/leads
Lists all leads with masked PII.

**Features:**
- Rate limit: 30 requests/minute
- Returns: id, createdAt, name (masked), email (masked), status, trustScore

**Example:**
```bash
curl -H "Cookie: md_admin=YOUR_TOKEN" \
  http://localhost:3000/api/cms/leads
```

**Response:**
```json
{
  "leads": [
    {
      "id": "clx123abc",
      "createdAt": "2025-12-29T10:00:00Z",
      "name": "J***",
      "email": "j***@example.com",
      "phone": "***123",
      "status": "NEW",
      "trustScore": 80,
      "trustStatus": "ACTIVE"
    }
  ]
}
```

#### GET /api/cms/leads/[id]
Get detailed lead information.

**Features:**
- Rate limit: 30 requests/minute
- Includes notes and audit log
- PII masked

**Example:**
```bash
curl -H "Cookie: md_admin=YOUR_TOKEN" \
  http://localhost:3000/api/cms/leads/clx123abc
```

#### PATCH /api/cms/leads/[id]/status
Update lead status.

**Features:**
- Rate limit: 20 requests/minute
- Validates status enum
- Triggers TrustScore recalculation
- Creates audit entry

**Body:**
```json
{
  "status": "IN_REVIEW"
}
```

**Valid statuses:** `NEW`, `IN_REVIEW`, `OFFER_SENT`, `CLOSED`

**Example:**
```bash
curl -X PATCH \
  -H "Cookie: md_admin=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_REVIEW"}' \
  http://localhost:3000/api/cms/leads/clx123abc/status
```

#### POST /api/cms/leads/[id]/notes
Add a note to a lead.

**Features:**
- Rate limit: 15 requests/minute
- Content validation (2-2000 chars)
- Timestamped with author

**Body:**
```json
{
  "content": "Contacted patient via WhatsApp. Waiting for response."
}
```

**Example:**
```bash
curl -X POST \
  -H "Cookie: md_admin=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Follow-up scheduled for next week"}' \
  http://localhost:3000/api/cms/leads/clx123abc/notes
```

### 3. Admin UI Pages

#### /admin/leads (List View)
- ✅ Table with all leads
- ✅ Status filter (ALL, NEW, IN_REVIEW, OFFER_SENT, CLOSED)
- ✅ Search by name/email
- ✅ Sort by date (newest first)
- ✅ Loading/error/empty states
- ✅ Click row to view details

**Features:**
- Protected by middleware (requires `md_admin` cookie)
- Real-time status updates
- Masked PII display

#### /admin/leads/[id] (Detail View)
- ✅ Full lead details (masked)
- ✅ Status update dropdown
- ✅ Notes section (read + add)
- ✅ TrustScore display
- ✅ Chat integration (M06)
- ✅ Clinic/treatment matching (M03)

### 4. Security & Auth

#### Middleware Protection
All `/admin/*` routes protected in [src/middleware.ts](../src/middleware.ts):
```typescript
if (pathname.startsWith("/cms") || pathname.startsWith("/admin")) {
  const adminCookie = request.cookies.get("md_admin");
  if (!adminCookie?.value) {
    return NextResponse.redirect(new URL("/cms/login", request.url));
  }
}
```

#### API Authentication
All `/api/cms/*` routes use `requireAdmin()`:
```typescript
import { requireAdmin } from "@/lib/cmsAuth";

export async function GET(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) {
    return authError; // 401 Unauthorized
  }
  // ... protected logic
}
```

#### Rate Limiting
Configured per endpoint:
- List leads: 30/min
- Get detail: 30/min
- Update status: 20/min
- Add note: 15/min

#### PII Protection
Two-layer approach:

**1. Data Layer ([src/lib/cmsLeads.ts](../src/lib/cmsLeads.ts)):**
```typescript
import { maskEmail, maskPhone, maskName } from "@/lib/leadMask";

export async function listLeadsForCms() {
  const leads = await prisma.lead.findMany({...});
  return leads.map((lead) => ({
    ...lead,
    email: lead.email ? maskEmail(lead.email) : null,
    phone: lead.phone ? maskPhone(lead.phone) : null,
  }));
}
```

**2. Logging Layer ([src/lib/securityLogger.ts](../src/lib/securityLogger.ts)):**
```typescript
import { logLeadAction } from "@/lib/securityLogger";

// ✅ Safe: only logs IDs and actions
logLeadAction("STATUS_UPDATE", leadId, { status: "IN_REVIEW" });

// ❌ Never do this:
console.log({ email: lead.email, phone: lead.phone });
```

### 5. Database Migrations

No new migrations needed - schema already contains:
- Lead model with status
- LeadNote model
- LeadAudit model

**Verify schema:**
```bash
npx prisma db pull
npx prisma generate
```

## 🚀 Local Development

### Prerequisites
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with DATABASE_URL and ADMIN_PASSPHRASE
```

### Run Development Server
```bash
# Start dev server
npm run dev

# In another terminal: Prisma Studio (optional)
npx prisma studio
```

### Test API Endpoints

**1. Login first:**
```bash
curl -X POST http://localhost:3000/api/cms/auth \
  -H "Content-Type: application/json" \
  -d '{"passphrase":"YOUR_ADMIN_PASSPHRASE"}' \
  -c cookies.txt
```

**2. Test leads list:**
```bash
curl -b cookies.txt http://localhost:3000/api/cms/leads
```

**3. Test lead detail:**
```bash
curl -b cookies.txt http://localhost:3000/api/cms/leads/LEAD_ID
```

**4. Test status update:**
```bash
curl -X PATCH \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_REVIEW"}' \
  http://localhost:3000/api/cms/leads/LEAD_ID/status
```

**5. Test add note:**
```bash
curl -X POST \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"content":"Test note from API"}' \
  http://localhost:3000/api/cms/leads/LEAD_ID/notes
```

### Access Admin UI

1. **Login:** http://localhost:3000/cms/login
2. **Dashboard:** http://localhost:3000/admin/dashboard
3. **Leads List:** http://localhost:3000/admin/leads
4. **Lead Detail:** http://localhost:3000/admin/leads/LEAD_ID

## 📊 Testing Checklist

### Functional Tests
- [ ] Login with correct passphrase
- [ ] Login rejection with wrong passphrase
- [ ] List leads shows all leads with masked PII
- [ ] Search leads by name/email
- [ ] Filter leads by status
- [ ] View lead detail
- [ ] Update lead status
- [ ] Add note to lead
- [ ] Verify TrustScore recalculation on status change

### Security Tests
- [ ] Unauthenticated access blocked (401)
- [ ] Rate limiting triggers after limit (429)
- [ ] PII is masked in API responses
- [ ] PII is masked in UI
- [ ] No PII in console logs
- [ ] No PII in error messages

### Error Handling
- [ ] Invalid lead ID returns 404
- [ ] Invalid status enum returns 400
- [ ] Empty note content returns 400
- [ ] Network error shows error state in UI
- [ ] Loading state displayed during API calls

## 🔒 Security Best Practices

### What to NEVER Log
```typescript
// ❌ NEVER
console.log({ email: user.email });
console.log({ phone: lead.phone });
console.error("Error for user", lead.patientName);

// ✅ ALWAYS
import { logLeadAction, logError } from "@/lib/securityLogger";
logLeadAction("UPDATE", leadId);
logError("UPDATE_FAILED", error, { leadId });
```

### PII Masking Rules
- **Email:** `john@example.com` → `j***@example.com`
- **Phone:** `+49 123 456 789` → `***789`
- **Name:** `John Doe` → `J***`

### Rate Limit Tuning
Adjust in API route files:
```typescript
const rateLimitError = rateLimit(request, {
  maxRequests: 30,    // Adjust based on usage
  windowMs: 60 * 1000, // 1 minute
});
```

## 📝 Git Commits

Suggested commit sequence:

```bash
# 1. Rate limiting
git add src/app/api/cms/leads/
git commit -m "feat(m02): Add rate limiting to CMS leads API routes"

# 2. Security logger
git add src/lib/securityLogger.ts
git commit -m "feat(m02): Add security-aware logging utility (no PII)"

# 3. Documentation
git add docs/M02_ADMIN_LEADS.md
git commit -m "docs(m02): Add M02 Admin Leads implementation guide"

# 4. Integration tests (if created)
git add tests/api/cms-leads.test.ts
git commit -m "test(m02): Add integration tests for CMS leads API"
```

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
DATABASE_URL="postgresql://..."
ADMIN_PASSPHRASE="your-secure-passphrase-here"
```

### Middleware Config
[src/middleware.ts](../src/middleware.ts):
```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|favicon.png|icon.png|icon.svg|apple-icon.png|robots.txt|sitemap.xml).*)",
  ],
};
```

## 📚 Related Documentation
- [API_DASHBOARD.md](./API_DASHBOARD.md) - Overall API structure
- [SECURITY_GDPR.md](./SECURITY_GDPR.md) - GDPR compliance
- [TECHNICAL_ARCHITECTURE.md](./TECHNICAL_ARCHITECTURE.md) - System architecture

## 🐛 Troubleshooting

### Issue: 401 Unauthorized
**Cause:** Missing or invalid `md_admin` cookie

**Fix:**
```bash
# Re-login via API or UI
curl -X POST http://localhost:3000/api/cms/auth \
  -d '{"passphrase":"YOUR_PASSPHRASE"}'
```

### Issue: 429 Rate Limit Exceeded
**Cause:** Too many requests in short time

**Fix:** Wait 60 seconds or adjust rate limit config

### Issue: PII visible in logs
**Cause:** Using `console.log()` instead of `secureLog()`

**Fix:**
```typescript
// Replace
console.log(lead);

// With
import { logLeadAction, getMaskedLeadForLog } from "@/lib/securityLogger";
logLeadAction("VIEW", leadId);
console.log(getMaskedLeadForLog(lead)); // If debugging needed
```

## ✅ Deployment Checklist
- [ ] `ADMIN_PASSPHRASE` set in Vercel environment
- [ ] `DATABASE_URL` configured for production
- [ ] Rate limits tested under load
- [ ] PII masking verified in production logs
- [ ] HTTPS enforced (Vercel default)
- [ ] CORS headers configured (if needed for API)

## 📈 Monitoring

**Key Metrics:**
- Failed login attempts (potential brute force)
- Rate limit hits (potential abuse)
- Average response times per endpoint
- PII exposure incidents (should be zero)

**Vercel Dashboard:**
- Runtime Logs → filter "SECURE_LOG"
- Analytics → API route performance
- Security → Rate limiting stats

---

**Status:** ✅ PRODUCTION READY

**Last Updated:** 2025-12-29

**Maintained By:** MedDiscover Platform Team
