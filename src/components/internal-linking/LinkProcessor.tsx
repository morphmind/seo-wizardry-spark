import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import FileUploader from "./FileUploader";
import LinkingMethodSelector from "./LinkingMethodSelector";
import ArticleInput from "./ArticleInput";
import ProcessButton from "./ProcessButton";
import LinkReport from "./LinkReport";
import { PresetManager } from "./PresetManager";
import { useContentProcessor, ProcessedLink } from "./LinkProcessor";

const InternalLinkGenerator = () => {
  const [urlDatabase, setUrlDatabase] = useState<File | null>(null);
  const [articleContent, setArticleContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [linkingMethod, setLinkingMethod] = useState<"manual" | "auto">("manual");
  const [manualLinkCount, setManualLinkCount] = useState("3");
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [progress, setProgress] = useState(0);

  const { processContent } = useContentProcessor();

  const handleProcess = async () => {
    setIsProcessing(true);
    setProgress(0);

    await processContent({
      urlDatabase,
      articleContent,
      linkingMethod,
      manualLinkCount,
      onProcessComplete: (links, content) => {
        setProcessedLinks(links);
        setProcessedContent(content);
        setIsProcessing(false);
      },
      onProgress: setProgress,
    });
  };

  const handleLoadPreset = async (preset: {
    urlDatabase: string;
    linkingMethod: "manual" | "auto";
    manualLinkCount: string;
  }) => {
    // URL database'i File nesnesine dönüştür
    const blob = new Blob([preset.urlDatabase], { type: 'application/json' });
    const file = new File([blob], 'preset-database.json', { type: 'application/json' });
    
    setUrlDatabase(file);
    setLinkingMethod(preset.linkingMethod);
    setManualLinkCount(preset.manualLinkCount);
  };

  const handleSavePreset = () => {
    return {
      urlDatabase,
      linkingMethod,
      manualLinkCount,
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <PresetManager
                onLoad={handleLoadPreset}
                onSave={handleSavePreset}
                urlDatabase={urlDatabase}
                linkingMethod={linkingMethod}
                manualLinkCount={manualLinkCount}
              />
            </div>

            <FileUploader 
              onFileUpload={setUrlDatabase}
              urlDatabase={urlDatabase}
            />

            <LinkingMethodSelector
              linkingMethod={linkingMethod}
              manualLinkCount={manualLinkCount}
              onMethodChange={setLinkingMethod}
              onCountChange={setManualLinkCount}
            />

            <ArticleInput
              value={articleContent}
              onChange={setArticleContent}
            />

            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  İşleniyor... ({progress}%)
                </p>
              </div>
            )}

            <ProcessButton
              onClick={handleProcess}
              isProcessing={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      {processedLinks.length > 0 && (
        <LinkReport links={processedLinks} content={processedContent} />
      )}
    </div>
  );
};

export default InternalLinkGenerator;