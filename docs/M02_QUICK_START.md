# M02 Admin Leads - Quick Start Guide

## ✅ What's Implemented

### API Routes (All Protected & Rate Limited)
1. **GET /api/cms/leads** - List all leads (masked PII, 30 req/min)
2. **GET /api/cms/leads/[id]** - Get lead detail (30 req/min)
3. **PATCH /api/cms/leads/[id]/status** - Update status (20 req/min)
4. **POST /api/cms/leads/[id]/notes** - Add note (15 req/min)

### Admin UI
1. **/admin/leads** - Lead list with filter/search
2. **/admin/leads/[id]** - Lead detail with status/notes

### Security Features
- ✅ Admin authentication (md_admin cookie)
- ✅ Rate limiting on all CMS API routes
- ✅ PII masking (email, phone, name)
- ✅ Security logger (no PII in logs)
- ✅ Zod validation
- ✅ Middleware protection

## 🚀 Quick Test Commands

### 1. Login
```bash
curl -X POST http://localhost:3000/api/cms/auth \
  -H "Content-Type: application/json" \
  -d '{"passphrase":"YOUR_ADMIN_PASSPHRASE"}' \
  -c cookies.txt
```

### 2. List Leads
```bash
curl -b cookies.txt http://localhost:3000/api/cms/leads
```

### 3. Get Lead Detail
```bash
curl -b cookies.txt http://localhost:3000/api/cms/leads/LEAD_ID
```

### 4. Update Status
```bash
curl -X PATCH \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_REVIEW"}' \
  http://localhost:3000/api/cms/leads/LEAD_ID/status
```

### 5. Add Note
```bash
curl -X POST \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"content":"Test note"}' \
  http://localhost:3000/api/cms/leads/LEAD_ID/notes
```

## 📊 Local Development

### Start Dev Server
```bash
npm run dev
```

### Access Admin UI
1. Login: http://localhost:3000/cms/login
2. Leads: http://localhost:3000/admin/leads

### Test Build
```bash
npm run build
```

## 🔒 Security Checklist

- [x] All /api/cms/* routes require authentication
- [x] Rate limiting active on all CMS routes
- [x] PII masked in API responses
- [x] PII masked in admin UI
- [x] Security logger prevents PII in logs
- [x] Zod validation on all inputs
- [x] No PII in error messages

## 📝 File Changes

### New Files
- `src/lib/securityLogger.ts` - PII-safe logging utility
- `docs/M02_ADMIN_LEADS.md` - Full documentation

### Modified Files
- `src/app/api/cms/leads/route.ts` - Added rate limiting
- `src/app/api/cms/leads/[id]/route.ts` - Added rate limiting
- `src/app/api/cms/leads/[id]/status/route.ts` - Added rate limiting
- `src/app/api/cms/leads/[id]/notes/route.ts` - Added rate limiting

### No Changes Needed
- Database schema (already complete)
- Admin UI pages (already protected by middleware)
- Auth system (already working)

## 🎯 Git Commits

```bash
# Commit 1: Rate limiting
git add src/app/api/cms/leads/
git commit -m "feat(m02): Add rate limiting to CMS leads API routes

- GET /api/cms/leads: 30 req/min
- GET /api/cms/leads/[id]: 30 req/min
- PATCH /api/cms/leads/[id]/status: 20 req/min
- POST /api/cms/leads/[id]/notes: 15 req/min"

# Commit 2: Security logger
git add src/lib/securityLogger.ts
git commit -m "feat(m02): Add security-aware logging utility

- Prevents PII from being logged
- Provides safe logging helpers
- Auto-sanitizes log entries"

# Commit 3: Documentation
git add docs/M02_ADMIN_LEADS.md docs/M02_QUICK_START.md
git commit -m "docs(m02): Add M02 Admin Leads documentation

- Full implementation guide
- Quick start guide
- Security best practices
- Testing checklist"
```

## 🧪 Testing Scenarios

### Functional Tests
1. ✅ Login with valid passphrase
2. ✅ Access denied without auth
3. ✅ List leads with masked PII
4. ✅ View lead detail
5. ✅ Update lead status
6. ✅ Add note to lead
7. ✅ Filter leads by status
8. ✅ Search leads by name/email

### Security Tests
1. ✅ 401 without md_admin cookie
2. ✅ 429 after rate limit exceeded
3. ✅ PII masked in API responses
4. ✅ PII masked in UI
5. ✅ No PII in console logs

### Error Handling
1. ✅ 404 for invalid lead ID
2. ✅ 400 for invalid status value
3. ✅ 400 for empty note content
4. ✅ UI shows error states
5. ✅ UI shows loading states

## 📚 Key Files

### API Routes
- `src/app/api/cms/leads/route.ts` - List leads
- `src/app/api/cms/leads/[id]/route.ts` - Lead detail
- `src/app/api/cms/leads/[id]/status/route.ts` - Update status
- `src/app/api/cms/leads/[id]/notes/route.ts` - Add notes

### UI Pages
- `src/app/admin/leads/page.tsx` - Leads list
- `src/app/admin/leads/[id]/page.tsx` - Lead detail

### Libraries
- `src/lib/cmsAuth.ts` - Admin authentication
- `src/lib/cmsLeads.ts` - Lead data access (with PII masking)
- `src/lib/leadMask.ts` - PII masking utilities
- `src/lib/rateLimit.ts` - Rate limiting
- `src/lib/securityLogger.ts` - PII-safe logging (NEW)

### Middleware
- `src/middleware.ts` - Route protection

## 🔧 Configuration

### Rate Limits (Configurable)
```typescript
// In each API route file
const rateLimitError = rateLimit(request, {
  maxRequests: 30,     // Adjust per endpoint
  windowMs: 60 * 1000, // 1 minute
});
```

### PII Masking (Automatic)
- Email: `john@example.com` → `j***@example.com`
- Phone: `+49 123 456 789` → `***789`
- Name: `John Doe` → `J***`

## 🚨 Important Notes

1. **All CMS API routes are now rate limited** - May affect bulk operations
2. **PII is always masked** - Cannot retrieve full PII via API (by design)
3. **Auth via cookie** - CSRF protection recommended for production
4. **Logging requires securityLogger** - Use instead of console.log for PII data

## ✅ Production Readiness

- [x] Authentication working
- [x] Rate limiting active
- [x] PII protection verified
- [x] Build successful
- [x] No TypeScript errors
- [x] Documentation complete

**Status: PRODUCTION READY** 🚀

See [M02_ADMIN_LEADS.md](./M02_ADMIN_LEADS.md) for full documentation.
