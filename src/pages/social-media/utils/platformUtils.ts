import { PlatformConfig, SocialPlatform } from "../types";

export const PLATFORMS = [
  { id: "instagram", name: "Instagram" },
  { id: "twitter", name: "Twitter" },
  { id: "facebook", name: "Facebook" },
  { id: "linkedin", name: "LinkedIn" },
  { id: "whatsapp", name: "WhatsApp" }
];

export const PLATFORM_CONFIGS: Record<Platform, PlatformConfig> = {
  instagram_reels: {
    id: "instagram_reels",
    name: "Instagram Reels",
    description: "Kısa form video içerikleri",
    imageTypes: ["post"],
    imageSize: {
      width: 1080,
      height: 1920
    }
  },
  instagram_story: {
    id: "instagram_story",
    name: "Instagram Story",
    description: "24 saat görüntülenebilen içerikler",
    imageTypes: ["story"],
    imageSize: {
      width: 1080,
      height: 1920
    }
  },
  instagram_post: {
    id: "instagram_post",
    name: "Instagram Post",
    description: "Feed'de görünen kalıcı içerikler",
    imageTypes: ["post"],
    imageSize: {
      width: 1080,
      height: 1080
    }
  },
  twitter: {
    id: "twitter",
    name: "Twitter",
    description: "Tweet ve görseller",
    imageTypes: ["post"],
    maxCharacters: 280,
    imageSize: {
      width: 1200,
      height: 675
    }
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    description: "Profesyonel içerikler",
    imageTypes: ["post"],
    maxCharacters: 3000,
    imageSize: {
      width: 1200,
      height: 627
    }
  }
};
