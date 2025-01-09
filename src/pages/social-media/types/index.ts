export type SocialPlatform = 
  | "instagram_reels"
  | "instagram_story" 
  | "instagram_post"
  | "twitter"
  | "linkedin";

export type ContentType = "normal" | "viral";

export interface ReelsIdea {
  id: string;
  title: string;
  topic: string;
  type: ContentType;
  duration: string;
  scenes: Scene[];
  music: Music;
  effects: string[];
  transitions: string[];
  tips: string[];
  createdAt: string;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
}

export interface Scene {
  duration: string;
  description: string;
  cameraAngle: string;
  textOverlay: string;
}

export interface Music {
  title: string;
  artist: string;
}

export interface ReelsResponse {
  normal_version: ReelsVersion;
  viral_version: ReelsVersion;
}

interface ReelsVersion {
  title: string;
  duration: string;
  scenes: Scene[];
  music: Music;
  effects: string[];
  transitions: string[];
  tips: string[];
}
