import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Download, ChevronDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { HistoryItem, GeneratedImage } from "../../types";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface ImageHistoryProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
}

export function ImageHistory({ history, onDelete }: ImageHistoryProps) {
  const { toast } = useToast();

  const downloadImage = async (url: string, topic: string) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit'
      });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const safeFileName = topic.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const timestamp = Date.now();
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${safeFileName}-${timestamp}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);

      toast({
        description: "Görsel başarıyla indirildi"
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Görsel indirilemedi",
        variant: "destructive"
      });
    }
  };

  if (!history || history.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Görsel Geçmişi</h3>
      <Accordion type="multiple" className="space-y-4">
        {history.map((item) => (
          <AccordionItem 
            value={item.id} 
            key={item.id} 
            className={cn(
              "border rounded-lg px-4",
              "data-[state=open]:bg-accent/30"
            )}
          >
            <AccordionTrigger 
              className="w-full hover:no-underline py-2 [&>svg]:hidden group"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex flex-col items-start">
                  <h4 className="font-medium text-left group-hover:text-accent-foreground">{item.topic}</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: tr })}
                  </p>
                </div>
                <div className="flex items-center">
                  <ChevronDown className="w-4 h-4 mr-4 transition-transform duration-200 shrink-0" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-6">
              <div className="grid grid-cols-2 gap-4">
                {item.images && item.images.map((image: GeneratedImage) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`${item.topic} görseli`}
                      className="w-full h-auto rounded-lg"
                      crossOrigin="anonymous"
                    />
                    <Button
                      onClick={() => downloadImage(image.url, item.topic)}
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      variant="secondary"
                      size="icon"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
}
