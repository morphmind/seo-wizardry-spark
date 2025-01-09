import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PlatformSelector } from "./PlatformSelector";
import { PromptGenerator } from "./PromptGenerator";
import { ImageGenerator } from "./ImageGenerator";
import { ImageHistory } from "./ImageHistory";
import { useImageCreator } from "../../hooks/useImageCreator";
import { Platform, Orientation } from "../../types";

export function ImageCreator() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [orientation, setOrientation] = useState<Orientation>("horizontal");
  const [topic, setTopic] = useState("");
  const { toast } = useToast();
  const { 
    loading,
    loadingPromptId,
    prompts,
    imageUrls,
    generatePrompts,
    generateImages,
    downloadImage,
    history,
    deleteFromHistory
  } = useImageCreator();

  const handleGeneratePrompts = async () => {
    if (!topic.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir konu girin",
        variant: "destructive"
      });
      return;
    }

    await generatePrompts(platform, orientation, topic);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <PlatformSelector
            platform={platform}
            orientation={orientation}
            onPlatformChange={setPlatform}
            onOrientationChange={setOrientation}
            topic={topic}
            onTopicChange={setTopic}
            onSubmit={handleGeneratePrompts}
            loading={loading}
          />
        </CardContent>
      </Card>

      {prompts && (
        <PromptGenerator
          prompts={prompts}
          onGenerateImages={generateImages}
          loadingPromptId={loadingPromptId}
        />
      )}

      {imageUrls.length > 0 && (
        <ImageGenerator
          imageUrls={imageUrls}
          onDownload={downloadImage}
        />
      )}

      <ImageHistory
        history={history}
        onDelete={deleteFromHistory}
      />
    </div>
  );
}
