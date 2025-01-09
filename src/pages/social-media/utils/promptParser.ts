import { ContentIdea } from "../types";

export const parseReelsResponse = (response: any): ContentIdea[] => {
  try {
    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response content");
    }

    // Remove code blocks if present
    const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanContent);

    const ideas: ContentIdea[] = [];

    // Parse normal version
    if (parsed.normal_version) {
      ideas.push({
        id: crypto.randomUUID(),
        title: parsed.normal_version.title,
        description: formatReelsDescription(parsed.normal_version),
        platform: "instagram_reels",
        createdAt: new Date().toISOString()
      });
    }

    // Parse viral version
    if (parsed.viral_version) {
      ideas.push({
        id: crypto.randomUUID(),
        title: parsed.viral_version.title,
        description: formatReelsDescription(parsed.viral_version),
        platform: "instagram_reels",
        createdAt: new Date().toISOString()
      });
    }

    return ideas;
  } catch (error) {
    console.error("Parse error:", error);
    return [];
  }
};

const formatReelsDescription = (version: any): string => {
  const parts = [
    `⏱️ Toplam Süre: ${version.duration}`,
    "\n🎬 Sahneler:",
    ...version.scenes.map((scene: any, index: number) => 
      `${index + 1}. (${scene.duration})\n   ${scene.description}\n   📸 ${scene.camera_angle}\n   💬 ${scene.text_overlay}`
    ),
    `\n🎵 Müzik: ${version.music.title} - ${version.music.artist}`,
    "\n✨ Efektler:",
    ...version.effects.map((effect: string) => `• ${effect}`),
    "\n🔄 Geçişler:",
    ...version.transitions.map((transition: string) => `• ${transition}`),
    "\n💡 İpuçları:",
    ...version.tips.map((tip: string) => `• ${tip}`)
  ];

  return parts.join("\n");
};
