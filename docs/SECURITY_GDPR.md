# MedDiscover MVP – Security & GDPR

> Versiyon: 1.0  
> Tarih: Aralık 2025  
> Kapsam: MVP Seviyesi  
> Durum: Aktif ✓

---

## 1. Giriş – Güvenlik ve Uyum Yaklaşımı

### Veri Minimizasyonu

MedDiscover, kişisel veri işleme konusunda **veri minimizasyonu** ilkesini benimser. Yalnızca hizmetin sunulması için zorunlu olan veriler toplanır ve işlenir.

Bu yaklaşım hem kullanıcı gizliliğini korur hem de platform için veri yönetimi yükünü azaltır.

### Privacy by Design

Platform tasarımında gizlilik ön planda tutulmuştur:
- Gereksiz veri alanları oluşturulmamıştır
- İletişim bilgileri (telefon, e-posta) form alanı olarak istenmez
- Platform içi iletişim, harici kanal ihtiyacını ortadan kaldırır

### MVP Kapsamında Bilinçli Sınırlar

Bu doküman **MVP seviyesindeki** güvenlik ve uyum durumunu yansıtır. Gelişmiş özellikler (otomatik silme, detaylı audit log, rol bazlı yetkilendirme) Phase-2 kapsamında planlanmıştır.

MVP, temel güvenlik gereksinimlerini karşılamakta ve yasal uyum için gerekli asgari koşulları sağlamaktadır.

---

## 2. İşlenen Kişisel Veriler (Data Inventory)

### Toplanan ve İşlenen Veriler

| Veri Türü | Açıklama | Zorunlu | Amaç |
|-----------|----------|---------|------|
| Hasta Adı | Ad veya takma ad | Evet | Tanımlama, iletişim |
| Ülke | ISO-2 ülke kodu | Evet | Eşleştirme, operasyon |
| İletişim Tercihi | WhatsApp / Telefon / E-posta (kanal tipi) | Evet | Tercih bilgisi |
| Talep Edilen İşlem | Serbest metin | Evet | Eşleştirme, hizmet |
| GDPR Onayı | Boolean (Evet/Hayır) | Evet | Yasal dayanak |
| Mesaj İçerikleri | Platform içi yazışmalar | Hayır* | İletişim |

*Mesajlar kullanıcı etkileşimi sonucu oluşur.

### İşlenmeyen / Tutulmayan Veriler

Aşağıdaki veriler **MVP kapsamında toplanmaz ve saklanmaz**:

| Veri Türü | Durum |
|-----------|-------|
| Telefon numarası | ❌ Toplanmaz |
| E-posta adresi | ❌ Toplanmaz |
| Kimlik / Pasaport bilgisi | ❌ Toplanmaz |
| Sağlık raporları / Tıbbi dosyalar | ❌ Toplanmaz |
| Ödeme / Kredi kartı bilgisi | ❌ Toplanmaz |
| Konum verisi (GPS) | ❌ Toplanmaz |
| Çerez tabanlı izleme | ❌ Uygulanmaz |

---

## 3. Veri İşleme Amaçları

Toplanan kişisel veriler yalnızca aşağıdaki amaçlarla işlenir:

### Lead Yönetimi
Hasta başvurularının alınması, kaydedilmesi ve takip edilmesi.

### Klinik / Tedavi Eşleştirme
Hasta talebine uygun klinik ve tedavi seçeneklerinin belirlenmesi.

### Platform İçi İletişim
Hasta ve klinik arasında güvenli mesajlaşmanın sağlanması.

### Operasyonel Kalite ve Denetim
Süreç takibi, durum güncellemeleri ve hizmet kalitesinin izlenmesi.

### İşlenmeyen Amaçlar

Veriler aşağıdaki amaçlarla **kullanılmaz**:
- Pazarlama veya reklam
- Üçüncü taraflara satış
- Profilleme veya otomatik karar alma
- Kullanıcı davranış analizi (analytics)

---

## 4. In-App İletişim & PII Koruması

### Platform İçi İletişim Zorunluluğu

Hasta ve klinik arasındaki tüm iletişim MedDiscover platformu içinde gerçekleşir. Harici iletişim kanalları (WhatsApp, e-posta, telefon) kullanılmaz.

### PII Engelleme Mekanizması

Mesaj içeriklerinde kişisel iletişim bilgilerinin paylaşılması **server-side** olarak engellenir:

