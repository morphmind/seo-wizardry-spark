import { SocialPlatform, ImageType } from "../types";
import { generateReelsPrompt, getReelsSystemPrompt } from "../utils/reelsPrompts";

class SocialMediaService {
  private baseUrl = "https://api.openai.com/v1/chat/completions";
  private retryCount = 3;
  private retryDelay = 1000;

  private async makeRequest(apiKey: string, messages: any[], model: string = "gpt-4o") {
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
            max_tokens: 16384
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "API request failed");
        }

        return await response.json();

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
      // Get ideas from both models
      const [gpt4Response, gpt35Response] = await Promise.all([
        this.makeRequest(apiKey, messages, "gpt-4o"),
        this.makeRequest(apiKey, messages, "gpt-4o-mini")
      ]);

      return {
        gpt4Response,
        gpt35Response
      };

    } catch (error) {
      console.error("Failed to generate Reels ideas:", error);
      throw error;
    }
  }

  public async generateImage(platform: SocialPlatform, type: ImageType, prompt: string, apiKey: string) {
    // Implement image generation using Recraft.ai API
    try {
      const response = await fetch("https://api.recraft.ai/v2/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: "text, words, letters, numbers, watermark",
          model: "recraft-v2",
          width: 768,
          height: 512,
          steps: 30,
          guidance_scale: 7.5,
          seed: Math.floor(Math.random() * 1000000),
          scheduler: "dpm++2m-karras",
          num_images: 1
        })
      });

      if (!response.ok) {
        throw new Error('Image generation failed');
      }

      const data = await response.json();
      return data.images[0]?.url;

    } catch (error) {
      console.error("Failed to generate image:", error);
      throw error;
    }
  }
}

export const socialMediaService = new SocialMediaService();
