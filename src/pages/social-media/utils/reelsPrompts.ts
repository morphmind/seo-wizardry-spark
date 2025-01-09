import { SocialPlatform } from "../types";

interface ReelsPromptConfig {
  systemPrompt: string;
  userPromptTemplate: string;
}

const REELS_PROMPT_CONFIG: ReelsPromptConfig = {
  systemPrompt: `Sen bir sosyal medya içerik uzmanısın. Instagram Reels videoları için detaylı, net ve uygulanabilir fikirler üretiyorsun.

Önemli Kurallar:
1. Her fikir maksimum 59 saniyelik bir video için olmalı
2. Fikirler genel değil, konuya özel ve direkt uygulanabilir olmalı
3. Her fikir için sahne sahne çekim planı ver
4. Her fikir için uygun müzik önerisi yap (gerçek şarkı adı ve sanatçı)
5. Çekim açıları ve teknik detaylar ekle
6. Kullanılacak efekt ve geçiş önerileri ekle
7. Konuşma/yazı yerleşimi için zaman önerileri ver`,

  userPromptTemplate: `Konu: {topic}

Bana bu konuyla ilgili iki farklı Reels fikri üret:
1. Normal, bilgilendirici bir versiyon
2. Dikkat çekici, viral olabilecek bir versiyon

Her fikir için şu detayları ver:
- Video Başlığı
- Toplam Süre (max 59 saniye)
- Sahneler ve Süreleri
- Çekim Açıları
- Müzik Önerisi (gerçek şarkı)
- Efektler ve Geçişler
- Konuşma/Yazı Yerleşimi
- Çekim İpuçları

Yanıt formatı JSON olmalı:
{
  "normal_version": {
    "title": "başlık",
    "duration": "toplam süre",
    "scenes": [
      {
        "duration": "sahne süresi",
        "description": "sahne açıklaması",
        "camera_angle": "çekim açısı",
        "text_overlay": "ekran yazısı ve zamanı"
      }
    ],
    "music": {
      "title": "şarkı adı",
      "artist": "sanatçı"
    },
    "effects": ["efekt1", "efekt2"],
    "transitions": ["geçiş1", "geçiş2"],
    "tips": ["ipucu1", "ipucu2"]
  },
  "viral_version": {
    // Aynı yapı
  }
}`
};

export const generateReelsPrompt = (topic: string): string => {
  return REELS_PROMPT_CONFIG.userPromptTemplate.replace("{topic}", topic);
};

export const getReelsSystemPrompt = (): string => {
  return REELS_PROMPT_CONFIG.systemPrompt;
};
