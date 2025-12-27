# MedDiscover MVP – Modül Envanteri

> Versiyon: 1.0  
> Tarih: Aralık 2025  
> Durum: MVP Freeze ✓

---

## Genel Bakış

Bu doküman, MedDiscover MVP kapsamındaki tüm modüllerin teknik ve iş perspektifinden envanterini içerir.

| Modül | Ad | Durum |
|-------|-----|-------|
| M01 | Lead Başvuru & Intake | ✓ PASS |
| M02 | Lead Yönetimi (Admin) | ✓ PASS |
| M03 | Klinik / Tedavi Eşleştirme | ✓ PASS |
| M04 | Admin Dashboard | ✓ PASS |
| M06 | In-App Chat & Anti-Circumvention | ✓ PASS |

---

## M01 – Lead Başvuru & Intake

### Amaç
Hastalardan GDPR uyumlu şekilde ilk başvuruyu toplamak.

### Kapsam (MVP)
- Hasta adı, ülke, iletişim tercihi (WhatsApp/Telefon/E-posta)
- Talep edilen işlem (serbest metin)
- GDPR/KVKK onayı (zorunlu checkbox)
- Başvuru sonrası chat sayfasına yönlendirme linki

### MVP Dışı
- Çok adımlı form (wizard)
- Dosya/görsel yükleme
- E-posta veya telefon otomatik doğrulama
- Captcha

### Güvenlik & Notlar
- Sadece gerekli PII tutulur (isim, ülke, tercih)
- Zod ile form validation
- Server-side kontrol zorunlu
- GDPR onayı olmadan kayıt yapılamaz

### Phase-2
- Çoklu dil desteği (DE, EN, AR)
- Akıllı form yönlendirme (ülkeye göre)
- Dosya yükleme (tıbbi belgeler)

---

## M02 – Lead Yönetimi (Admin)

### Amaç
Gelen lead'lerin operasyonel olarak yönetilmesi ve takibi.

### Kapsam (MVP)
- Lead listesi (son 100, tarih sıralı)
- Lead detay görüntüleme
- Status güncelleme (NEW → IN_REVIEW → CONTACTED → CLOSED)
- Admin notları (serbest metin)

### MVP Dışı
- Otomatik status geçişleri
- SLA takibi ve uyarılar
- Toplu işlem (bulk actions)
- Lead silme

### Güvenlik & Notlar
- Admin-only erişim (middleware koruması)
- Durum değişimleri audit edilebilir (updatedAt)
- Server action ile güvenli güncelleme

### Phase-2
- SLA tanımları ve reminder sistemi
- Rol bazlı yetkilendirme (Admin, Operator, Viewer)
- Lead geçmiş logları (audit trail)

---

## M03 – Klinik / Tedavi Eşleştirme

### Amaç
Lead'lerin uygun klinik ve tedavi ile manuel olarak eşleştirilmesi.

### Kapsam (MVP)
- Klinik seçimi (dropdown, aktif klinikler)
- Tedavi seçimi (dropdown, aktif tedaviler)
- Eşleşmenin lead kaydına saklanması
- Eşleşme bilgisinin liste ve detayda görüntülenmesi

### MVP Dışı
- Otomatik/AI destekli eşleştirme
- Çoklu klinik önerisi
- Klinik kapasite kontrolü
- Tedavi-klinik uyumluluk matrisi

### Güvenlik & Notlar
- Sadece aktif (isActive=true) klinik ve tedaviler seçilebilir
- Pasif kayıtlar dropdown'da görünmez
- Seçim değişikliği anında kaydedilir

### Phase-2
- AI destekli matching (hasta profili + klinik özellikleri)
- TrustScore entegrasyonu
- Klinik öncelik sıralaması

---

## M04 – Admin Dashboard

### Amaç
Operasyonel görünürlük sağlamak ve hızlı karar almayı desteklemek.

