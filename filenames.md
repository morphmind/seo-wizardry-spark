# AI Genius - Proje Dosya Yapısı

## Kök Dizin Dosyaları

- `.env.development` - Geliştirme ortamı için ortam değişkenleri
- `components.json` - UI bileşenleri için yapılandırma dosyası
- `eslint.config.js` - ESLint yapılandırması
- `index.html` - Ana HTML dosyası
- `package.json` - Proje bağımlılıkları ve komutları
- `postcss.config.js` - PostCSS yapılandırması
- `README.md` - Proje dokümantasyonu
- `tailwind.config.ts` - Tailwind CSS yapılandırması
- `tsconfig.json` - TypeScript ana yapılandırması
- `tsconfig.app.json` - Uygulama için TypeScript yapılandırması
- `tsconfig.node.json` - Node.js için TypeScript yapılandırması
- `vite.config.ts` - Vite yapılandırması

## /src Dizini

### Ana Dosyalar
- `App.css` - Ana uygulama stilleri
- `App.tsx` - Ana uygulama bileşeni
- `index.css` - Global stiller
- `main.tsx` - Uygulama giriş noktası
- `vite-env.d.ts` - Vite tip tanımlamaları

### /components Dizini
UI bileşenleri içerir:

- `/ui` - Temel UI bileşenleri (button, card, dialog vb.)
- `ContentDisplay.tsx` - İçerik görüntüleme bileşeni
- `ContentGenerator.tsx` - İçerik oluşturma bileşeni
- `ImagePromptGenerator.tsx` - Görsel prompt oluşturucu
- `InternalLinkGenerator.tsx` - İç bağlantı oluşturucu
- `LoginForm.tsx` - Giriş formu
- `ModelSelector.tsx` - AI model seçici
- `PasswordManager.tsx` - Şifre yönetimi
- `PaymentCheck.tsx` - Ödeme kontrolü
- `ProtectedRoute.tsx` - Korumalı rotalar
- `SettingsPasswordForm.tsx` - Ayarlar şifre formu
- `theme-provider.tsx` - Tema sağlayıcı

### /contexts Dizini
React context'leri:

- `AuthContext.tsx` - Kimlik doğrulama context'i

### /hooks Dizini
Özel React hook'ları:

- `use-mobile.tsx` - Mobil cihaz kontrolü
- `use-toast.ts` - Bildirim sistemi

### /lib Dizini
Yardımcı kütüphaneler:

- `countries.ts` - Ülke listesi
- `languages.ts` - Dil listesi
- `utils.ts` - Genel yardımcı fonksiyonlar

### /pages Dizini
Uygulama sayfaları:

#### /content-writer
İçerik yazma araçları:
- `/components` - İçerik yazma bileşenleri
- `/hooks` - İçerik yazma hook'ları
- `/types` - Tip tanımlamaları
- `index.tsx` - Ana içerik yazma sayfası

#### /social-media
Sosyal medya araçları:
- `/components` - Sosyal medya bileşenleri
- `/hooks` - Sosyal medya hook'ları
- `/services` - API servisleri
- `/types` - Tip tanımlamaları
- `/utils` - Yardımcı fonksiyonlar
- `index.tsx` - Ana sosyal medya sayfası

### /python Dizini
Python entegrasyonu:

- `api_key_manager.py` - API anahtar yönetimi
- `internal_linking_system.py` - İç bağlantı sistemi

### /services Dizini
API servisleri:

- `openai.ts` - OpenAI API entegrasyonu

### /types Dizini
Tip tanımlamaları:

- `content.ts` - İçerik tipleri
- `pdf.ts` - PDF tipleri
- `present.ts` - Sunum tipleri
- `string-similarity.d.ts` - String benzerlik tipleri

### /utils Dizini
Yardımcı fonksiyonlar:

- `/internal-linking` - İç bağlantı yardımcıları
- `apiStorage.ts` - API depolama
- `auth.ts` - Kimlik doğrulama
- `openai.ts` - OpenAI yardımcıları
- `passwordStore.ts` - Şifre depolama
- `pdfUtils.ts` - PDF işlemleri
- `presents.ts` - Sunum yardımcıları
- `prompts.ts` - AI prompt'ları
- `secureStorage.ts` - Güvenli depolama
- `sitemapParser.ts` - Sitemap ayrıştırma
- `urlAnalyzer.ts` - URL analizi

## Önemli Bileşenler ve İşlevleri

### İçerik Üretimi
- `ContentGenerator.tsx` - Ana içerik üretme bileşeni
- `ContentDisplay.tsx` - Üretilen içeriği görüntüleme
- `ImagePromptGenerator.tsx` - Görsel prompt oluşturma

### Güvenlik
- `AuthContext.tsx` - Kimlik doğrulama yönetimi
- `PasswordManager.tsx` - Şifre yönetimi
- `secureStorage.ts` - Güvenli veri depolama

### SEO ve Analiz
- `urlAnalyzer.ts` - URL analizi
- `sitemapParser.ts` - Sitemap işleme
- `internal-linking` - İç bağlantı yönetimi

### UI/UX
- `/ui` dizini - Temel UI bileşenleri
- `theme-provider.tsx` - Tema yönetimi
- `use-toast.ts` - Bildirim sistemi

### API Entegrasyonları
- `openai.ts` - OpenAI API entegrasyonu
- `apiStorage.ts` - API anahtar yönetimi

Bu yapı, geliştiricilerin projenin farklı bölümlerini kolayca bulmasını ve değiştirmesini sağlar. Her dizin ve dosya belirli bir sorumluluğa sahiptir ve modüler bir yapı oluşturur.
