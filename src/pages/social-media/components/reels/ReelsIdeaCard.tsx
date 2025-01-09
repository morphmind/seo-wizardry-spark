import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Music, Camera, Clock, Wand2 } from "lucide-react";
import { ReelsIdea } from "../../types";
import { useToast } from "@/hooks/use-toast";

interface ReelsIdeaCardProps {
  idea: ReelsIdea;
}

export function ReelsIdeaCard({ idea }: ReelsIdeaCardProps) {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Kopyalandı!"
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{idea.title}</h3>
            <Badge variant={idea.type === "normal" ? "secondary" : "destructive"}>
              {idea.type === "normal" ? "Normal" : "Viral"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => copyToClipboard(idea.title)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{idea.duration}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Music className="h-4 w-4" />
            <span>{idea.music.title} - {idea.music.artist}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Sahneler</h4>
          {idea.scenes.map((scene, index) => (
            <div key={index} className="space-y-2 p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">{scene.duration}</span>
                <Camera className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm">{scene.description}</p>
              <div className="text-sm text-muted-foreground">
                <strong>Çekim:</strong> {scene.cameraAngle}
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Yazı:</strong> {scene.textOverlay}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h4 className="font-medium flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Efektler ve Geçişler
          </h4>
          <div className="flex flex-wrap gap-2">
            {idea.effects.map((effect, index) => (
              <Badge key={`effect-${index}`} variant="outline">
                {effect}
              </Badge>
            ))}
            {idea.transitions.map((transition, index) => (
              <Badge key={`transition-${index}`} variant="secondary">
                {transition}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">İpuçları</h4>
          <ul className="list-disc list-inside space-y-1">
            {idea.tips.map((tip, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
