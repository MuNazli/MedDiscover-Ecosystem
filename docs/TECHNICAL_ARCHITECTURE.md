# MedDiscover MVP – Technical Architecture

> Versiyon: 1.0  
> Tarih: Aralık 2025  
> Durum: MVP Freeze ✓

---

## 1. MVP Teknoloji Seçimleri (Stack)

| Katman | Teknoloji | Versiyon | Not |
|--------|-----------|----------|-----|
| **Framework** | Next.js (App Router) | 14.2.3 | Server Components + Client Components |
| **Language** | TypeScript | 5.4.x | Strict mode: false (MVP) |
| **ORM** | Prisma | 5.x | Type-safe DB access |
| **Database** | SQLite | - | Dosya tabanlı, migration ready |
| **Validation** | Zod | 3.x | Schema validation |
| **Styling** | Inline CSS | - | MVP hız kararı |
| **Runtime** | Node.js | 20.x | LTS |

### Neden Bu Stack?

- **Next.js App Router**: Server Components ile hızlı sayfa, Server Actions ile form handling
- **SQLite**: Sıfır konfigürasyon, tek dosya, Postgres'e migration kolay
- **Prisma**: Type-safe, migration yönetimi, relation handling
- **Zod**: Runtime validation, TypeScript integration

---

## 2. Proje Yapısı (Klasör/Route Haritası)

```
M01-lead-intake/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Ana sayfa (navigasyon)
│   │   ├── layout.tsx                  # Root layout
│   │   ├── lead/
│   │   │   ├── page.tsx                # Lead başvuru formu
│   │   │   └── [id]/chat/
│   │   │       ├── page.tsx            # Hasta chat sayfası
│   │   │       └── PatientChatForm.tsx # Client form
│   │   ├── admin/
│   │   │   ├── leads/
│   │   │   │   ├── page.tsx            # Lead listesi
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Lead detay
│   │   │   │       ├── actions.ts      # Status/notes update
│   │   │   │       ├── matching-actions.ts # Clinic/treatment
│   │   │   │       ├── LeadUpdateForm.tsx
│   │   │   │       ├── LeadMatchingForm.tsx
│   │   │   │       └── AdminChatSection.tsx
│   │   │   └── dashboard/
│   │   │       └── page.tsx            # Dashboard
│   │   └── api/
│   │       ├── lead/
│   │       │   └── route.ts            # POST lead intake
│   │       └── chat/
│   │           └── [leadId]/messages/
│   │               └── route.ts        # GET/POST messages
│   └── lib/
│       ├── prisma.ts                   # Prisma singleton
│       └── pii.ts                      # PII detection
├── prisma/
│   ├── schema.prisma                   # Data model
│   ├── seed.ts                         # Sample data
│   └── migrations/                     # Migration history
├── docs/                               # Dokümantasyon
├── middleware.ts                       # Admin route protection
├── package.json
├── tsconfig.json
└── .env                                # DATABASE_URL, ADMIN_KEY
```

### Klasör Açıklamaları

| Klasör | Amaç |
|--------|------|
| `src/app/lead/` | Hasta-facing başvuru ve chat |
| `src/app/admin/` | Admin panel (leads, dashboard) |
| `src/app/api/` | API routes (REST endpoints) |
| `src/lib/` | Shared utilities (prisma, pii) |
| `prisma/` | Database schema ve migrations |
| `docs/` | Proje dokümantasyonu |

---

## 3. Modül Bazlı Teknik Harita

### M01 – Lead Başvuru & Intake

| Bileşen | Yol |
|---------|-----|
| Form UI | `/lead` → `src/app/lead/page.tsx` |
| API Endpoint | `POST /api/lead` → `src/app/api/lead/route.ts` |
| DB Model | `Lead` (patientName, country, contactPreference, requestedProcedure, gdprConsent) |

**Validasyonlar:**
- patientName: min 2, max 80
- country: regex `^[A-Z]{2}$`
- contactPreference: enum (WHATSAPP, PHONE, EMAIL)
- requestedProcedure: min 3, max 2000
- gdprConsent: literal `true`

---

### M02 – Lead Yönetimi

