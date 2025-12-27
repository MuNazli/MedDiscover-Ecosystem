# MedDiscover – Phase-2 Roadmap

> Versiyon: 1.0  
> Tarih: Aralık 2025  
> Durum: Planlama ✓

---

## 1. Phase-2 Nedir? (Amaç & Kapsam)

### MVP Sonrası Ölçekleme Fazı

Phase-2, MVP'nin pazar doğrulaması sonrasında başlayacak büyüme aşamasıdır. MVP'de kurulan temel üzerine ölçek, otomasyon ve gelir optimizasyonu inşa edilecektir.

### Temel Odak Alanları

| Alan | Açıklama |
|------|----------|
| **Gelir Artırımı** | Komisyon koruması, sigorta paketleri, premium hizmetler |
| **Operasyonel Otomasyon** | Manuel iş yükünü azaltan sistemler |
| **Platform Kilidi** | Anti-circumvention mekanizmalarının güçlendirilmesi |
| **Güven & Şeffaflık** | TrustScore, audit, regülasyon uyumu |

### MVP'den Farkı

| MVP | Phase-2 |
|-----|---------|
| Manuel operasyon | Otomatik + manuel hibrit |
| Admin merkezli | Klinik self-servis |
| Text engelleme | Maskeli iletişim |
| Basit eşleştirme | AI destekli öneri |
| Tek dil | Çoklu dil |

---

## 2. Phase-2 Temel Hedefleri

### 1. Klinik & Hasta Sayısını Ölçeklemek

- Klinik onboarding süresini kısaltmak
- Hasta başvuru hacmini artırmak
- Coğrafi genişleme (yeni ülkeler)

### 2. Manuel Operasyonu Azaltmak

- Admin eşleştirme yükünü hafifletmek
- Klinik self-servis işlemleri
- Otomatik bildirimler ve hatırlatmalar

### 3. Geliri ve Platform Bağlılığını Artırmak

- Komisyon kaçışını sıfıra yaklaştırmak
- Sigorta paketleri ile ek gelir
- Premium klinik programları

### 4. Regülasyon ve Güven Çıtasını Yükseltmek

- GDPR/KVKK tam otomasyon
- Klinik kalite kontrolü (TrustScore)
- Audit ve compliance altyapısı

---

## 3. Phase-2 Modül Listesi (Öncelik Sırasıyla)

---

### P2-01: Klinik & Tedavi Yönetimi (Self-Panel)

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Klinik onboarding hızlanır | Admin darboğazı kalkar |
| Admin yükü azalır | Operasyonel maliyet düşer |
| Klinik memnuniyeti artar | Self-servis kontrol |

#### Teknik Kapsam

- Clinic CRUD (oluştur, düzenle, sil)
- Treatment CRUD
- Aktif/pasif durumu yönetimi
- Klinik profil sayfası
- Role: `CLINIC` (yeni rol)

#### Bağımlılıklar

- Auth & RBAC altyapısı

---

### P2-02: TrustScore Sistemi

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Klinik kalite kontrolü | Hasta güvenliği artar |
| Sahte/riskli partnerlerin elenmesi | Platform itibarı korunur |
| Eşleştirme kalitesi yükselir | Dönüşüm oranı artar |

#### Teknik Kapsam

- Skor modeli: 0–100 puan
- Skor bileşenleri:
  - Hasta memnuniyeti
  - Yanıt süresi
  - Başarılı tedavi oranı
  - Platform kurallarına uyum
- Olay bazlı puanlama (event-driven)
- Admin override (manuel düzeltme)
- Skor geçmişi ve trend

#### Bağımlılıklar

- Audit log altyapısı
- Hasta geri bildirim mekanizması

---

### P2-03: AI Destekli Eşleştirme

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Daha iyi lead-klinik eşleşmesi | Dönüşüm oranı yükselir |
| Manuel eşleştirme azalır | Operasyon hızlanır |
| Kişiselleştirilmiş deneyim | Hasta memnuniyeti artar |

#### Teknik Kapsam

- Kural tabanlı + ML hibrit sistem
- Matching faktörleri:
  - Hasta ülkesi ↔ Klinik lokasyonu
  - Talep edilen işlem ↔ Klinik uzmanlığı
  - Bütçe aralığı ↔ Klinik fiyatlandırması
  - TrustScore
