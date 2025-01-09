import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SocialPlatform, ReelsIdea } from "../types";
import { socialMediaService } from "../services/socialMediaService";
import { parseReelsResponse } from "../utils/reelsParser";

const STORAGE_KEY = "reels_idea_history";

export const useSocialMedia = () => {
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<ReelsIdea[]>([]);
  const [ideaHistory, setIdeaHistory] = useState<ReelsIdea[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading idea history:', error);
      return [];
    }
  });
  const { toast } = useToast();

  // Fikir silme fonksiyonu
  const deleteIdea = (id: string): void => {
    console.log('Deleting idea with id:', id);
    const newHistory = ideaHistory.filter(idea => idea.id !== id);
    console.log('New history length:', newHistory.length);
    setIdeaHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      console.log('Successfully saved to localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      toast({
        title: "Hata",
        description: "Fikir silinirken bir hata oluştu",
        variant: "destructive"
      });
    }
  };

  const generateIdeas = async (platform: SocialPlatform, topic: string) => {
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
          const { gpt4Response, gpt35Response } = await socialMediaService.generateReelsIdeas(topic, apiKey);
          const newIdeas = [
            ...parseReelsResponse(gpt4Response),
            ...parseReelsResponse(gpt35Response)
          ].map(idea => ({
            ...idea,
            topic: topic.trim() // Her fikre topic bilgisini ekle
          }));
          setIdeas(newIdeas);
          
          // Yeni fikirleri geçmişe ekle
          const updatedHistory = [...newIdeas, ...ideaHistory];
          setIdeaHistory(updatedHistory);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
          } catch (error) {
            console.error('Error saving to localStorage:', error);
            toast({
              title: "Uyarı",
              description: "Fikirler geçici olarak kaydedildi fakat kalıcı olarak saklanamadı",
              variant: "destructive"
            });
          }
          
          return newIdeas;
        }
        // Add other platform cases here
        default:
          setIdeas([]);
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
    ideas,
    ideaHistory,
    generateIdeas,
    deleteIdea
  };
};
