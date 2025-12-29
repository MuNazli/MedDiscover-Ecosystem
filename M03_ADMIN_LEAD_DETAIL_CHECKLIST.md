# M03 Admin Lead Detail Checklist (PASS/FAIL)

1) Auth - ADMIN_PASSPHRASE login + HttpOnly cookie/JWT (PASS/FAIL)
2) Auth - Kisa TTL uygulanmis (PASS/FAIL)
3) Guard - /admin/leads/[id] yetkisiz erisim 401/403 (PASS/FAIL)
4) Guard - /api/cms/* yetkisiz erisim 401/403 (PASS/FAIL)
5) Rate limit - status update endpoint (PASS/FAIL)
6) Rate limit - notes endpoint (PASS/FAIL)
7) PII - Detail ekranda full data (PASS/FAIL)
8) Logging - Request body loglanmiyor (PASS/FAIL)
9) Logging - Error redaction aktif (PASS/FAIL)
10) Error format - { code, message } (PASS/FAIL)
11) Status transition - kurallara uyum (PASS/FAIL)
12) Notes timeline - siralama dogru (PASS/FAIL)

API Route Listesi (MVP)
- GET /api/cms/leads/[id]
- POST /api/cms/leads/[id]/status
- POST /api/cms/leads/[id]/notes

Status Transition Kurallari (MVP)
- new -> contacted | qualified | disqualified
- contacted -> qualified | disqualified
- qualified -> won | lost
- disqualified -> (terminal)
- won -> (terminal)
- lost -> (terminal)

API Ornekleri

GET /api/cms/leads/[id]
Response:
{
  "id": "lead_123",
  "name": "Ayse Yilmaz",
  "email": "ayse@example.com",
  "phone": "+905551112233",
  "status": "contacted",
  "notes": [
    { "id": "note_1", "text": "Called, left voicemail", "createdAt": "2025-01-03T12:00:00Z" }
  ],
  "createdAt": "2025-01-02T10:00:00Z"
}

POST /api/cms/leads/[id]/status
Request:
{ "status": "qualified" }
Response:
{ "ok": true, "status": "qualified", "updatedAt": "2025-01-04T09:00:00Z" }

POST /api/cms/leads/[id]/notes
Request:
{ "text": "Scheduled follow-up for Friday" }
Response:
{ "ok": true, "note": { "id": "note_2", "text": "Scheduled follow-up for Friday", "createdAt": "2025-01-04T09:10:00Z" } }

Phase-2 (ERTELENEBILIR)
- Assign (owner atama)
- Flag / pin
- Archive / restore
- SLA timers / reminders