- Admin onaylı öneri sistemi
- A/B test altyapısı

#### Bağımlılıklar

- TrustScore sistemi
- Yeterli veri birikimi (minimum 500+ lead)

---

### P2-04: Sigorta Paketli Tedavi

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Hasta güveni artar | Risk algısı düşer |
| Platformda kalma oranı yükselir | Komisyon korunur |
| Ek gelir kanalı | Sigorta primi payı |

#### Teknik Kapsam

- Sigorta ürün tanımlama
- Tedavi + sigorta paketi oluşturma
- Fiyat sübvansiyonu modeli (klinik + platform)
- Sigorta durumu takibi
- Claim (talep) yönetimi (Phase-3)

#### Bağımlılıklar

- Sigorta partner entegrasyonu
- Ödeme altyapısı

---

### P2-05: Maskeli İletişim

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Anti-circumvention güçlenir | Komisyon kaçışı önlenir |
| Klinik/hasta memnuniyeti artar | Gerçek iletişim imkanı |
| Platform kontrolü korunur | Tüm iletişim kayıt altında |

#### Teknik Kapsam

- **Maskeli Telefon:**
  - Proxy numara ataması
  - Görüşme kaydı (opsiyonel)
  - Süre limiti
- **Maskeli E-posta:**
  - Alias e-posta adresleri
  - Forward mekanizması
  - Spam koruması
- Audit log entegrasyonu

#### Bağımlılıklar

- Telefon API (Twilio, Vonage)
- E-posta servisi (SendGrid, Postmark)

---

### P2-06: Gelişmiş Güvenlik & Audit

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Kurumsal güven | B2B satışları kolaylaşır |
| Regülasyon uyumu | Yasal risk azalır |
| Fraud tespiti | Platform güvenliği artar |

#### Teknik Kapsam

- **Audit Log:**
  - Entity değişiklikleri
  - Kullanıcı aksiyonları
  - Timestamp + actor tracking
- **Rate Limiting:**
  - API endpoint koruması
  - IP + user bazlı limit
- **Fraud Sinyalleri:**
  - Şüpheli davranış tespiti
  - Alert mekanizması
  - TrustScore etkisi

#### Bağımlılıklar

- Database migration (PostgreSQL)
- Redis (rate limiting için)

---

### P2-07: SEO & Discoverability

#### İş Değeri

| Değer | Açıklama |
|-------|----------|
| Organik lead | Pazarlama maliyeti düşer |
| LLM discoverability | AI araçlarında görünürlük |
| Marka bilinirliği | Uzun vadeli büyüme |

#### Teknik Kapsam

- **SEO Altyapısı:**
  - Dynamic sitemap
  - Meta tags optimization
  - Canonical URLs
- **Schema.org Markup:**
  - MedicalOrganization
  - MedicalProcedure
  - FAQPage
- **Çok Dilli Sayfalar:**
  - /de/ → Almanca
  - /tr/ → Türkçe
  - /en/ → İngilizce
  - hreflang tags

#### Bağımlılıklar

- Multi-language routing
- Public content stratejisi

---

## 4. Teknik Altyapı Geçişleri

Phase-2 modüllerini desteklemek için gerekli altyapı geçişleri:

| Geçiş | Mevcut | Hedef | Neden |
|-------|--------|-------|-------|
| **Database** | SQLite | PostgreSQL | Concurrency, scale |
| **Auth** | Header-based | JWT + Sessions | Multi-role, güvenlik |
| **RBAC** | Admin-only | Admin/Clinic/Patient | Self-servis |
| **Background Jobs** | Yok | Queue (BullMQ/Inngest) | Async işlemler |
| **File Storage** | Yok | S3/R2 + encryption | Tıbbi dokümanlar |
| **Caching** | Yok | Redis | Performance |
| **Routing** | Tek dil | i18n | Çoklu dil |

### Geçiş Sırası

1. PostgreSQL migration (en önce)
2. Auth & RBAC
3. Redis + Queue
4. i18n routing
5. File storage

---

## 5. Öncelik Matrisi (Özet)

