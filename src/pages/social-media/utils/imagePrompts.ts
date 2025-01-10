import { Platform, Orientation, GeneratedPrompts } from "../types";

const generateSystemPrompt = (platform: Platform, orientation: Orientation) => `
You are a professional image prompt engineer for Recraft.ai API v2. Create 2 variations of image generation prompts for ${platform}, considering these factors:

Orientation: ${orientation}
Guidelines for both prompts:
1. Focus on visual aesthetics that work well on ${platform}
2. Optimize composition for ${orientation} orientation
3. Include artistic style, mood, lighting, and key visual elements
4. Keep each prompt under 800 characters
5. Include specific details about colors, textures, and atmosphere
6. For social media appeal, emphasize vibrant and engaging visuals

Variations needed:
1. First prompt: Include space for text overlay, considering typical ${platform} text placement
2. Second prompt: Design without text space, focusing purely on visual impact

Return the prompts in this exact format:
[PROMPT WITH TEXT]
first prompt here

[PROMPT WITHOUT TEXT]
second prompt here`;

const generateUserPrompt = (topic: string) => `Create two prompts for: ${topic}`;

export const generateImagePrompts = async (
  platform: Platform,
  orientation: Orientation,
  topic: string
): Promise<GeneratedPrompts | null> => {
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: generateSystemPrompt(platform, orientation)
          },
          {
            role: "user",
            content: generateUserPrompt(topic)
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate prompts");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the content
    const withTextMatch = content.match(/\[PROMPT WITH TEXT\]\n(.*?)\n\n/s);
    const withoutTextMatch = content.match(/\[PROMPT WITHOUT TEXT\]\n(.*?)$/s);

    if (!withTextMatch || !withoutTextMatch) {
      throw new Error('Failed to parse GPT response');
    }

    return {
      withText: withTextMatch[1].trim(),
      withoutText: withoutTextMatch[1].trim()
    };

  } catch (error) {
    console.error("Prompt generation error:", error);
    throw error;
  }
};
