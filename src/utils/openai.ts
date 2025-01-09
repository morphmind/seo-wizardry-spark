import { toast } from "@/hooks/use-toast";

interface IdeaResult {
    title: string;
    description: string;
}

interface OpenAIConfig {
    apiKey: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
}

class OpenAIService {
    private baseUrl = "https://api.openai.com/v1/chat/completions";
    private retryCount = 3;
    private retryDelay = 1000;

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

                if (response.status === 400) {
                    const errorData = await response.json();
                    throw new Error(errorData?.error?.message || "HTTP 400 Bad Request");
                }

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error?.message || `HTTP error ${response.status}`);
                }

                return data;

            } catch (error) {
                lastError = error as Error;
                console.error(`Attempt ${attempt} failed for ${config.model}:`, error);

                if (attempt < this.retryCount) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                    continue;
                }
            }
        }

        throw lastError || new Error("Failed after multiple attempts");
    }

    public async generateIdeas(
        topic: string,
        apiKey: string
    ): Promise<{
        gpt4Ideas: IdeaResult[];
        gptMiniIdeas: IdeaResult[];
    }> {
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

            try {
                const gpt4Response = await this.makeRequest({
                    apiKey,
                    model: "gpt-4o-mini",
                    temperature: 0.7
                }, messages);

                gpt4Ideas = this.parseIdeas(gpt4Response);
            } catch (err) {
                console.error("GPT-4 request failed:", err);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                const gptMiniResponse = await this.makeRequest({
                    apiKey,
                    model: "gpt-4",
                    temperature: 0.9,
                    maxTokens: 1000
                }, messages);

                gptMiniIdeas = this.parseIdeas(gptMiniResponse);
            } catch (err) {
                console.error("GPT-Mini request failed:", err);
            }

            if (!gpt4Ideas.length && !gptMiniIdeas.length) {
                throw new Error("No valid ideas generated from either model");
            }

            return { gpt4Ideas, gptMiniIdeas };

        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    private parseIdeas(response: any): IdeaResult[] {
        try {
            const content = response?.choices?.[0]?.message?.content;
            if (!content) {
                console.error("Empty response content");
                return [];
            }

            const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
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

export const openAIService = new OpenAIService();