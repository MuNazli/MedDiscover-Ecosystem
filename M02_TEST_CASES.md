# M02 Test Cases (API + UI) - PASS/FAIL

API
1) POST /api/cms/auth - dogru passphrase -> 200 + cookie/JWT (PASS/FAIL)
2) POST /api/cms/auth - yanlis passphrase -> 401 (PASS/FAIL)
3) GET /api/cms/leads - yetkisiz -> 401/403 (PASS/FAIL)
4) GET /api/cms/leads - authorized -> 200 + pagination (PASS/FAIL)
5) GET /api/cms/leads - filter/sort calisir (PASS/FAIL)
6) GET /api/cms/leads/[id] - authorized -> 200 (PASS/FAIL)
7) GET /api/cms/leads/[id] - missing id -> 404 (PASS/FAIL)
8) POST /api/cms/leads/[id]/status - valid -> 200 (PASS/FAIL)
9) POST /api/cms/leads/[id]/status - invalid -> 400 (PASS/FAIL)
10) POST /api/cms/leads/[id]/notes - add -> 200 (PASS/FAIL)
11) POST /api/cms/leads/[id]/notes - flood -> 429 (PASS/FAIL)

UI
12) /cms/login - login basarili (PASS/FAIL)
13) /cms/* - yetkisiz erisim engelli (PASS/FAIL)
14) Leads list - maskeli PII (PASS/FAIL)
15) Lead detail - full PII (PASS/FAIL)
16) Notes - ekleme + okuma (PASS/FAIL)
17) Status - guncelleme UI'da yansir (PASS/FAIL)

Non-functional
18) Logs - request body yok (PASS/FAIL)
19) Logs - error redaction aktif (PASS/FAIL)
20) Vercel Logs - statik asset hatasi yok (favicon 500 / clientModules) (PASS/FAIL)

Phase-2 (ERTELENEBILIR)
- Export endpoint / UI
- Audit log gorunum
- Retention/anonimlestirme akisi
