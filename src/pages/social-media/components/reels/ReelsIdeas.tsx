import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useSocialMedia } from "../../hooks/useSocialMedia";
import { useToast } from "@/hooks/use-toast";
import { ReelsIdeaCard } from "./ReelsIdeaCard";
import { IdeaHistory } from "../IdeaHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loadingStates = [
  "Konu analiz ediliyor...",
  "Trend araştırması yapılıyor...",
  "Reels fikirleri oluşturuluyor...",
  "Son rötuşlar yapılıyor..."
];

export function ReelsIdeas() {
  const [topic, setTopic] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentLoadingStep, setCurrentLoadingStep] = useState(0);
  const { loading, generateIdeas, ideas, ideaHistory, deleteIdea } = useSocialMedia();
  const { toast } = useToast();

  const handleGenerate = async () => {
    setProgress(0);
    setCurrentLoadingStep(0);
    
    if (!topic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 0.5;
        const step = Math.floor(newProgress / (100 / loadingStates.length));
        if (step !== currentLoadingStep) {
          setCurrentLoadingStep(step);
        }

        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    try {
      await generateIdeas("instagram_reels", topic);
    } finally {
      clearInterval(progressInterval);
      setProgress(100);
    }
  };

  // Fikirleri normal ve viral olarak ayır
  const normalIdeas = ideas.filter(idea => idea.type === "normal");
  const viralIdeas = ideas.filter(idea => idea.type === "viral");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Reels konusunu girin..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleGenerate}
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

      {loading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <p className="text-sm text-center text-muted-foreground">
            <span className="inline-block min-w-[3ch] text-right">{Math.round(progress)}%</span>
            {" - "}
            <span className="animate-pulse">
              {loadingStates[Math.min(currentLoadingStep, loadingStates.length - 1)]}
            </span>
          </p>
        </div>
      )}

      {ideas.length > 0 && (
        <Tabs defaultValue="normal" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="normal">Normal</TabsTrigger>
            <TabsTrigger 
              value="viral" 
              className="transition-all duration-300 text-muted-foreground hover:text-foreground data-[state=active]:text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500"
            >
              Viral
            </TabsTrigger>
          </TabsList>
          <TabsContent value="normal" className="mt-4">
            <div className="grid gap-6">
              {normalIdeas.map((idea) => (
                <ReelsIdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="viral" className="mt-4">
            <div className="grid gap-6">
              {viralIdeas.map((idea) => (
                <ReelsIdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Fikir Geçmişi */}
      <div className="mt-auto">
        <IdeaHistory ideas={ideaHistory} onDelete={deleteIdea} />
      </div>
    </div>
  );
}
