import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SocialPlatform, ContentIdea } from "../types";
import { socialMediaAIService } from "../services/openai";
import { parseReelsResponse } from "../utils/promptParser";
import { v4 as uuidv4 } from 'uuid';

export const useSocialMediaAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateIdeas = async (platform: SocialPlatform, topic: string): Promise<ContentIdea[]> => {
    if (!topic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return [];
    }

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "API Anahtarı Gerekli",
        description: "Lütfen OpenAI API anahtarınızı ayarlarda belirtin",
        variant: "destructive"
      });
      return [];
    }

    setLoading(true);
    try {
      switch (platform) {
        case "instagram_reels": {
          const { gpt4Response, gpt35Response } = await socialMediaAIService.generateReelsIdeas(topic, apiKey);
          const ideas = [
            ...parseReelsResponse(gpt4Response),
            ...parseReelsResponse(gpt35Response)
          ];
          return ideas;
        }
        // Add other platforms here
        default:
          return [];
      }
    } catch (error) {
      console.error("Content generation error:", error);
      toast({
        title: "Hata",
        description: "İçerik fikirleri üretilirken bir hata oluştu",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateIdeas
  };
};
