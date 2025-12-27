# 🚀 Production Deployment Guide - Vercel + PostgreSQL

## Prerequisites

- Vercel account
- GitHub repository connected to Vercel
- PostgreSQL database (Vercel Postgres or external provider)

---

## 📋 Quick Start

## Root Directory (Monorepo)

If Vercel shows 404 NOT_FOUND after deploy, the Root Directory is likely wrong.

Set Root Directory to the actual Next.js app folder that contains `package.json`, `next.config.js`, and `src/app`.

- If deploying THIS repo directly: Root Directory = `.`
- If this repo is inside a larger monorepo: Root Directory = `03-platform/M01-lead-intake`

Vercel UI: Project Settings -> General -> Root Directory -> Save -> Redeploy.

Build/Install defaults (keep Next.js standard):
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: (leave empty for Next.js)


### 1. Setup Vercel Project

1. Connect your GitHub repo to Vercel
2. Import the project
3. Configure build settings (automatic with Next.js detection)

### 2. Add PostgreSQL Storage

**Option A: Vercel Postgres (Recommended)**
1. Go to Storage tab in Vercel dashboard
2. Create Postgres database
3. Connection string will be auto-injected as `DATABASE_URL`

**Option B: External Postgres (e.g., Railway, Supabase, AWS RDS)**
1. Create database on your provider
2. Copy connection string
3. Add as environment variable in Vercel

### 3. Configure Environment Variables

Go to Project Settings → Environment Variables in Vercel:

```bash
# REQUIRED
DATABASE_URL=postgresql://user:pass@host:5432/dbname
ADMIN_PASSPHRASE=your-secure-admin-password-change-this

# OPTIONAL
# CAPTCHA_SECRET_KEY=your_captcha_secret_if_needed
```

⚠️ **SECURITY**: Change `ADMIN_PASSPHRASE` from default!

### 4. Deploy

```bash
# Push to main branch triggers auto-deployment
git push origin main

# Or use Vercel CLI
vercel --prod
```

### 5. Run Database Migrations

**After first successful deployment:**

```bash
# Option 1: Via Vercel CLI (requires local Vercel CLI installed)
vercel env pull .env.production
npx prisma migrate deploy

# Option 2: Via Vercel dashboard
# Go to project → Deployments → [Latest] → ... → Run command
# Command: npx prisma migrate deploy
```

### 6. Verify Deployment

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health

# Should return:
{
  "status": "ok",
  "timestamp": "2025-12-27T...",
  "service": "m01-lead-intake"
}
```

---

## 🔧 Build Configuration

### Automatic via `package.json`

```json
{
  "scripts": {
    "postinstall": "prisma generate", // ✅ Auto-runs during Vercel build
    "build": "next build",             // ✅ Standard Next.js build
    "start": "next start"              // ✅ Production server
  }
}
```

Vercel automatically:
1. Installs dependencies (`npm install`)
2. Runs `postinstall` (generates Prisma client)
3. Runs `build` (Next.js production build)

---

## 🗄️ Database Migrations

### Production Migration Workflow

```bash
# 1. Create new migration locally (development)
npx prisma migrate dev --name add_new_feature

# 2. Commit migration files
git add prisma/migrations/
git commit -m "Add migration: add_new_feature"
git push origin main

# 3. After Vercel deploys, run migrations
npx prisma migrate deploy
```

### Migration Commands

```bash
# Deploy pending migrations (production)
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Seed database (if needed)
npx prisma db seed
```

---

## 🔐 Security Checklist

- [ ] Change `ADMIN_PASSPHRASE` from default
- [ ] Use strong database password
- [ ] Enable Vercel password protection (optional)
- [ ] Set up custom domain with SSL
- [ ] Review Vercel logs for errors

---

## 📊 Monitoring

### Health Check
- Endpoint: `https://your-app.vercel.app/api/health`
- Use for uptime monitoring (e.g., UptimeRobot, Better Uptime)

### Vercel Dashboard
- Real-time logs
- Analytics
- Error tracking

---

## 🐛 Troubleshooting

### Build fails with "DATABASE_URL not found"
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Check variable is available for "Production" environment

### Migration fails
```bash
# Reset migration state (USE WITH CAUTION)
npx prisma migrate reset

# Force migrations (if out of sync)
npx prisma db push
```

### Prisma client version mismatch
```bash
# Regenerate client
npx prisma generate
```

---

## 🔄 Local Development with PostgreSQL

### Setup Local Postgres

1. Install PostgreSQL locally or use Docker:
```bash
docker run --name postgres-dev -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
```

2. Create `.env.local`:
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/meddiscover_dev"
ADMIN_PASSPHRASE="local-dev-password"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

4. Start dev server:
```bash
npm run dev
```

---

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_PASSPHRASE` | ✅ Yes | Admin login password | `MySecurePass123!` |
| `CAPTCHA_SECRET_KEY` | ❌ No | Captcha verification key | `6Ld...` |

---

## ✅ Post-Deployment Checklist

- [ ] Health endpoint returns 200 OK
- [ ] Admin login works (`/cms/login`)
- [ ] Lead form submission works
- [ ] TrustScore rules display correctly
- [ ] Chat system functions
- [ ] All 3 languages work (DE/EN/TR)
- [ ] Database migrations applied successfully

---

## 🎯 Production URLs

- **Public Site**: `https://your-app.vercel.app`
- **Admin Panel**: `https://your-app.vercel.app/cms/login`
- **Health Check**: `https://your-app.vercel.app/api/health`

---

**Deploy Ready v1** ✅
