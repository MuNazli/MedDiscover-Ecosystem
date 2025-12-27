# Dashboard API Response Example

## Endpoint
```
GET /api/cms/dashboard
```

## Auth
- Requires `md_admin` cookie
- Returns 401 if unauthorized

## Response (200 OK)
```json
{
  "totals": {
    "total": 125,
    "last7d": 18,
    "last24h": 3,
    "open": 87
  },
  "statusCounts": {
    "NEW": 42,
    "IN_REVIEW": 28,
    "OFFER_SENT": 17,
    "CLOSED": 38
  },
  "recentAudits": [
    {
      "id": "clxyz123abc",
      "leadId": "clxyz456def",
      "action": "STATUS_CHANGED",
      "createdAt": "2025-12-24T10:30:00.000Z",
      "actor": "admin"
    },
    {
      "id": "clxyz789ghi",
      "leadId": "clxyz012jkl",
      "action": "NOTE_ADDED",
      "createdAt": "2025-12-24T09:15:00.000Z",
      "actor": "admin"
    }
  ]
}
```

## Notes
- `totals.open` includes NEW, IN_REVIEW, and OFFER_SENT (excludes CLOSED)
- `recentAudits` limited to 20 items, sorted by createdAt DESC
- No PII in response (no email, phone, name)
- Audit `meta` field excluded (could contain PII)
