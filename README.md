# MedDiscover M01 – Patient Registration & Lead Collection MVP

MedDiscover health tourism platform – M01 module for patient registration and lead collection.

## Features

- 🌐 **Multi-language support**: German (DE), Turkish (TR), English (EN)
- 📝 **Lead submission form** with validation and math captcha
- 🔐 **Admin panel** with secure cookie-based authentication
- 📊 **Lead management** with search functionality
- 📧 **Email notifications** (patient confirmation + admin notification)
- ✅ **GDPR compliant**: Consent records, data retention, cleanup endpoint
- 🛡️ **Security**: Rate limiting, RBAC, audit logging

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Auth**: Cookie-based sessions (HMAC signed)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your settings:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD_HASH` - Generate with: `node -e "console.log(require('bcryptjs').hashSync('YourPassword', 12))"`
- `SESSION_SECRET` - Generate with: `openssl rand -base64 32`
- `CAPTCHA_SECRET` - Generate with: `openssl rand -base64 32`

### 3. Setup database

```bash
npm run db:generate  # Generate Prisma client
npm run db:push      # Create database tables
npm run db:seed      # Create admin user
```

### 4. Run development server

```bash
npm run dev
```

## Routes

### Public
- `/lead` - Patient registration form
- `/lead/success` - Success page after submission

### Admin
- `/admin/login` - Admin login
- `/admin/leads` - Lead management (requires auth)

### API
- `POST /api/leads` - Submit new lead
- `GET /api/captcha` - Generate captcha
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/leads` - List leads (with search)
- `GET /api/admin/cleanup` - Preview expired leads
- `POST /api/admin/cleanup` - Delete expired leads (GDPR)

## GDPR Compliance

- **Consent Recording**: All consents (privacy, AGB, marketing) are stored with timestamps
- **Data Retention**: Configurable via `DATA_RETENTION_DAYS` (default: 730 days)
- **Data Cleanup**: Admin-only endpoint to delete expired leads
- **Legal Texts**: Available in DE/TR/EN at `/public/legal/`

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Admin seed script
├── public/legal/        # Legal documents (AGB, Privacy, Liability)
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # React components
│   ├── lib/             # Utilities (auth, captcha, email, etc.)
│   └── locales/         # i18n translations
├── .env.example         # Environment template
└── CHECKLIST.md         # M01 requirements checklist
```

## License

Proprietary - MedDiscover GmbH
