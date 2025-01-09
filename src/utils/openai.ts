import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IdeaHistory } from "./IdeaHistory";
import { generateContentIdeasPDF } from "@/utils/pdfUtils";
import { generateIdeasWithOpenAI } from "@/services/openai";
import { v4 as uuidv4 } from 'uuid';

interface IdeaResult {
  title: string;
  description: string;
}

interface AIResponse {
  gpt4Ideas: IdeaResult[];
  gptMiniIdeas: IdeaResult[];
}

interface IdeaHistoryItem {
  id: string;
  topic: string;
  date: string;
  gpt4Ideas: IdeaResult[];
  gptMiniIdeas: IdeaResult[];
}

const ContentIdeas = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AIResponse | null>(null);
  const [ideas, setIdeas] = useState<IdeaHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("idea_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const { toast } = useToast();

  const handleSaveToHistory = (gpt4Ideas: IdeaResult[], gptMiniIdeas: IdeaResult[]) => {
    const newIdea: IdeaHistoryItem = {
      id: uuidv4(),
      topic,
      date: new Date().toISOString(),
      gpt4Ideas,
      gptMiniIdeas
    };

    const newIdeas = [newIdea, ...ideas];
    setIdeas(newIdeas);
    try {
      localStorage.setItem("idea_history", JSON.stringify(newIdeas));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        const reducedIdeas = newIdeas.slice(0, -1);
        localStorage.setItem("idea_history", JSON.stringify(reducedIdeas));
        setIdeas(reducedIdeas);
      }
    }
  };

  const handleDeleteFromHistory = (id: string) => {
    const newIdeas = ideas.filter(idea => idea.id !== id);
    setIdeas(newIdeas);
    try {
      localStorage.setItem("idea_history", JSON.stringify(newIdeas));
    } catch (error) {
      console.error('Failed to update localStorage:', error);
    }
  };

  const copyToClipboard = (title: string, description: string) => {
    try {
      const text = `${title}\n\n${description}`;
      const el = document.createElement('div');
      el.setAttribute('contenteditable', 'true');
      el.innerHTML = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected = document.getSelection();
      const range = document.createRange();
      range.selectNodeContents(el);
      selected?.removeAllRanges();
      selected?.addRange(range);
      document.execCommand('copy');
      document.body.removeChild(el);
      
      toast({
        description: "İçerik kopyalandı",
      });
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toast({
        title: "Hata",
        description: "Manuel olarak seçip kopyalayınız",
        variant: "destructive"
      });
    }
  };

  const handleGeneratePDF = () => {
    if (!results) return;

    const pdfContent = {
      topic,
      gpt4Ideas: results.gpt4Ideas,
      gptMiniIdeas: results.gptMiniIdeas
    };

    try {
      const pdf = generateContentIdeasPDF(pdfContent);
      const safeFileName = topic
        .toLowerCase()
        .replace(/[çÇ]/g, 'c')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[ıİ]/g, 'i')
        .replace(/[öÖ]/g, 'o')
        .replace(/[şŞ]/g, 's')
        .replace(/[üÜ]/g, 'u')
        .replace(/[^a-z0-9]+/g, '_')
        .trim();
      
      pdf.save(`Oneriler_Raporu_${safeFileName}.pdf`);

      toast({
        description: "PDF başarıyla indirildi"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulurken bir hata oluştu",
        variant: "destructive"
      });
    }
  };

  const generateIdeas = async () => {
    if (!topic.trim()) {
      toast({
        title: "Konu Gerekli",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return;
    }

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      toast({
        title: "API Anahtarı Eksik",
        description: "Lütfen OpenAI API anahtarınızı ayarlarda belirtin",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { gpt4Ideas, gptMiniIdeas } = await generateIdeasWithOpenAI(topic, apiKey);

      const newResults = { gpt4Ideas, gptMiniIdeas };

      // Only update state and save to history if we have valid results
      if (gpt4Ideas.length > 0 || gptMiniIdeas.length > 0) {
        setResults(newResults);
        handleSaveToHistory(gpt4Ideas, gptMiniIdeas);
        toast({
          description: "İçerik fikirleri başarıyla oluşturuldu"
        });
      } else {
        toast({
          title: "Uyarı",
          description: "İçerik fikirleri oluşturulamadı. Lütfen tekrar deneyin.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      
      let errorMessage = "İçerik fikirleri üretilirken bir hata oluştu";
      let errorTitle = "Hata";

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          errorTitle = "API Anahtarı Hatası";
          errorMessage = "Lütfen OpenAI API anahtarınızı kontrol edin";
        } else if (error.message.includes("rate limit")) {
          errorTitle = "Hız Sınırı";
          errorMessage = "Çok fazla istek gönderildi. Lütfen biraz bekleyin";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Blog konusunu girin..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1"
          />
          <Button 
            onClick={generateIdeas}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Üretiliyor...
              </>
            ) : (
              "Fikir Üret"
            )}
          </Button>
        </div>

        {results && (
          <>
            <div className="flex justify-end">
              <Button
                onClick={handleGeneratePDF}
                variant="outline"
                className="mb-4"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF İndir
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* GPT-4 Önerileri */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Öneriler 1</h3>
                  <div className="space-y-4">
                    {results.gpt4Ideas.map((idea, index) => (
                      <div key={index} className="p-4 border rounded-lg group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(idea.title, idea.description)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <h4 className="font-medium text-primary pr-8">{idea.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* o1-mini Önerileri */}
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Öneriler 2</h3>
                  <div className="space-y-4">
                    {results.gptMiniIdeas.map((idea, index) => (
                      <div key={index} className="p-4 border rounded-lg group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(idea.title, idea.description)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <h4 className="font-medium text-primary pr-8">{idea.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{idea.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <IdeaHistory ideas={ideas} onDelete={handleDeleteFromHistory} />
    </div>
  );
};

export default ContentIdeas;
