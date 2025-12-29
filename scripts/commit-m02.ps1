# M02 Admin Leads Implementation - PowerShell Commit Script

Write-Host "🔧 M02 Admin Leads Implementation - Git Commits" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
try {
    git rev-parse --git-dir | Out-Null
} catch {
    Write-Host "❌ Error: Not a git repository" -ForegroundColor Red
    exit 1
}

Write-Host "📊 Current changes:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Commit 1: Rate limiting on API routes
Write-Host "📝 Commit 1: Rate limiting on CMS API routes" -ForegroundColor Green
git add src/app/api/cms/leads/route.ts
git add src/app/api/cms/leads/[id]/route.ts
git add src/app/api/cms/leads/[id]/status/route.ts
git add src/app/api/cms/leads/[id]/notes/route.ts

git commit -m "feat(m02): Add rate limiting to CMS leads API routes

- GET /api/cms/leads: 30 req/min
- GET /api/cms/leads/[id]: 30 req/min
- PATCH /api/cms/leads/[id]/status: 20 req/min
- POST /api/cms/leads/[id]/notes: 15 req/min

Prevents API abuse and ensures fair usage.
Rate limits are per-IP and reset every 60 seconds."

Write-Host "✅ Committed: Rate limiting" -ForegroundColor Green
Write-Host ""

# Commit 2: Security logger
Write-Host "📝 Commit 2: Security-aware logging utility" -ForegroundColor Green
git add src/lib/securityLogger.ts

git commit -m "feat(m02): Add security-aware logging utility (no PII)

Features:
- Automatic PII sanitization in log entries
- Safe logging helpers (logLeadAction, logAdminAction)
- Prevents email, phone, name from being logged
- Supports structured logging with metadata

Use instead of console.log() for any lead-related data.

Example:
  logLeadAction('STATUS_UPDATE', leadId, { status: 'NEW' });"

Write-Host "✅ Committed: Security logger" -ForegroundColor Green
Write-Host ""

# Commit 3: Documentation
Write-Host "📝 Commit 3: Documentation" -ForegroundColor Green
git add docs/M02_ADMIN_LEADS.md
git add docs/M02_QUICK_START.md

git commit -m "docs(m02): Add M02 Admin Leads documentation

- Full implementation guide (M02_ADMIN_LEADS.md)
- Quick start guide (M02_QUICK_START.md)
- API endpoint documentation
- Security best practices
- Testing checklist
- Git commit guide"

Write-Host "✅ Committed: Documentation" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All M02 commits complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Yellow
git log --oneline -3
Write-Host ""
Write-Host "✅ Ready to push: git push origin main" -ForegroundColor Green
