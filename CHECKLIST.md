# MedDiscover M01 – MVP Checklist

## ✅ Gereksinimler Özeti

| Kategori | Gereksinim | Durum |
|----------|-----------|-------|
| **UI** | `/lead` - Lead formu | ✅ PASS |
| **UI** | `/lead/success` - Başarı sayfası | ✅ PASS |
| **UI** | `/admin/login` - Admin giriş | ✅ PASS |
| **UI** | `/admin/leads` - Lead listesi (tek arama kutusu) | ✅ PASS |
| **Backend** | `POST /api/leads` - Lead oluşturma | ✅ PASS |
| **Backend** | `GET /api/captcha` - Captcha üretme | ✅ PASS |
| **Backend** | `POST /api/admin/login` - Admin login | ✅ PASS |
| **Backend** | `POST /api/admin/logout` - Admin logout | ✅ PASS |
| **Backend** | `GET /api/admin/leads` - Lead listesi | ✅ PASS |
| **Backend** | `POST /api/admin/cleanup` - GDPR cleanup | ✅ PASS |

---

## 🔒 Güvenlik

| Gereksinim | Uygulama | Durum |
|------------|----------|-------|
| Validation | Zod schema ile sunucu taraflı doğrulama | ✅ PASS |
| Rate Limiting | In-memory rate limiter (leads: 5/saat, login: 5/15dk) | ✅ PASS |
| RBAC | Admin role kontrolü (cleanup endpoint) | ✅ PASS |
| Audit Log | Standardize eventler (LEAD_CREATED, ADMIN_LOGIN_SUCCESS/FAIL, LEADS_VIEWED, DATA_CLEANUP) | ✅ PASS |
| Captcha | HMAC-signed math captcha (DB'siz) | ✅ PASS |
| Session | Cookie-based auth (httpOnly, secure, sameSite) | ✅ PASS |

---

## 📋 GDPR Uyumluluğu

| Gereksinim | Uygulama | Durum |
|------------|----------|-------|
| AGB metni | 3 dil (de/tr/en) - `/public/legal/agb-*.md` | ✅ PASS |
| Privacy metni | 3 dil (de/tr/en) - `/public/legal/privacy-*.md` | ✅ PASS |
| Liability metni | 3 dil (de/tr/en) - `/public/legal/liability-*.md` | ✅ PASS |
| Consent kayıtları | `ConsentRecord` modeli ile ayrı tablo | ✅ PASS |
| Consent zorunlu alanlar | `consentPrivacy`, `acceptAGB`, `consentVersion`, `consentTimestamp`, `legalLocale` | ✅ PASS |
| Retention/Deletion | `expiresAt` alanı + `/api/admin/cleanup` endpoint | ✅ PASS |

---

## 📧 Email

| Gereksinim | Uygulama | Durum |
|------------|----------|-------|
| Hasta onay emaili | DE/TR/EN template | ✅ PASS |
| Admin bildirim emaili | Yeni lead bildirimi | ✅ PASS |
| Dev mode | Console log (SMTP olmadan) | ✅ PASS |

---

## 🗂️ Veritabanı Modelleri

| Model | Açıklama | Durum |
|-------|----------|-------|
| Lead | Hasta başvurusu | ✅ PASS |
| Admin | Yönetici kullanıcı | ✅ PASS |
| AuditLog | Denetim kayıtları | ✅ PASS |
| ConsentRecord | GDPR onay kayıtları | ✅ PASS |
| ~~CaptchaSession~~ | DB'ye yazılmıyor (HMAC token) | ✅ PASS |

---

## 🔧 Konfigürasyon

| Dosya | Açıklama | Durum |
|-------|----------|-------|
| `package.json` | Dependencies | ✅ PASS |
| `tsconfig.json` | TypeScript config | ✅ PASS |
| `next.config.mjs` | Next.js config | ✅ PASS |
| `tailwind.config.ts` | Tailwind CSS | ✅ PASS |
| `.env.example` | Ortam değişkenleri örneği | ✅ PASS |
| `prisma/schema.prisma` | DB şeması | ✅ PASS |
| `prisma/seed.ts` | Admin seed (bcrypt hash) | ✅ PASS |

---

## 📁 Dosya Yapısı

```
/workspace
├── prisma/
│   ├── schema.prisma          ✅
│   └── seed.ts                ✅
├── public/legal/
│   ├── agb-de.md              ✅
│   ├── agb-tr.md              ✅
│   ├── agb-en.md              ✅
│   ├── privacy-de.md          ✅
│   ├── privacy-tr.md          ✅
│   ├── privacy-en.md          ✅
│   ├── liability-de.md        ✅
│   ├── liability-tr.md        ✅
│   └── liability-en.md        ✅
├── src/
│   ├── app/
│   │   ├── layout.tsx         ✅
│   │   ├── page.tsx           ✅
│   │   ├── globals.css        ✅
│   │   ├── lead/
│   │   │   ├── page.tsx       ✅
│   │   │   └── success/page.tsx ✅
│   │   ├── admin/
│   │   │   ├── login/page.tsx ✅
│   │   │   └── leads/page.tsx ✅
│   │   └── api/
│   │       ├── leads/route.ts ✅
│   │       ├── captcha/route.ts ✅
│   │       └── admin/
│   │           ├── login/route.ts  ✅
│   │           ├── logout/route.ts ✅
│   │           ├── leads/route.ts  ✅
│   │           └── cleanup/route.ts ✅
│   ├── components/
│   │   ├── LeadForm.tsx       ✅
│   │   └── AdminLeadTable.tsx ✅
│   ├── lib/
│   │   ├── prisma.ts          ✅
│   │   ├── auth.ts            ✅
│   │   ├── captcha.ts         ✅
│   │   ├── email.ts           ✅
│   │   ├── audit.ts           ✅
│   │   ├── rate-limit.ts      ✅
│   │   └── validations.ts     ✅
│   └── locales/
│       ├── de.json            ✅
│       ├── tr.json            ✅
│       └── en.json            ✅
├── package.json               ✅
├── tsconfig.json              ✅
├── next.config.ts             ✅
├── tailwind.config.ts         ✅
├── postcss.config.js          ✅
├── .env.example               ✅
└── CHECKLIST.md               ✅
```

---

## 🚀 Kurulum & Çalıştırma

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env dosyası oluştur
cp .env.example .env
# .env dosyasını düzenle

# 3. Prisma client oluştur
npm run db:generate

# 4. Veritabanını oluştur
npm run db:push

# 5. Admin kullanıcı seed
npm run db:seed

# 6. Geliştirme sunucusu
npm run dev
```

---

## 📝 6 Zorunlu Ayar Kontrolü

| # | Ayar | Durum |
|---|------|-------|
| 1 | Captcha DB modeli yok (HMAC token) | ✅ PASS |
| 2 | Legal metinler 3 dil (9 dosya) | ✅ PASS |
| 3 | Lead: consentPrivacy, acceptAGB, consentVersion, consentTimestamp, legalLocale | ✅ PASS |
| 4 | Admin seed: bcrypt hash, .env.example'da placeholder | ✅ PASS |
| 5 | Audit events: LEAD_CREATED, ADMIN_LOGIN_SUCCESS/FAIL, LEADS_VIEWED + rate limit | ✅ PASS |
| 6 | Retention/deletion: /api/admin/cleanup endpoint (admin-only) | ✅ PASS |

---

## ✅ SONUÇ: TÜM GEREKSİNİMLER KARŞILANDI

MVP M01 tüm gereksinimleri karşılamaktadır. Uygulamayı çalıştırmak için yukarıdaki kurulum adımlarını takip edin.
