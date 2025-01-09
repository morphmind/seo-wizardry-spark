import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ImageGeneratorProps {
  imageUrls: string[];
  onDownload: (url: string) => Promise<void>;
}

export function ImageGenerator({ imageUrls, onDownload }: ImageGeneratorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Generated image ${index + 1}`}
                className="w-full h-auto rounded-lg shadow-md"
                crossOrigin="anonymous"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.jpg';
                }}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                onClick={() => onDownload(url)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
