import { toast } from "@/hooks/use-toast";

interface IdeaResult {
    title: string;
    description: string;
}

interface OpenAIConfig {
    apiKey: string;
    model: string;         // Örn: "gpt-3.5-turbo" veya "gpt-4"
    temperature?: number;
    maxTokens?: number;
}

class OpenAIService {
    private baseUrl = "https://api.openai.com/v1/chat/completions";

    // Maksimum 3 deneme
    private retryCount = 3;

    // Denemeler arası bekleme süresi (ms)
    private retryDelay = 1000;

    /**
     * makeRequest:
     *  - Tek seferde response.json() okur (body stream already read hatasını önler).
     *  - 400 durumunda tekrar deneme yapmaz.
     */
    private async makeRequest(config: OpenAIConfig, messages: any[]): Promise<any> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                const response = await fetch(this.baseUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify({
                        model: config.model,
                        messages,
                        temperature: config.temperature ?? 0.7,
                        max_tokens: config.maxTokens ?? 2000
                    })
                });

                // Eğer 400 ise, genellikle parametre veya model adı hatası
                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData?.error?.message || "HTTP 400 Bad Request");
                }

                // 400 harici durumlar veya başarılı dönmesi
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error?.message || `HTTP error ${response.status}`);
                }

                // Başarılı yanıt
                return data;

            } catch (error) {
                // Hata yakalandı
                lastError = error as Error;
                console.error(`Attempt ${attempt} failed for ${config.model}:`, error);

                // 400'te de buraya düşer ama yukarıda throw ettiğimiz için normalde retry'a girmeyecek
                // 400 harici bir hata veya network hatası söz konusuysa tekrar denemek anlamlı olabilir
                if (attempt < this.retryCount) {
                    // Deneme arası bekleme
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                    continue;
                }
            }
        }

        // Tüm denemeler başarısız oldu
        throw lastError || new Error("Failed after multiple attempts");
    }

    /**
     * generateIdeas:
     *  - İki farklı modele (örnek: GPT-4, GPT-3.5) sırasıyla istek gönderir.
     *  - Her ikisinin çıktısını IdeaResult[] şeklinde döndürür.
     *  - Eğer iki modelden de sonuç çıkmazsa hata fırlatır.
     */
    public async generateIdeas(
        topic: string,
        apiKey: string
    ): Promise<{
        gpt4Ideas: IdeaResult[];
        gptMiniIdeas: IdeaResult[];
    }> {
        // Örnek system ve user prompt'lar
        const systemPrompt = 
            "Sen bir SEO ve içerik uzmanısın. Verilen konuyla ilgili ilgi çekici, " +
            "SEO dostu ve özgün blog başlıkları üretmelisin. Her başlık için kısa " +
            "bir açıklama da ekle.";

        const userPrompt = 
            `Konu: ${topic}\n\n` +
            "Bu konuyla ilgili 5 adet blog yazısı başlığı üret. " +
            "Her başlık için 1-2 cümlelik açıklama ekle. Başlıklar SEO dostu ve ilgi çekici olmalı. " +
            'Yanıt formatı JSON olmalı: { "ideas": [{ "title": "başlık", "description": "açıklama" }] }';

        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ];

        try {
            let gpt4Ideas: IdeaResult[] = [];
            let gptMiniIdeas: IdeaResult[] = [];

            // 1) GPT-4 benzeri model
            try {
                const gpt4Response = await this.makeRequest({
                    apiKey,
                    model: "gpt-4o-mini",  // buraya geçerli model adını yazın
                    temperature: 0.7
                }, messages);

                gpt4Ideas = this.parseIdeas(gpt4Response);
            } catch (err) {
                console.error("GPT-4 request failed:", err);
            }

            // 1 saniye gecikme (opsiyonel)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 2) o1-mini benzeri model
            try {
                const gptMiniResponse = await this.makeRequest({
                    apiKey,
                    model: "gpt-4",  // buraya geçerli model adını yazın
                    temperature: 0.9,
                    maxTokens: 1000
                }, messages);

                gptMiniIdeas = this.parseIdeas(gptMiniResponse);
            } catch (err) {
                console.error("GPT-Mini request failed:", err);
            }

            // İki modelden de sonuç yoksa
            if (!gpt4Ideas.length && !gptMiniIdeas.length) {
                throw new Error("No valid ideas generated from either model");
            }

            return { gpt4Ideas, gptMiniIdeas };

        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    /**
     * parseIdeas:
     *  - API yanıtında choices[0].message.content içerisindeki JSON'u parse eder.
     *  - "```json" gibi kod bloklarını temizleyip geriye ideas dizisini IdeaResult olarak döndürür.
     */
    private parseIdeas(response: any): IdeaResult[] {
        try {
            const content = response?.choices?.[0]?.message?.content;
            if (!content) {
                console.error("Empty response content");
                return [];
            }

            // Kod bloklarını temizle
            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();

            // JSON.parse
            const parsed = JSON.parse(cleanContent);

            if (!parsed?.ideas?.length) {
                console.error("No ideas found in response");
                return [];
            }

            return parsed.ideas
                .map((idea: any) => ({
                    title: idea.title?.trim() || "",
                    description: idea.description?.trim() || ""
                }))
                .filter(idea => idea.title && idea.description);

        } catch (error) {
            console.error("Parse error:", error);
            return [];
        }
    }
}

// Tek bir instance
export const openAIService = new OpenAIService();