| Bileşen | Yol |
|---------|-----|
| Liste | `/admin/leads` |
| Detay | `/admin/leads/[id]` |
| Status Update | Server Action → `actions.ts` |

**DB Fields:**
- status: NEW → IN_REVIEW → CONTACTED → CLOSED
- notes: optional text

---

### M03 – Klinik / Tedavi Eşleştirme

| Bileşen | Yol |
|---------|-----|
| UI | `/admin/leads/[id]` içinde LeadMatchingForm |
| Action | `matching-actions.ts` |

**DB Relations:**
- `Lead.clinicId` → `Clinic.id`
- `Lead.treatmentId` → `Treatment.id`

**Validasyonlar:**
- Clinic/Treatment aktif mi kontrolü
- Null değer kabul (eşleşme kaldırma)

---

### M04 – Admin Dashboard

| Bileşen | Yol |
|---------|-----|
| Dashboard | `/admin/dashboard` |

**Data Queries:**
- `Lead.count()` – toplam
- `Lead.count({ createdAt >= 7 days })` – son 7 gün
- `Lead.groupBy({ status })` – durum kırılımı
- `Lead.groupBy({ country })` – ülke top 10

**Filtreler (GET params):**
- `q` – hasta adı arama
- `country` – ülke filtresi
- `status` – durum filtresi
- `from/to` – tarih aralığı

---

### M06 – In-App Chat

| Bileşen | Yol |
|---------|-----|
| Hasta Chat | `/lead/[id]/chat` |
| Admin Chat | `/admin/leads/[id]` içinde AdminChatSection |
| API | `GET/POST /api/chat/[leadId]/messages` |

**DB Models:**
- `Conversation` (leadId unique, 1-1 Lead)
- `Message` (conversationId, senderType, body, blocked)

**PII Guard:**
- `src/lib/pii.ts` → `detectPII(text)`
- Server-side zorunlu
- Engellenen: email, phone, whatsapp, url, social handles

---

## 4. Veri Modeli (ER Özeti)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Clinic    │       │    Lead     │       │  Treatment  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──┐   │ id (PK)     │   ┌──►│ id (PK)     │
│ name        │   │   │ patientName │   │   │ name        │
│ country     │   │   │ country     │   │   │ isActive    │
│ isActive    │   │   │ status      │   │   └─────────────┘
└─────────────┘   │   │ clinicId(FK)│───┘
                  └───│treatmentId  │
                      │ gdprConsent │
                      └──────┬──────┘
                             │ 1:1
                      ┌──────▼──────┐
                      │Conversation │
                      ├─────────────┤
                      │ id (PK)     │
                      │ leadId (UK) │
                      └──────┬──────┘
                             │ 1:N
                      ┌──────▼──────┐
                      │   Message   │
                      ├─────────────┤
                      │ id (PK)     │
                      │conversationId│
                      │ senderType  │
                      │ body        │
                      │ blocked     │
                      └─────────────┘
```

### İlişki Özeti

| Model | İlişki | Tip |
|-------|--------|-----|
| Lead → Clinic | Optional | N:1 |
| Lead → Treatment | Optional | N:1 |
| Lead → Conversation | Optional | 1:1 |
| Conversation → Message | Required | 1:N |

---

## 5. Güvenlik Mimari Notları (MVP)

### Input Validation

```
Client → Zod Schema → Server Action / API Route → Prisma → SQLite
```

- Tüm input'lar Zod ile validate edilir
- Type coercion yok, strict validation
- Error response: `{ fieldErrors: { field: ["message"] } }`

### ORM Safety

- Prisma prepared statements kullanır
- SQL injection riski yok
- Type-safe queries

### Admin Route Protection

```typescript
// middleware.ts
if (path.startsWith("/admin")) {
  if (request.headers.get("x-admin-key") !== process.env.ADMIN_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }
}
```

### Server-Side PII Guard

```typescript
// src/lib/pii.ts
detectPII(text) → { hasPII: boolean, reason?: string }
```

- API route'ta zorunlu çağrı
- hasPII === true → 400 döner, mesaj kaydedilmez

### MVP Bilinçli Açıklar

| Eksik | Neden |
|-------|-------|
| Gerçek auth/session | MVP hız kararı |
| RBAC | Tek admin role yeterli |
| Rate limiting | Düşük trafik varsayımı |
| CSRF protection | Server Actions implicit handling |

---

## 6. Operasyon ve İzleme (MVP)

### Development

```bash
# Start dev server
npm run dev

