# MedDiscover MVP – User Flow & Value Chain

> Versiyon: 1.0  
> Tarih: Aralık 2025  
> Durum: MVP Freeze ✓

---

## 1. Giriş – Neden User Flow?

### Sağlık Turizminde Dağınıklık

Sağlık turizmi sektörü yapısal olarak dağınıktır:
- Hasta, birden fazla aracıyla muhatap olur
- Klinikler, farklı kanallardan lead alır
- İletişim WhatsApp, e-posta, telefon arasında dağılır
- Süreç takibi imkansız hale gelir

Bu dağınıklık hem hasta deneyimini bozar hem de aracıların gelir modelini tehdit eder.

### Neden Uçtan Uca Kontrol Gerekiyor?

Değer yaratmak için sürecin başından sonuna kadar kontrol edilmesi gerekir:
- Hasta nereden geldi? → Bilinmeli
- Klinikle nasıl eşleşti? → Kayıt altında olmalı
- İletişim nasıl ilerledi? → Görünür olmalı
- Sonuç ne oldu? → Ölçülebilmeli

Kontrol olmadan ne kalite garanti edilebilir ne de komisyon korunabilir.

### MedDiscover Bu Boşluğu Nasıl Dolduruyor?

MedDiscover, tüm aktörleri tek platformda buluşturur:
- **Hasta** → Başvurur, güvenli iletişim kurar
- **Admin** → Yönetir, eşleştirir, takip eder
- **Klinik** → Platform içinde hasta ile iletişim kurar

Platform dışına çıkış engellendiğinde süreç kontrol altında kalır.

---

## 2. Hasta (Patient) User Flow

### Akış

```
Landing Page
    ↓
Lead Başvuru Formu (GDPR onaylı)
    ↓
Başvuru Başarılı
    ↓
"Mesajlaşmaya Geç" Butonu
    ↓
In-App Chat Açılır
    ↓
Klinik ile Güvenli İletişim
    ↓
Tedavi Süreci Başlar
```

### Kritik Noktalar

**Platform Dışına Çıkamaz**
Hasta, telefon numarası veya e-posta paylaşmak istese bile sistem engeller. Tüm iletişim platform içinde kalır.

**Kendini Güvende Hisseder**
- Tek bir platform, tek bir muhatap
- Resmi ve kayıtlı iletişim
- Kişisel bilgileri korunuyor

**Tek Temas Noktası MedDiscover**
Hasta için karmaşıklık yok. Başvur → Bekle → Mesajlaş → İlerle.

---

## 3. Admin (Operasyon) User Flow

### Akış

```
Yeni Lead Gelir (Dashboard'da görünür)
    ↓
Lead İnceleme (Detay sayfası)
    ↓
Status Güncelleme (NEW → IN_REVIEW)
    ↓
Klinik / Tedavi Eşleştirme
    ↓
Status: CONTACTED
    ↓
In-App Chat Takibi
    ↓
Notlar Eklenir
    ↓
Lead Kapanışı (CLOSED)
```

### Kritik Noktalar

**Operasyonel Görünürlük**
- Dashboard'da anlık durum
- Filtreleme ve arama
- Kırılım raporları

**Manuel Ama Kontrollü Süreç**
MVP'de otomasyon yok. Admin her kararı bilinçli verir. Bu, kalite kontrolü sağlar.

**Komisyon ve Kalite Kontrolü**
- Eşleştirme admin tarafından yapılır
- İletişim takip edilir
- Sonuç ölçülür

---

## 4. Klinik (Provider) Etkileşim Akışı

### MVP Yaklaşımı

MVP'de klinik için ayrı panel yoktur. Klinik etkileşimi şu şekilde gerçekleşir:

```
Admin, Lead'i Kliniğe Eşleştirir
    ↓
Admin, Klinik Adına Mesaj Gönderir
    ↓
Hasta Yanıt Verir
    ↓
İletişim Platform İçinde Devam Eder
```

### Sınırlar

**Klinik Doğrudan İletişime Geçemez**
- Hasta iletişim bilgisi klinikle paylaşılmaz
- Klinik, platform dışı kanal kullanamaz

**Admin Aracılığıyla İlerler**
- Admin, klinik adına mesaj atar
- Veya klinik temsilcisi admin panelden yazar

**İletişim Sınırları Nettir**
- PII engelleme klinik için de geçerli
- Platform kuralları herkes için aynı

### Sonuç

- Klinik kurallara uyar
- Platform bypass edilemez
- Komisyon korunur

---

## 5. Value Chain – Değer Nerede Üretiliyor?

### Hasta İçin Değer

| Değer | Açıklama |
|-------|----------|
| **Güven** | Resmi platform, kayıtlı iletişim |
| **Net Süreç** | Başvur → Eşleş → İletişim → Tedavi |
| **Tek Muhatap** | Karmaşıklık yok, MedDiscover yönetiyor |

Hasta için değer: **Güvenli ve basit deneyim**

### Klinik İçin Değer

