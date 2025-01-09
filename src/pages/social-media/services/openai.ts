import { SocialPlatform } from "../types";
import { generateReelsPrompt, getReelsSystemPrompt } from "../utils/reelsPrompts";

class SocialMediaAIService {
  private baseUrl = "https://api.openai.com/v1/chat/completions";
  private retryCount = 3;
  private retryDelay = 1000;

  private async makeRequest(apiKey: string, messages: any[], model: string = "gpt-4") {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const response = await fetch(this.baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 2000
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error?.message || `HTTP error ${response.status}`);
        }

        return data;

      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt < this.retryCount) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
          continue;
        }
      }
    }

    throw lastError || new Error("Failed after multiple attempts");
  }

  public async generateReelsIdeas(topic: string, apiKey: string) {
    const messages = [
      { role: "system", content: getReelsSystemPrompt() },
      { role: "user", content: generateReelsPrompt(topic) }
    ];

    try {
      // GPT-4 for high quality ideas
      const gpt4Response = await this.makeRequest(apiKey, messages, "gpt-4");
      
      // GPT-3.5 for alternative ideas
      const gpt35Response = await this.makeRequest(apiKey, messages, "gpt-3.5-turbo");

      return {
        gpt4Response: gpt4Response.choices[0].message.content,
        gpt35Response: gpt35Response.choices[0].message.content
      };

    } catch (error) {
      console.error("Failed to generate Reels ideas:", error);
      throw error;
    }
  }
}

export const socialMediaAIService = new SocialMediaAIService();
