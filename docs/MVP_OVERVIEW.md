# MedDiscover MVP Overview

> Versiyon: 1.0  
> Tarih: Aralık 2025  
> Durum: MVP Tamamlandı ✓

---

## 1. MedDiscover Nedir?

MedDiscover, sağlık turizmi sektörüne odaklanan dijital bir platformdur.

Platform üç temel aktörü tek merkezde buluşturur:
- **Hasta**: Tedavi arayan uluslararası bireyler
- **Klinik**: Hizmet sunan sağlık kuruluşları
- **Operasyon**: Süreci yöneten MedDiscover ekibi

Temel akış basittir: Hasta başvurur → Admin eşleştirme yapar → Platform içinde güvenli iletişim başlar.

Bu yapı, sağlık turizminde dağınık olan süreçleri tek bir kontrol noktasında toplar.

---

## 2. Hangi Problemi Çözüyor?

Sağlık turizmi sektörü, yapısal sorunlarla karşı karşıyadır:

### Kontrolsüz İletişim
Hasta ve klinik, platform dışında iletişime geçtiğinde süreç takip edilemez hale gelir. Bu durum hem operasyonel görünürlüğü yok eder hem de güven sorunları yaratır.

### Komisyon Kaybı
Platform dışı anlaşmalar, aracı kurumların gelir modelini tehdit eder. Sektörde bu durum yaygın bir sorundur.

### Dağınık Süreçler
Lead toplama, eşleştirme, iletişim ve takip farklı araçlarda yürütüldüğünde verimlilik düşer, hatalar artar.

### Güven ve Şeffaflık Eksikliği
Hasta, klinik hakkında yeterli bilgiye ulaşamaz. Klinik, hasta ciddiyetini değerlendiremez. Aracı, sürecin neresinde olduğunu bilemez.

### Platform Dışı İletişim Riski
Telefon numarası veya e-posta paylaşıldığında platform devre dışı kalır. Bu, hem gelir kaybı hem de hasta güvenliği açısından risk oluşturur.

---

## 3. MedDiscover MVP'nin Çözümü

MVP, yukarıdaki sorunlara pratik ve ölçeklenebilir çözümler sunar:

### Merkezi Lead Toplama
Tüm hasta başvuruları tek bir noktadan alınır. GDPR/KVKK uyumlu onay mekanizması ile kişisel veriler güvenle işlenir.

### Admin Kontrollü Eşleştirme
Hasta-klinik eşleştirmesi manuel olarak admin tarafından yapılır. Bu, kalite kontrolü ve uygun eşleşme sağlar.

### In-App Chat ile İletişim Kilidi
Tüm yazışmalar platform içinde gerçekleşir. Mesajlar kayıt altındadır ve her iki taraf için şeffaftır.

### PII / İletişim Bilgisi Engelleme
Telefon numarası, e-posta, WhatsApp referansı veya URL paylaşımı sistemsel olarak engellenir. Bu engelleme server-side zorunludur, atlanamaz.

### Operasyonel Görünürlük
Admin dashboard ile tüm lead'ler, durumlar ve eşleşmeler tek ekrandan takip edilir. Filtreleme ve raporlama mümkündür.

---

## 4. MVP Kapsamı (Freeze Edilen)

Aşağıdaki modüller tamamlanmış, test edilmiş ve kilitlenmiştir:

| Modül | Açıklama | Durum |
|-------|----------|-------|
| **M01** | Lead Başvuru Formu (GDPR onaylı) | ✓ PASS |
| **M02** | Lead Yönetimi (durum, notlar) | ✓ PASS |
| **M03** | Klinik / Tedavi Eşleştirme | ✓ PASS |
| **M04** | Admin Dashboard (özet, filtre, liste) | ✓ PASS |
| **M06** | In-App Chat & Anti-Circumvention | ✓ PASS |

Her modül için fonksiyonel testler yapılmış, temel akışlar doğrulanmıştır.

---

## 5. Bilinçli Olarak MVP Dışında Bırakılanlar

Aşağıdaki özellikler kasıtlı olarak MVP kapsamına alınmamıştır:

- **Otomatik AI Eşleştirme**: Manuel eşleştirme yeterli ve kontrollü
- **Klinik Self-Panel**: Admin merkezli operasyon tercih edildi
- **Gerçek Zamanlı Bildirimler**: Sayfa yenileme ile çözüm yeterli
- **Ödeme & Sigorta Entegrasyonu**: Ayrı bir iş modeli kararı gerektirir
- **SEO / Sitemap**: Pazarlama fazında ele alınacak

Bu kararlar hız, odak ve erken doğrulama için bilinçli olarak alınmıştır. MVP'nin amacı her şeyi yapmak değil, çekirdek değeri kanıtlamaktır.

---

## 6. Güven, Gizlilik ve Uyum

MedDiscover, kişisel veri güvenliğini öncelikli tutar:

### GDPR / KVKK Uyumu
- Başvuru sırasında açık onay alınır
- Sadece gerekli veriler toplanır
- Veriler güvenli ortamda saklanır

### PII Koruma Mekanizması
- E-posta, telefon, WhatsApp, URL paylaşımı engellenir
- Engelleme server-side'da uygulanır
- Client-side bypass mümkün değildir

### Platform İçi İletişim
- Tüm mesajlar kayıt altındadır
- Her iki taraf için şeffaflık sağlanır
- Audit trail mevcuttur

---

## 7. MVP'nin Hazır Sayılma Kriterleri

MVP'nin tamamlandığını gösteren kriterler:

### ✓ Uçtan Uca Çalışan Kullanıcı Akışı
Hasta başvuru yapar → Lead sisteme düşer → Admin eşleştirme yapar → Chat başlar → Süreç takip edilir.

### ✓ Admin Operasyonlarının Tamamlanmış Olması
Lead listesi, detay görünümü, durum güncelleme, eşleştirme ve mesajlaşma fonksiyonları çalışır durumdadır.

### ✓ Anti-Circumvention Mekanizmasının Aktif Olması
PII engelleme server-side'da zorunlu ve aktiftir. Platform dışı iletişim girişimleri bloklanır.

### ✓ Manuel Operasyonla Ölçeklenebilir Yapı
Sistem, admin ekibi tarafından yönetilebilir yapıdadır. Otomasyon olmadan da operasyon yürütülebilir.

---

## 8. Bir Sonraki Aşama (Phase-2)

MVP sonrası planlanan geliştirmeler:

| Özellik | Açıklama |
|---------|----------|
| **TrustScore Sistemi** | Klinik ve hasta için güven puanlaması |
| **AI Destekli Eşleştirme** | Hasta profili ve klinik kapasitesine göre öneri |
| **Sigorta Paketli Tedaviler** | Entegre sigorta ürünleri |
| **Maskeli İletişim** | Gerçek iletişim bilgisi paylaşmadan telefon görüşmesi |
| **Çoklu Dil / Ülke** | Almanca, İngilizce, Arapça desteği |

Bu özellikler, MVP'nin pazar doğrulaması sonrasında değerlendirilecektir.

---

## Sonuç

MedDiscover MVP, sağlık turizminde merkezi kontrol ve güvenli iletişim sağlayan çalışır bir üründür.

- Problem tanımlıdır
- Çözüm uygulanmıştır
- Temel akış test edilmiştir
- Operasyon başlatılabilir durumdadır

MVP, "mükemmel" değil "yeterli ve doğrulanabilir" olmak üzere tasarlanmıştır. Bir sonraki adım, gerçek kullanıcılarla bu değer önerisini test etmektir.

---

*Bu doküman MedDiscover MVP v1.0 için hazırlanmıştır.*