| Engellenen İçerik | Tespit Yöntemi |
|-------------------|----------------|
| E-posta adresi | Regex pattern |
| Telefon numarası (9+ hane) | Regex pattern |
| WhatsApp referansları | Keyword detection |
| URL / Link | Protocol detection |
| Sosyal medya handle | Pattern matching |
| Telegram referansları | Keyword detection |

### Engelleme Davranışı

- Tespit edilen mesajlar **kaydedilmez**
- Kullanıcıya hata mesajı döner
- İşlem loglanmaz (içerik saklanmaz)

### Neden Server-Side?

Client-side engelleme atlanabilir. Server-side kontrol, güvenliğin bypass edilememesini garanti eder.

---

## 5. Anti-Circumvention ve Güvenlik Rolü

### Platform Dışı İletişimin Önlenmesi

Anti-circumvention mekanizması, platform dışı iletişim girişimlerini engeller. Bu önlem:
- Hasta gizliliğini korur
- Süreç bütünlüğünü sağlar
- İş modeli sürdürülebilirliğini destekler

### Eşit Kurallar

PII engelleme kuralları tüm taraflar için geçerlidir:
- Hasta → PII paylaşamaz
- Klinik → PII paylaşamaz
- Admin → PII paylaşamaz

### Güvenlik ve Ticari Denge

Bu mekanizma hem güvenlik hem de ticari amaçlara hizmet eder:
- **Güvenlik**: Hasta bilgileri korunur
- **Ticari**: Platform değeri korunur

Her iki amaç birbiriyle çelişmez, aksine birbirini destekler.

---

## 6. Teknik Güvenlik Önlemleri (MVP)

### Input Validation

| Katman | Yöntem |
|--------|--------|
| Client-side | HTML5 validation, React controlled inputs |
| Server-side | Zod schema validation |
| Database | Prisma ORM type safety |

### Server-Side Kontroller

- Tüm form verileri server-side doğrulanır
- Zod ile tip ve format kontrolü yapılır
- Geçersiz veriler reddedilir (400 Bad Request)

### Veritabanı Güvenliği

- Prisma ORM ile SQL injection önlenir
- Prepared statements kullanılır
- Doğrudan SQL sorgusu yazılmaz

### Erişim Kontrolü

- Admin rotaları middleware ile korunur
- Yetkisiz erişim denemeleri 401 Unauthorized döner
- API endpoint'leri yetki kontrolü içerir

### MVP Sınırları

Aşağıdaki güvenlik özellikleri MVP'de **mevcut değildir**:
- Rate limiting
- CAPTCHA
- İki faktörlü doğrulama (2FA)
- Session token yönetimi

Bu özellikler Phase-2 kapsamında değerlendirilecektir.

---

## 7. Saklama Süreleri (Retention)

### Mevcut Politika (MVP)

| Veri Türü | Saklama Süresi |
|-----------|----------------|
| Lead verileri | Operasyonel ihtiyaç süresince |
| Mesajlar | Lead yaşam döngüsü boyunca |
| Conversation kayıtları | Lead ile birlikte |

### Silme Mekanizması

MVP'de otomatik silme mekanizması yoktur. Silme işlemleri manuel olarak gerçekleştirilir.

### Phase-2 Planlaması

- Otomatik veri saklama süreleri tanımlanacak
- Retention policy otomasyonu eklenecek
- Anonimleştirme seçenekleri sunulacak

---

## 8. Kullanıcı Hakları (GDPR / KVKK)

MedDiscover, GDPR (Avrupa) ve KVKK (Türkiye) kapsamındaki kullanıcı haklarını tanır.

### Tanınan Haklar

| Hak | MVP Desteği |
|-----|-------------|
| Bilgi alma hakkı | ✓ Manuel |
| Veriye erişim hakkı | ✓ Manuel |
| Düzeltme hakkı | ✓ Manuel |
| Silme hakkı ("unutulma") | ✓ Manuel |
| İşlemeyi kısıtlama | ✓ Manuel |
| Veri taşınabilirliği | ◐ Sınırlı |
| İtiraz hakkı | ✓ Manuel |

### Hak Kullanım Süreci

1. Kullanıcı, platform üzerinden veya belirtilen iletişim kanalından talepte bulunur
2. Talep değerlendirilir
3. Yasal süre içinde (30 gün) yanıt verilir
4. İşlem manuel olarak gerçekleştirilir

