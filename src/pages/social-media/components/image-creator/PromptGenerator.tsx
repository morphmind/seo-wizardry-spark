import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { GeneratedPrompts } from "../../types";

interface PromptGeneratorProps {
  prompts: GeneratedPrompts;
  onGenerateImages: (promptId: string, promptText: string) => Promise<void>;
  loadingPromptId: string | null;
}

export function PromptGenerator({
  prompts,
  onGenerateImages,
  loadingPromptId
}: PromptGeneratorProps) {
  const withTextId = 'prompt-with-text';
  const withoutTextId = 'prompt-without-text';

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-4">
          {/* With Text Prompt */}
          <div className="space-y-2">
            <Label>Yazılı Prompt</Label>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{prompts.withText}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!loadingPromptId) {
                  onGenerateImages(withTextId, prompts.withText);
                }
              }}
              disabled={!!loadingPromptId || !prompts.withText}
            >
              {loadingPromptId === withTextId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Görseller Oluşturuluyor...
                </>
              ) : (
                "Üzerinde Yazı Olan Görseller Oluştur"
              )}
            </Button>
          </div>

          {/* Without Text Prompt */}
          <div className="space-y-2">
            <Label>Yazısız Prompt</Label>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{prompts.withoutText}</p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!loadingPromptId) {
                  onGenerateImages(withoutTextId, prompts.withoutText);
                }
              }}
              disabled={!!loadingPromptId || !prompts.withoutText}
            >
              {loadingPromptId === withoutTextId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Görseller Oluşturuluyor...
                </>
              ) : (
                "Sadece Görsel Oluştur"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