# Database operations
npx prisma migrate dev --name <name>
npx prisma generate
npx prisma db seed
npx prisma studio  # GUI
```

### Environment Variables

```env
DATABASE_URL="file:./dev.db"
ADMIN_KEY="change-me"
```

### Seed Data

`prisma/seed.ts`:
- 3 örnek Clinic
- 5 örnek Treatment

### Logging

- Next.js default console logs
- Prisma query logs (development)
- Error logging: `console.error()`

### Bilinen Dev Uyarıları

| Uyarı | Durum |
|-------|-------|
| EPERM: .next/trace | Windows file lock, prod'da yok |
| Port 3000 in use | Otomatik 3001'e geçer |

---

## 7. Ölçeklenebilirlik Planı (Phase-2)

### Database Migration

```
SQLite → PostgreSQL
```

- Prisma schema aynı kalır
- `provider = "postgresql"` değişikliği
- Connection string güncelleme
- Migration re-run

### Auth & RBAC

```
Rol Yapısı:
├── Admin (tam yetki)
├── Operator (lead yönetimi)
├── Clinic (kendi lead'leri)
└── Patient (kendi conversation'ı)
```

Teknoloji seçenekleri:
- NextAuth.js
- Clerk
- Custom JWT

### Audit Log

```sql
audit_logs (
  id, entity_type, entity_id, 
  action, old_value, new_value,
  user_id, timestamp
)
```

### Rate Limiting

- API routes için request limiter
- IP-based + user-based
- Redis counter

### Queue / Background Jobs

- E-posta bildirimleri
- Push notifications
- Scheduled tasks

Teknoloji seçenekleri:
- BullMQ + Redis
- Vercel Cron
- Inngest

### File Upload

- Tıbbi dokümanlar
- S3 / Cloudflare R2
- Encryption at rest

### Multi-Language

```
/de/lead → Almanca form
/tr/lead → Türkçe form
/en/lead → İngilizce form
```

Next.js i18n routing

### SEO & Sitemap

- Public landing pages
- Dynamic sitemap generation
- Meta tags optimization

---

## 8. Kararlar & Trade-off'lar

### MVP Hız/Odak İçin Basit Tutulan Alanlar

| Alan | MVP Kararı | Neden |
|------|------------|-------|
| Styling | Inline CSS | Tailwind setup süresi |
| Auth | Header-based | Session yönetimi karmaşıklığı |
| DB | SQLite | Zero config, portable |
| Notifications | Yok | Altyapı gereksinimi |
| File upload | Yok | Storage/encryption karmaşıklığı |

### Anti-Circumvention Neden MVP'de?

Bu özellik **iş modelinin çekirdeği**:
- Platform değerini korur
- Komisyon güvenliğini sağlar
- Geciktirilmesi kabul edilemez risk

Teknik olarak basit (regex + server check) ama iş etkisi yüksek.

### AI Neden Phase-2'de?

| Faktör | Değerlendirme |
|--------|---------------|
| Geliştirme süresi | Uzun |
| Veri gereksinimi | Yeterli lead birikimi lazım |
| Doğrulama | Manuel eşleştirme önce test edilmeli |
| Maliyet | API/GPU maliyeti |

Manuel süreç önce çalışmalı, sonra optimize edilmeli.

---

## Özet

MedDiscover MVP teknik mimarisi:

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| Framework | Next.js 14 App Router | Modern, full-stack |
| Database | SQLite + Prisma | Hızlı başlangıç |
| Validation | Zod | Type-safe |
| Security | Server-side PII, middleware | Kritik koruma |
| Styling | Inline CSS | MVP hız |

**Phase-2 Öncelikleri:**
1. PostgreSQL migration
2. Auth/RBAC
3. Audit logging
4. Rate limiting
5. Notifications

---

*Bu doküman MedDiscover MVP v1.0 Technical Architecture olarak hazırlanmıştır.*
