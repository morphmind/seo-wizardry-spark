const REELS_SYSTEM_PROMPT = `Sen bir profesyonel Instagram Reels içerik üreticisi ve dil eğitim uzmanısın. Verilen konu için detaylı, net ve direkt uygulanabilir Reels fikirleri üreteceksin.

İÇERİK STANDARTLARI:
1. Her Sahne İçin Net Konuşma Metni:
   - Kelimesi kelimesine ne söyleneceği
   - Vurgular ve duraklamalar
   - Tonlama değişimleri
   - Jest ve mimik yönergeleri

2. Görsel-İşitsel Detaylar:
   - Net kamera pozisyonları ve hareketleri
   - Işık kurulumu ve ayarları
   - Ekran yazısı içeriği ve zamanlaması
   - Ses ve müzik kullanımı

3. İçerik Kriterleri:
   - Eğitici içerik eğlenceli formatta sunulmalı
   - Her bilgi somut örneklerle desteklenmeli
   - Görsel demonstrasyonlar detaylandırılmalı
   - Pratik ipuçları ve uygulamalar verilmeli

4. Teknik Zorunluluklar:
   - Her sahne için kesin süreler (saniye bazında)
   - Text yerleşimi ve animasyon detayları
   - Kullanılacak props ve materyaller
   - Çekim öncesi hazırlık listesi

5. Optimizasyon Gereklilikleri:
   - Hedef kitleye uygun dil ve ton
   - Platform trendlerine uygunluk
   - Etkileşim artırıcı unsurlar
   - Call-to-action noktaları`;

const REELS_USER_PROMPT = (topic: string) => `Konu: ${topic}

Aşağıdaki iki versiyonun her biri için detaylı ve direkt uygulanabilir bir Reels planı oluştur:

1. PROFESYONEL VERSİYON
2. VİRAL VERSİYON

Her versiyon için JSON formatında şu detayları içermelidir:

{
  "version_details": {
    "title": "Başlık",
    "duration": "Toplam süre",
    "target_audience": "Hedef kitle",
    "key_message": "Ana mesaj"
  },
  "scenes": [
    {
      "timing": {
        "start": "Başlangıç saniyesi",
        "end": "Bitiş saniyesi",
        "duration": "Süre"
      },
      "setup": {
        "location": "Çekim mekanı",
        "camera_position": "Kamera açısı ve mesafe",
        "lighting": "Işık düzeni",
        "props": ["Gerekli malzemeler"]
      },
      "content": {
        "exact_script": "Kelimesi kelimesine konuşma metni",
        "actions": ["Yapılacak hareketler"],
        "expressions": "Yüz ifadesi ve beden dili",
        "demonstrations": "Gösterilecek örnekler"
      },
      "technical": {
        "text_overlays": [
          {
            "content": "Ekran yazısı",
            "timing": "Görünme süresi",
            "position": "Konum",
            "animation": "Animasyon türü"
          }
        ],
        "effects": [
          {
            "name": "Efekt adı",
            "timing": "Kullanım anı",
            "settings": "Efekt ayarları"
          }
        ],
        "transitions": {
          "type": "Geçiş türü",
          "duration": "Geçiş süresi"
        }
      }
    }
  ],
  "audio": {
    "music": {
      "track": "Şarkı adı",
      "artist": "Sanatçı",
      "section": "Kullanılacak bölüm",
      "volume_levels": {
        "intro": "Giriş ses seviyesi",
        "background": "Arka plan ses seviyesi",
        "outro": "Kapanış ses seviyesi"
      }
    },
    "voice": {
      "tone": "Ses tonu özellikleri",
      "speed": "Konuşma hızı",
      "emphasis_points": ["Vurgulanacak noktalar"]
    }
  },
  "optimization": {
    "hashtags": ["Hashtagler"],
    "posting_time": "Yayın zamanı",
    "engagement_hooks": ["Etkileşim noktaları"]
  },
  "production_notes": {
    "equipment": ["Gerekli ekipman"],
    "preparation": ["Hazırlık adımları"],
    "post_production": ["Montaj notları"]
  }
}

Önemli Noktalar:
1. Her sahnenin tam konuşma metni olmalı
2. Tüm teknik detaylar spesifik olmalı
3. Çekim talimatları net ve uygulanabilir olmalı
4. Etkileşim noktaları belirtilmeli`;

export const getReelsPrompts = (topic: string): {
  systemPrompt: string;
  userPrompt: string;
} => ({
  systemPrompt: REELS_SYSTEM_PROMPT,
  userPrompt: REELS_USER_PROMPT(topic)
});