### Kapsam (MVP)
- **Özet Kartları:**
  - Toplam lead sayısı
  - Son 7 gündeki lead sayısı
  - Yeni (NEW) lead sayısı
  - Kapatılmış (CLOSED) lead sayısı
- **Kırılımlar:**
  - Status bazlı dağılım
  - Ülke bazlı top 10
- **Filtreli Lead Listesi:**
  - Hasta adı araması
  - Ülke filtresi
  - Status filtresi
  - Tarih aralığı filtresi

### MVP Dışı
- Grafikler ve görselleştirmeler
- CSV/Excel export
- Gerçek zamanlı metrikler (WebSocket)
- Özelleştirilebilir dashboard

### Güvenlik & Notlar
- Admin erişimi gerektirir
- Read-only analytics (veri değişikliği yok)
- GET parametreleri ile filtreleme (bookmark yapılabilir)

### Phase-2
- Gelişmiş raporlama (tarihsel karşılaştırma)
- KPI panelleri (conversion rate, response time)
- Scheduled reports (e-posta ile)

---

## M06 – In-App Chat & Anti-Circumvention

### Amaç
Hasta ve klinik iletişimini platform içinde tutmak, platform dışı iletişimi engellemek.

### Kapsam (MVP)
- **Mesajlaşma:**
  - Text tabanlı mesaj gönderimi
  - Hasta mesajları (PATIENT)
  - Klinik mesajları (CLINIC)
  - Admin mesajları (ADMIN)
- **Conversation Yönetimi:**
  - Lead başına otomatik conversation oluşturma
  - Mesaj geçmişi görüntüleme (son 50)
- **Anti-Circumvention (PII Engelleme):**
  - E-posta adresi engelleme
  - Telefon numarası engelleme (9+ digit)
  - WhatsApp referansları engelleme
  - URL/link engelleme
  - Sosyal medya handle engelleme
  - Telegram referansları engelleme

### MVP Dışı
- Dosya/görsel paylaşımı
- Gerçek zamanlı mesajlaşma (WebSocket)
- Push/e-posta bildirimleri
- Mesaj düzenleme/silme
- Okundu bilgisi

### Güvenlik & Notlar
- **Server-side PII/DLP kontrolü zorunludur**
- Client-side bypass mümkün değildir
- Tüm mesajlar veritabanında loglanır
- Engellenen mesajlar kaydedilmez (400 döner)
- Platform dışı iletişim girişimleri bloklanır

### Phase-2
- Maskeli telefon numarası (proxy call)
- Maskeli e-posta adresi
- Bildirim sistemi (in-app, push, e-posta)
- Audit & risk skorları
- Mesaj şifreleme (end-to-end)

---

## Genel Notlar

### MVP Freeze Politikası
- Bu envanterdeki modüller MVP kapsamında kilitlenmiştir
- Yeni modül eklenmesi Phase-2'ye ertelenmiştir
- Mevcut modüllerde sadece kritik bug fix yapılabilir

### Test Durumu
Tüm modüller fonksiyonel test edilmiş ve PASS almıştır:
- Temel akışlar doğrulanmıştır
- Edge case'ler manuel test edilmiştir
- PII engelleme mekanizması test edilmiştir

### Teknik Altyapı
| Bileşen | Teknoloji |
|---------|-----------|
| Framework | Next.js 14 (App Router) |
| Database | SQLite (Prisma ORM) |
| Validation | Zod |
| Styling | Inline CSS (MVP) |
| Auth | Header-based (MVP) |

---

## Modül Bağımlılıkları

```
M01 (Lead Intake)
  ↓
M02 (Lead Yönetimi) ← M03 (Eşleştirme)
  ↓
M06 (Chat)
  ↓
M04 (Dashboard) ← Tüm veriler
```

---

*Bu doküman MedDiscover MVP v1.0 Modül Envanteri olarak hazırlanmıştır.*
