import { Platform, Orientation, GeneratedPrompts } from "../types";

const generateBasePrompt = (topic: string, platform: Platform, orientation: Orientation) => {
  const orientationText = orientation === "vertical" ? "vertical composition" : "horizontal composition";
  return `Create a visually striking and professional ${platform}-optimized image for the following topic: "${topic}".

Key requirements:
- Optimize for ${orientationText}
- Create a high-impact, attention-grabbing visual
- Ensure professional quality and brand-appropriate aesthetics
- Use relevant color schemes and visual elements
- Focus on the core message and visual storytelling
- Maintain platform-specific best practices for ${platform}`;
};

export const generateImagePrompts = async (
  platform: Platform,
  orientation: Orientation,
  topic: string
): Promise<GeneratedPrompts> => {
  const basePrompt = generateBasePrompt(topic, platform, orientation);
  
  const withTextPrompt = `${basePrompt}

Additional requirements for version with text:
- Include clear space for text overlay
- Balance visual elements with text placement
- Ensure readability and contrast for text areas
- Create visual hierarchy that supports text integration

Describe the image in detail, focusing on:
1. Main subject and composition
2. Color palette and mood
3. Lighting and atmosphere
4. Specific visual elements and their arrangement
5. Text placement considerations`;

  const withoutTextPrompt = `${basePrompt}

Create a standalone visual that needs no text to convey the message:
1. Focus on creating a clear, immediate visual impact
2. Use symbolic and representative elements
3. Ensure the core message is conveyed purely through visuals
4. Create a cohesive and balanced composition
5. Emphasize storytelling through imagery alone

Describe the image in detail, focusing on:
1. Main subject and focal points
2. Visual symbolism and metaphors
3. Color psychology and emotional impact
4. Composition and visual flow
5. Lighting and atmospheric elements`;

  try {
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional image prompt engineer specializing in creating detailed, platform-optimized visual prompts for social media content."
          },
          {
            role: "user",
            content: withTextPrompt
          },
          {
            role: "user",
            content: withoutTextPrompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate prompts");
    }

    const data = await response.json();
    const [withText, withoutText] = data.choices.map((choice: any) => choice.message.content.trim());

    return {
      withText,
      withoutText
    };
  } catch (error) {
    console.error("Error generating prompts:", error);
    throw error;
  }
};