import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ArticleInput from "./ArticleInput";
import FileUploader from "./FileUploader";
import LinkingMethodSelector from "./LinkingMethodSelector";
import ProcessButton from "./ProcessButton";
import LinkReport from "./LinkReport";
import { PresetManager } from "./PresetManager";
import { useContentProcessor } from "./useContentProcessor";
import { ProcessedLink } from "./types";

const InternalLinkGenerator = () => {
  const [content, setContent] = useState("");
  const [processedLinks, setProcessedLinks] = useState<ProcessedLink[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<"manual" | "auto">("manual");
  const { processContent, isProcessing, error } = useContentProcessor();

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleFileUpload = (fileContent: string) => {
    setContent(fileContent);
  };

  const handleProcess = async () => {
    if (!content.trim()) return;

    try {
      const result = await processContent(content);
      setProcessedLinks(result.links);
    } catch (err) {
      console.error("Processing error:", err);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <LinkingMethodSelector
            selectedMethod={selectedMethod}
            onMethodChange={setSelectedMethod}
          />
          
          <ArticleInput
            content={content}
            onContentChange={handleContentChange}
          />
          
          <FileUploader onFileUpload={handleFileUpload} />
          
          <PresetManager />
          
          <ProcessButton
            onProcess={handleProcess}
            isProcessing={isProcessing}
            disabled={!content.trim()}
          />
          
          {error && (
            <div className="text-red-500 mt-2">
              {error}
            </div>
          )}
        </div>
      </Card>

      {processedLinks.length > 0 && (
        <LinkReport links={processedLinks} />
      )}
    </div>
  );
};

export default InternalLinkGenerator;