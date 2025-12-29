#!/bin/bash
# M02 Admin Leads - Git Commit Script

echo "🔧 M02 Admin Leads Implementation - Git Commits"
echo "================================================"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

echo "📊 Current changes:"
git status --short
echo ""

# Commit 1: Rate limiting on API routes
echo "📝 Commit 1: Rate limiting on CMS API routes"
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

echo "✅ Committed: Rate limiting"
echo ""

# Commit 2: Security logger
echo "📝 Commit 2: Security-aware logging utility"
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

echo "✅ Committed: Security logger"
echo ""

# Commit 3: Documentation
echo "📝 Commit 3: Documentation"
git add docs/M02_ADMIN_LEADS.md
git add docs/M02_QUICK_START.md

git commit -m "docs(m02): Add M02 Admin Leads documentation

- Full implementation guide (M02_ADMIN_LEADS.md)
- Quick start guide (M02_QUICK_START.md)
- API endpoint documentation
- Security best practices
- Testing checklist
- Git commit guide"

echo "✅ Committed: Documentation"
echo ""

echo "🎉 All M02 commits complete!"
echo ""
echo "📋 Summary:"
git log --oneline -3
echo ""
echo "✅ Ready to push: git push origin main"