| Değer | Açıklama |
|-------|----------|
| **Nitelikli Lead** | Filtrelenmiş, GDPR onaylı hastalar |
| **Operasyonel Kolaylık** | Lead yönetimi platform tarafından yapılır |
| **Şeffaf İletişim** | Tüm yazışmalar kayıt altında |

Klinik için değer: **Hazır ve yönetilmiş hasta akışı**

### MedDiscover İçin Değer

| Değer | Açıklama |
|-------|----------|
| **Komisyon Korunur** | Platform dışı kaçış engellenir |
| **Veri Platformda Kalır** | İletişim, tercihler, sonuçlar |
| **Ölçeklenebilir İş Modeli** | Manuel başla, otomasyonla büyü |

MedDiscover için değer: **Sürdürülebilir gelir ve veri varlığı**

---

## 6. Anti-Circumvention Rolü (Merkezî Değer)

MedDiscover'ın iş modelinin kalbinde **anti-circumvention** mekanizması vardır.

### In-App Chat Zorunluluğu

Hasta ve klinik arasındaki tüm iletişim platform içinde gerçekleşir. Alternatif kanal sunulmaz.

### PII Engelleme

Aşağıdaki bilgiler mesajlarda **otomatik olarak engellenir**:

| Tür | Örnek | Durum |
|-----|-------|-------|
| E-posta | `hasta@mail.com` | ❌ Engellenir |
| Telefon | `+49 123 456 7890` | ❌ Engellenir |
| WhatsApp | `wa.me/...`, `whatsapp` | ❌ Engellenir |
| URL | `https://...`, `www.` | ❌ Engellenir |
| Sosyal | `@instagram_user` | ❌ Engellenir |

### Platform Dışı Kaçışın Önlenmesi

Engelleme **server-side** uygulanır. Client-side bypass mümkün değildir.

Sonuç:
- Hasta ve klinik platformda kalır
- MedDiscover süreci kontrol eder
- Komisyon ve veri korunur

### Değer Zincirinin Kırılmaması

```
Lead Gelir → Eşleşir → İletişim Başlar → Tedavi Olur → Komisyon Alınır
```

Bu zincirin herhangi bir noktasında platform dışına çıkılırsa:
- Takip kaybolur
- Komisyon kaybedilir
- Kalite ölçülemez

Anti-circumvention, bu zinciri korur.

---

## 7. Neden Bu Akış MVP için Yeterli?

### Uçtan Uca Çalışıyor

```
Başvuru → İnceleme → Eşleştirme → İletişim → Kapanış
```

Tüm adımlar fonksiyonel ve test edilmiştir.

### Manuel Ama Kontrollü

- Otomasyon yok ama kaos da yok
- Admin her adımı yönetir
- Kalite manuel olarak sağlanır

### Erken Gelir ve Doğrulama İçin İdeal

- Gerçek hastalarla test edilebilir
- İlk komisyonlar alınabilir
- Ürün-pazar uyumu ölçülebilir

### Phase-2 İçin Sağlam Temel

MVP'de kurulan altyapı:
- Veri modeli hazır
- Akışlar tanımlı
- Güvenlik mekanizması aktif

Üzerine otomasyon ve AI eklenebilir.

---

## 8. Phase-2'de Akış Nasıl Genişleyecek?

### Planlanan Geliştirmeler

| Özellik | Akışa Etkisi |
|---------|--------------|
| **AI Eşleştirme** | Admin manuel seçmek yerine öneri alır |
| **Klinik Self-Panel** | Klinik kendi mesajlarını yazar |
| **Bildirimler** | Hasta ve klinik anlık haberdar olur |
| **Sigorta Paketleri** | Tedavi + sigorta birlikte sunulur |
| **TrustScore** | Eşleştirmede güven puanı kullanılır |
| **Maskeli İletişim** | Platform dışı görüşme bile kontrollü olur |

### Genişletilmiş Hasta Akışı (Phase-2)

```
Landing Page
    ↓
Lead Başvuru (çoklu dil)
    ↓
AI Öneri: "Size uygun 3 klinik"
    ↓
Hasta seçer veya Admin atar
    ↓
In-App Chat + Bildirimler
    ↓
Sigorta paketi önerisi
    ↓
Tedavi + Takip
```

### Genişletilmiş Klinik Akışı (Phase-2)

```
Klinik Self-Panel'e Giriş
    ↓
Atanan Lead'leri Görür
    ↓
Doğrudan Mesaj Yazar
    ↓
TrustScore Güncellenir
    ↓
Performans Raporu
```

---

## Özet

MedDiscover MVP, sağlık turizminde **kontrollü ve güvenli** bir akış sunar:

| Aktör | Ne Yapar? | Ne Kazanır? |
|-------|-----------|-------------|
| **Hasta** | Başvurur, mesajlaşır | Güven, basitlik |
| **Admin** | Yönetir, eşleştirir | Kontrol, görünürlük |
| **Klinik** | Platform içinde iletişim kurar | Nitelikli lead |
| **MedDiscover** | Platformu işletir | Komisyon, veri |

Anti-circumvention mekanizması sayesinde değer zinciri korunur ve platform sürdürülebilir olur.

---

*Bu doküman MedDiscover MVP v1.0 için hazırlanmıştır.*
