import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ArticleHistory } from "../types";
import DOMPurify from 'dompurify';

interface ArticleOutputProps {
  articleId: string | null;
  apiKey: string;
  onClose: () => void;
  onSaveToHistory: (article: ArticleHistory) => void;
}

interface ArticleResponse {
  status: "queued" | "processing" | "finished" | "failed";
  statusDetail: string;
  progress: number;
  config?: {
    targetKeyword?: string;
  };
  output?: {
    html: string;
    polishedHtml: string | null;
  };
  error?: string;
}

export function ArticleOutput({ articleId, apiKey, onClose, onSaveToHistory }: ArticleOutputProps) {
  const [article, setArticle] = useState<ArticleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState<string | null>(null);
  const { toast } = useToast();

  const extractTitle = useCallback((html: string): string => {
    const match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    return match ? match[1].replace(/<[^>]*>/g, '') : "Untitled Article";
  }, []);

  const processHTML = useCallback((html: string): string => {
    let processedHtml = DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'loading']
    });

    processedHtml = processedHtml.replace(
      /<img(.*?)src="(https:\/\/koala\.sh\/.*?)"(.*?)>/gi,
      `<div class="relative group">
        <img$1src="$2"$3>
        <button
          class="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onclick="window.uploadToGoogleDrive('$2', this.previousElementSibling)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </button>
      </div>`
    );

    if (typeof window !== 'undefined') {
      (window as any).uploadToGoogleDrive = uploadToGoogleDrive;
    }

    return processedHtml;
  }, []);

  const uploadToGoogleDrive = async (imageUrl: string, imageElement: HTMLImageElement) => {
    const googleDriveApiKey = localStorage.getItem("google_drive_api_key");
    if (!googleDriveApiKey) {
      toast({
        title: "Error",
        description: "Please set your Google Drive API key in settings",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');

      const uploadResponse = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleDriveApiKey}`,
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to Google Drive');
      }

      const uploadResult = await uploadResponse.json();
      
      const shareResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${uploadResult.id}?fields=webContentLink`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${googleDriveApiKey}`,
        }
      });

      if (!shareResponse.ok) {
        throw new Error('Failed to get share link');
      }

      const shareResult = await shareResponse.json();
      imageElement.src = shareResult.webContentLink;
      
      toast({
        title: "Success",
        description: "Image successfully backed up to Google Drive",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload image to Google Drive",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!articleId || isSaved === articleId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://koala.sh/api/articles/${articleId}`, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setArticle(data);

        if (data.status === "finished" && isSaved !== articleId && data.output?.html) {
          const processedHtml = processHTML(data.output.html);
          const newArticle: ArticleHistory = {
            id: articleId,
            title: extractTitle(processedHtml),
            date: new Date().toISOString(),
            html: processedHtml,
            keyword: data.config?.targetKeyword || ""
          };

          onSaveToHistory(newArticle);
          setIsSaved(articleId);
          setLoading(false);
        } else if (data.status === "failed") {
          setLoading(false);
        } else if (data.status === "processing" || data.status === "queued") {
          setTimeout(checkStatus, 60000);
        }
      } catch (error) {
        console.error("Error checking article status:", error);
        toast({
          title: "Error",
          description: "Failed to check article status. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    checkStatus();
  }, [articleId, apiKey, toast, onSaveToHistory, extractTitle, processHTML, isSaved]);

  const handleCopy = async () => {
    if (!article?.output?.html) return;
    try {
      await navigator.clipboard.writeText(article.output.html);
      toast({
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!article?.output?.html) return;
    const blob = new Blob([article.output.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!article) return null;

  return (
    <Card className="mt-8 w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Article Status</CardTitle>
        {article.status === "finished" && (
          <div className="flex gap-2">
            <Button onClick={handleCopy} size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>
              {article.statusDetail} ({Math.round(article.progress * 100)}%)
            </span>
          </div>
        ) : article.status === "finished" ? (
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: processHTML(article.output?.html || "") 
              }}
              className="article-content"
            />
          </div>
        ) : (
          <div className="text-red-500">
            Error: {article.error || "Failed to generate article"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}