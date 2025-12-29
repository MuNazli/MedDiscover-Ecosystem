# M03 Test Cases (PASS/FAIL)

API
1) GET /api/cms/leads/[id] - authorized -> 200 (PASS/FAIL)
2) GET /api/cms/leads/[id] - yetkisiz -> 401/403 (PASS/FAIL)
3) GET /api/cms/leads/[id] - missing id -> 404 (PASS/FAIL)
4) POST /api/cms/leads/[id]/status - valid transition -> 200 (PASS/FAIL)
5) POST /api/cms/leads/[id]/status - invalid transition -> 400 (PASS/FAIL)
6) POST /api/cms/leads/[id]/notes - add -> 200 (PASS/FAIL)
7) POST /api/cms/leads/[id]/notes - flood -> 429 (PASS/FAIL)
8) Error format - { code, message } (PASS/FAIL)

UI
9) /admin/leads/[id] - authorized load (PASS/FAIL)
10) /admin/leads/[id] - yetkisiz engellenir (PASS/FAIL)
11) Status update UI - basarili guncelleme (PASS/FAIL)
12) Notes timeline - yeni not eklenir ve listede gorunur (PASS/FAIL)
13) Notes timeline - tarih sirasi dogru (PASS/FAIL)

Security
14) PII - detail full, listede maskeli pattern korunuyor (PASS/FAIL)
15) Logs - request body yok (PASS/FAIL)
16) Logs - error redaction aktif (PASS/FAIL)

Phase-2 (ERTELENEBILIR)
- Assign/flag/archive aksiyonlari
- Advanced SLA/notification
