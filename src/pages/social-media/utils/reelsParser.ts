import { ReelsIdea, ReelsResponse, ContentType } from "../types";

const cleanJsonString = (str: string): string => {
  // Önce JSON blok işaretlerini kaldır
  let cleaned = str.replace(/```json\n?|\n?```/g, "");
  
  // Yorum satırlarını kaldır
  cleaned = cleaned.split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n');

  // Fazladan boşlukları temizle
  cleaned = cleaned.trim();

  // Olası hatalı karakterleri düzelt
  cleaned = cleaned
    .replace(/[\u2018\u2019]/g, "'") // Akıllı tırnakları düz tırnaklarla değiştir
    .replace(/[\u201C\u201D]/g, '"') // Akıllı çift tırnakları düz çift tırnaklarla değiştir
    .replace(/\n/g, ' ') // Yeni satırları boşluklarla değiştir
    .replace(/\s+/g, ' '); // Birden fazla boşluğu tek boşluğa indir

  return cleaned;
};

export const parseReelsResponse = (response: any): ReelsIdea[] => {
  try {
    const content = response?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response content");
    }

    console.log("Raw content:", content); // Debug için

    // JSON'u temizle
    const cleanContent = cleanJsonString(content);
    console.log("Cleaned content:", cleanContent); // Debug için

    let parsed: ReelsResponse;
    try {
      parsed = JSON.parse(cleanContent) as ReelsResponse;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.log("Failed content:", cleanContent);
      throw new Error("Invalid JSON format in API response");
    }

    const ideas: ReelsIdea[] = [];

    // Normal versiyon ekle
    if (parsed.normal_version) {
      try {
        ideas.push(createReelsIdea(parsed.normal_version, "normal"));
      } catch (error) {
        console.error("Error creating normal version:", error);
      }
    }

    // Viral versiyon ekle
    if (parsed.viral_version) {
      try {
        ideas.push(createReelsIdea(parsed.viral_version, "viral"));
      } catch (error) {
        console.error("Error creating viral version:", error);
      }
    }

    return ideas;
  } catch (error) {
    console.error("Parse error:", error);
    console.log("Response:", response);
    return [];
  }
};

const createReelsIdea = (version: any, type: ContentType): ReelsIdea => {
  if (!version || typeof version !== 'object') {
    throw new Error(`Invalid version data for ${type}`);
  }

  // Gerekli alanları kontrol et
  const requiredFields = ['title', 'duration', 'scenes', 'music', 'effects', 'transitions', 'tips'];
  for (const field of requiredFields) {
    if (!(field in version)) {
      throw new Error(`Missing required field: ${field} in ${type} version`);
    }
  }

  // scenes array kontrolü
  if (!Array.isArray(version.scenes)) {
    throw new Error(`Invalid scenes data in ${type} version`);
  }

  // Her sahneyi doğrula
  version.scenes.forEach((scene: any, index: number) => {
    const requiredSceneFields = ['duration', 'description', 'camera_angle', 'text_overlay'];
    for (const field of requiredSceneFields) {
      if (!(field in scene)) {
        throw new Error(`Missing required field: ${field} in scene ${index} of ${type} version`);
      }
    }
  });

  return {
    id: crypto.randomUUID(),
    title: String(version.title),
    type,
    duration: String(version.duration),
    scenes: version.scenes.map((scene: any) => ({
      duration: String(scene.duration),
      description: String(scene.description),
      cameraAngle: String(scene.camera_angle),
      textOverlay: String(scene.text_overlay)
    })),
    music: {
      title: String(version.music.title),
      artist: String(version.music.artist)
    },
    effects: Array.isArray(version.effects) ? version.effects.map(String) : [],
    transitions: Array.isArray(version.transitions) ? version.transitions.map(String) : [],
    tips: Array.isArray(version.tips) ? version.tips.map(String) : [],
    createdAt: new Date().toISOString()
  };
};
