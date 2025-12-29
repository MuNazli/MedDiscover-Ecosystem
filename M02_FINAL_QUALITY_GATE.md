# M02 Final Quality Gate (Release Kriterleri)

- Auth dogru: ADMIN_PASSPHRASE login + HttpOnly cookie/JWT + kisa TTL
- Guard dogru: /cms/* ve /api/cms/* yetkisiz erisim engelli
- PII guvenligi: listede maskeli, detailde full, loglarda PII yok
- Rate limit: login + notes endpoint aktif, 429 davranisi dogru
- DB uyumu: Neon env var seti Prisma ile calisiyor
- Logs temiz: statik asset hatasi yok (favicon 500 / clientModules)
- Build basarili: npm run build
- API contract dokumante ve uyumlu

Phase-2 (ERTELENEBILIR)
- Export
- Audit log
- Retention / delete otomasyonu