### MVP Sınırları

- Self-servis hak kullanımı mevcut değildir
- Talepler manuel işlenir
- Otomatik anonimleştirme yoktur

---

## 9. Üçüncü Taraflar & Paylaşım

### MVP Durumu

MVP kapsamında **üçüncü taraf veri paylaşımı yoktur**.

| Entegrasyon | Durum |
|-------------|-------|
| Harici CRM | ❌ Yok |
| Ödeme sağlayıcı | ❌ Yok |
| E-posta servisi | ❌ Yok |
| SMS/WhatsApp API | ❌ Yok |
| Analytics servisi | ❌ Yok |
| Reklam ağları | ❌ Yok |

### Veri Lokasyonu

Tüm veriler MedDiscover altyapısında saklanır. Harici veri transferi yapılmaz.

### Phase-2 Değerlendirmesi

Üçüncü taraf entegrasyonları (ödeme, bildirim vb.) Phase-2'de değerlendirildiğinde, GDPR uyumlu veri işleme sözleşmeleri (DPA) hazırlanacaktır.

---

## 10. Riskler & Bilinçli MVP Sınırları

### Kabul Edilen Sınırlar

| Sınır | Risk | MVP Kararı |
|-------|------|------------|
| Otomatik silme yok | Veri birikimi | Manuel yönetim |
| Detaylı audit log yok | İz sürülebilirlik | Temel logging |
| Role-based access sınırlı | Yetki karmaşası | Admin-only erişim |
| Rate limiting yok | Abuse riski | Düşük trafik varsayımı |
| 2FA yok | Hesap güvenliği | Admin-only kullanım |

### Risk Değerlendirmesi

Bu sınırlar **bilinçli olarak** kabul edilmiştir:
- MVP trafik hacmi düşük beklenmektedir
- Admin kullanıcı sayısı sınırlıdır
- Kritik finansal veri işlenmemektedir
- Erken pazara çıkış önceliklidir

### Phase-2 Öncelikleri

Yukarıdaki riskler Phase-2'de adreslenecektir.

---

## 11. Phase-2 Güvenlik Genişlemeleri

### Planlanan Geliştirmeler

| Özellik | Açıklama |
|---------|----------|
| **Maskeli İletişim** | Gerçek telefon/e-posta paylaşmadan iletişim |
| **TrustScore** | Klinik ve hasta güvenilirlik puanlaması |
| **Fraud Detection** | Şüpheli davranış tespiti |
| **Gelişmiş Audit Log** | Detaylı işlem kaydı ve iz sürme |
| **Otomatik Retention** | Veri saklama süresi otomasyonu |
| **Self-Servis Haklar** | Kullanıcıların kendi verilerini yönetmesi |
| **Role-Based Access** | Granüler yetki yönetimi |
| **ISO 27001 Hazırlığı** | Bilgi güvenliği sertifikasyonu |
| **SOC 2 Hazırlığı** | Hizmet organizasyonu kontrolleri |

### Öncelik Sıralaması

1. Gelişmiş Audit Log
2. Role-Based Access Control
3. Otomatik Retention Policy
4. Self-Servis Hak Kullanımı
5. Maskeli İletişim
6. Sertifikasyon hazırlıkları

---

## Özet

MedDiscover MVP, kişisel veri işleme konusunda **minimal ve bilinçli** bir yaklaşım benimser:

| Prensip | Uygulama |
|---------|----------|
| Veri Minimizasyonu | Sadece gerekli veriler toplanır |
| Privacy by Design | İletişim bilgisi form alanı olarak istenmez |
| PII Koruması | Server-side engelleme aktif |
| Şeffaflık | Veri işleme amaçları açıkça belirtilir |
| Kullanıcı Hakları | GDPR/KVKK hakları tanınır |
| Üçüncü Taraf | Veri paylaşımı yapılmaz |

MVP seviyesinde tam otomasyon yoktur ancak temel güvenlik ve uyum gereksinimleri karşılanmaktadır. Gelişmiş özellikler Phase-2'de hayata geçirilecektir.

---

## İletişim

Veri koruma ve GDPR/KVKK ile ilgili sorular için:

**E-posta**: [Belirlenecek]  
**Adres**: [Belirlenecek]

---

*Bu doküman MedDiscover MVP v1.0 için hazırlanmıştır ve yasal tavsiye niteliği taşımaz.*