| Modül | İş Etkisi | Teknik Zorluk | Öncelik |
|-------|-----------|---------------|---------|
| P2-01 Klinik Panel | 🔴 Yüksek | 🟡 Orta | 1 |
| P2-02 TrustScore | 🔴 Çok Yüksek | 🟡 Orta | 2 |
| P2-06 Güvenlik & Audit | 🔴 Yüksek | 🟡 Orta | 3 |
| P2-05 Maskeli İletişim | 🔴 Yüksek | 🟡 Orta | 4 |
| P2-03 AI Matching | 🔴 Çok Yüksek | 🔴 Yüksek | 5 |
| P2-04 Sigorta | 🔴 Yüksek | 🟡 Orta | 6 |
| P2-07 SEO | 🟡 Orta | 🟢 Düşük | 7 |

### Öncelik Mantığı

1. **Klinik Panel** → Operasyon darboğazını çözer
2. **TrustScore** → Kalite kontrolü sağlar
3. **Güvenlik** → Ölçek için temel
4. **Maskeli İletişim** → Platform kilidini güçlendirir
5. **AI Matching** → Veri birikimi gerektirir
6. **Sigorta** → Partner entegrasyonu gerektirir
7. **SEO** → Public content stratejisi netleşmeli

---

## 6. Phase-2'ye Geçiş Kriterleri

Phase-2'ye başlamak için aşağıdaki koşullar sağlanmalıdır:

### ✓ MVP Stabil

- Kritik bug yok
- Temel akışlar çalışıyor
- Performans kabul edilebilir

### ✓ İlk Klinik Partnerler

- Minimum 3 aktif klinik
- Partner geri bildirimi alınmış
- Onboarding süreci test edilmiş

### ✓ İlk Gelir Sinyali

- En az 1 başarılı lead-to-treatment dönüşümü
- Komisyon modeli doğrulanmış
- Fiyatlandırma test edilmiş

### ✓ Operasyonel Darboğazlar Net

- Manuel iş yükü ölçülmüş
- Darboğaz noktaları belirlenmiş
- Öncelikler netleşmiş

---

## 7. Bilinçli Riskler

### AI Yanlış Eşleşme Riski

| Risk | Mitigasyon |
|------|------------|
| Yanlış klinik önerisi | Admin onay mekanizması |
| Hasta memnuniyetsizliği | Geri bildirim döngüsü |
| TrustScore etkisi | Manuel düzeltme imkanı |

### Regülasyon Farkları (Ülke Bazlı)

| Risk | Mitigasyon |
|------|------------|
| GDPR vs KVKK farkları | Ülke bazlı policy |
| Sağlık verisi düzenlemeleri | Hukuk danışmanlığı |
| Sigorta regülasyonları | Partner üzerinden compliance |

### Klinik Adaptasyonu

| Risk | Mitigasyon |
|------|------------|
| Self-panel öğrenme eğrisi | Onboarding desteği |
| Platform kurallarına direnç | Değer önerisini netleştirme |
| Teknik entegrasyon sorunları | API dokümantasyonu |

---

## 8. Zaman Çizelgesi (Tahmini)

```
Q1 2026
├── PostgreSQL migration
├── Auth & RBAC
└── P2-01 Klinik Panel (başlangıç)

Q2 2026
├── P2-01 Klinik Panel (tamamlama)
├── P2-02 TrustScore
└── P2-06 Güvenlik & Audit

Q3 2026
├── P2-05 Maskeli İletişim
├── P2-03 AI Matching (başlangıç)
└── P2-07 SEO

Q4 2026
├── P2-03 AI Matching (tamamlama)
├── P2-04 Sigorta
└── Phase-3 planlama
```

*Bu zaman çizelgesi tahminidir ve kaynak durumuna göre değişebilir.*

---

## Özet

Phase-2, MedDiscover'ı **MVP'den ölçeklenebilir platforma** dönüştürecek aşamadır.

| Hedef | Araç |
|-------|------|
| Ölçek | Klinik self-panel, AI matching |
| Güven | TrustScore, audit log |
| Gelir | Sigorta, maskeli iletişim |
| Erişim | SEO, çoklu dil |

MVP'de kurulan **anti-circumvention temeli** Phase-2'de güçlendirilecek ve platform değeri korunacaktır.

---

*Bu doküman MedDiscover Phase-2 stratejik planlaması için hazırlanmıştır.*
