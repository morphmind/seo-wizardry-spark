import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Platform, Orientation, GeneratedPrompts, GeneratedImage, HistoryItem } from "../types";
import { generateImagePrompts } from "../utils/imagePrompts";
import { imageService } from "../services/imageService";

const HISTORY_KEY = "image_history";

export const useImageCreator = () => {
  const [loading, setLoading] = useState(false);
  const [loadingPromptId, setLoadingPromptId] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<GeneratedPrompts | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [currentOrientation, setCurrentOrientation] = useState<Orientation>("horizontal");
  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { toast } = useToast();

  const saveToHistory = useCallback((promptText: string, newUrls: string[]) => {
    setHistory(prev => {
      const now = new Date().toISOString();
      const newImages: GeneratedImage[] = newUrls.map(url => ({
        id: crypto.randomUUID(),
        url,
        prompt: promptText,
        createdAt: now
      }));

      // Aynı topic için mevcut bir history item var mı kontrol et
      const existingTopicIndex = prev.findIndex(item => item.topic.toLowerCase() === currentTopic.toLowerCase());

      let newHistory;
      if (existingTopicIndex >= 0) {
        // Varsa, mevcut history item'a yeni görselleri ekle
        newHistory = [...prev];
        newHistory[existingTopicIndex] = {
          ...newHistory[existingTopicIndex],
          images: [...(newHistory[existingTopicIndex].images || []), ...newImages],
          updatedAt: now
        };
      } else {
        // Yoksa, yeni bir history item oluştur
        const newItem: HistoryItem = {
          id: crypto.randomUUID(),
          topic: currentTopic,
          images: newImages,
          createdAt: now,
          updatedAt: now
        };
        newHistory = [newItem, ...prev];
      }

      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('LocalStorage kayıt hatası:', error);
      }
      return newHistory;
    });
  }, [currentTopic]);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const newHistory = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error('LocalStorage güncelleme hatası:', error);
      }
      return newHistory;
    });
  }, []);

  const generatePrompts = async (
    platform: Platform,
    orientation: Orientation,
    topic: string
  ) => {
    setLoading(true);
    setCurrentOrientation(orientation);
    setCurrentTopic(topic);
    try {
      const generatedPrompts = await generateImagePrompts(platform, orientation, topic);
      if (generatedPrompts) {
        setPrompts(generatedPrompts);
        setImageUrls([]);
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Promptlar oluşturulamadı",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateImages = async (promptId: string, promptText: string) => {
    if (loadingPromptId) return;
    
    setLoadingPromptId(promptId);
    setImageUrls([]);

    try {
      const urls = await imageService.generateImages(promptText, currentOrientation);
      setImageUrls(urls);
      
      saveToHistory(promptText, urls);

      toast({
        description: "Görseller başarıyla oluşturuldu"
      });

    } catch (error) {
      toast({ 
        title: "Hata",
        description: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoadingPromptId(null);
    }
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast({
        description: "Görsel başarıyla indirildi"
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görsel indirilemedi",
        variant: "destructive"
      });
    }
  };

  return {
    loading,
    loadingPromptId,
    prompts,
    imageUrls,
    history,
    generatePrompts,
    generateImages,
    downloadImage,
    deleteFromHistory
  };
};
