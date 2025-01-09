import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Info } from "lucide-react";
import { GeneratedContent, Provider, Model } from "@/types/content";
import { generateSEOPrompt, generateFAQPrompt, parseAIResponse } from "@/utils/prompts";
import ModelSelector from "./ModelSelector";
import ContentDisplay from "./ContentDisplay";
import ContentIdeas from "./ContentIdeas";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";

const NavButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      "flex-1 px-6 py-2.5 text-sm font-medium rounded-md transition-all",
      "hover:bg-[rgb(186,73,73)]/20",
      active ? "bg-[rgb(186,73,73)] text-white shadow-sm" : "bg-accent/30"
    )}
  >
    {children}
  </button>
);

const LanguageButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    type="button"
    className={cn(
      "min-w-[40px] h-8 text-sm font-medium rounded transition-all border",
      "hover:border-[rgb(186,73,73)] hover:text-[rgb(186,73,73)]",
      active ? "bg-[rgb(186,73,73)] text-white border-[rgb(186,73,73)]" : "border-border"
    )}
  >
    {children}
  </button>
);

const ContentGenerator = () => {
  const [inputTitle, setInputTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState<Model>("gpt-4o-mini");
  const [inputLanguage, setInputLanguage] = useState<"tr" | "en">("tr");
  const [outputLanguage, setOutputLanguage] = useState<"tr" | "en">("tr");
  const [includeFAQ, setIncludeFAQ] = useState(false);
  const [activeTab, setActiveTab] = useState<"generator" | "ideas">("generator");
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!inputTitle.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir başlık girin",
        variant: "destructive",
      });
      return;
    }

    const apiKey = provider === "openai" 
      ? localStorage.getItem("openai_api_key")
      : localStorage.getItem("anthropic_api_key");

    if (!apiKey) {
      toast({
        title: "Hata",
        description: `Lütfen ${provider === "openai" ? "OpenAI" : "Anthropic"} API anahtarınızı ayarlarda belirtin`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const seoPrompt = generateSEOPrompt(inputTitle, inputLanguage, outputLanguage);
      const faqPrompt = includeFAQ ? generateFAQPrompt(inputTitle, inputLanguage, outputLanguage, "text") : null;
      
      const prompts = [
        {
          role: "system",
          content: "You are an SEO expert. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: seoPrompt
        }
      ];

      if (faqPrompt) {
        prompts.push({
          role: "user",
          content: faqPrompt
        });
      }

      if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: model,
            messages: prompts,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "İçerik oluşturulamadı");
        }

        const data = await response.json();
        const generatedContent = parseAIResponse(data.choices[0].message.content, includeFAQ);
        setContent(generatedContent);
      } else {
        toast({
          title: "Bilgi",
          description: "Anthropic API entegrasyonu yakında gelecek",
        });
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "İçerik oluşturulamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-accent/10">
        <div className="flex gap-2">
          <NavButton
            active={activeTab === "generator"}
            onClick={() => setActiveTab("generator")}
          >
            SEO Optimizasyonu
          </NavButton>
          <NavButton
            active={activeTab === "ideas"}
            onClick={() => setActiveTab("ideas")}
          >
            Content Ideas
          </NavButton>
        </div>
      </Card>

      {activeTab === "generator" ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <ModelSelector 
              provider={provider}
              model={model}
              onProviderChange={setProvider}
              onModelChange={setModel}
            />
            
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Giriş Dili:</Label>
                  <div className="flex gap-1">
                    <LanguageButton
                      active={inputLanguage === "tr"}
                      onClick={() => setInputLanguage("tr")}
                    >
                      TR
                    </LanguageButton>
                    <LanguageButton
                      active={inputLanguage === "en"}
                      onClick={() => setInputLanguage("en")}
                    >
                      EN
                    </LanguageButton>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">Çıkış Dili:</Label>
                  <div className="flex gap-1">
                    <LanguageButton
                      active={outputLanguage === "tr"}
                      onClick={() => setOutputLanguage("tr")}
                    >
                      TR
                    </LanguageButton>
                    <LanguageButton
                      active={outputLanguage === "en"}
                      onClick={() => setOutputLanguage("en")}
                    >
                      EN
                    </LanguageButton>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <Label htmlFor="faq-mode" className="text-sm cursor-pointer">FAQ</Label>
                  <Switch
                    id="faq-mode"
                    checked={includeFAQ}
                    onCheckedChange={setIncludeFAQ}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Etkinleştirildiğinde başlık ile alakalı FAQ bölümü içeriği oluşturulacaktır</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Makale Başlığı</Label>
                <Input
                  placeholder={`Başlığı ${inputLanguage === "tr" ? "Türkçe" : "İngilizce"} girin`}
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                />
                <Button 
                  className="w-full bg-[rgb(186,73,73)] hover:bg-[rgb(186,73,73)]/90"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      İçerik Oluşturuluyor...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      İçerik Oluştur
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {content && <ContentDisplay content={content} includeFAQ={includeFAQ} />}
        </div>
      ) : (
        <ContentIdeas />
      )}
    </div>
  );
};

export default ContentGenerator;
