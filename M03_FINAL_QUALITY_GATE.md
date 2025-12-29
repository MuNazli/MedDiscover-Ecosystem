# M03 Final Quality Gate (Release Kriterleri)

- Auth guard M02 standardina uyumlu: ADMIN_PASSPHRASE login + HttpOnly cookie/JWT + kisa TTL
- /admin/leads/[id] ve /api/cms/* yetkisiz erisim engelli
- Status transition kurallari uygulanmis
- Notes timeline dogru ve yeni not eklenebiliyor
- Error format standart: { code, message }
- PII guvenligi: detail full, loglarda PII yok
- Rate limit: status update + notes endpoint aktif
- Build basarili: npm run build

Phase-2 (ERTELENEBILIR)
- Assign/flag/archive
- SLA/notification otomasyonu
- Audit log
