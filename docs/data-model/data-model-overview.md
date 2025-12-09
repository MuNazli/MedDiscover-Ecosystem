# Veri Modeli Genel Bakışı

Veri modeli `meddiscover-data/schema` altında bulunan JSON Schema dosyaları ile tanımlanır. Başlıca varlıklar:
- Klinik (`clinic`)
- Doktor (`doctor`)
- Tedavi (`treatment`)

Tüm varlıklarda ID'ler tutarlı bir adlandırma kuralı izler (ör. `CLN_TR_IST_0001`, `DOC_TR_IST_0001`, `TRT_0001`) ve hem API hem de istemci uygulamaları bu desenlere güvenebilir.
