import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContentDisplayProps {
  content: {
    title: string;
    permalink: string;
    metaDescription: string;
    faq?: {
      questions: Array<{
        question: string;
        answer: string;
      }>;
      schema: {
        "@context": string;
        "@type": string;
        mainEntity: Array<{
          "@type": string;
          name: string;
          acceptedAnswer: {
            "@type": string;
            text: string;
          };
        }>;
      };
    };
  } | null;
  includeFAQ: boolean;
}

const ContentDisplay = ({ content, includeFAQ }: ContentDisplayProps) => {
  const { toast } = useToast();

  if (!content) return null;

  const copyToClipboard = (text: string) => {
    try {
      // Geçici bir div elementi oluştur
      const el = document.createElement('div');
      el.setAttribute('contenteditable', 'true');
      el.innerHTML = text;
      el.style.position = 'fixed';
      el.style.left = '-9999px';
      document.body.appendChild(el);

      // Metni seç
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }

      // Kopyala
      try {
        document.execCommand('copy');
        toast({
          description: "İçerik kopyalandı",
        });
      } catch (err) {
        console.error('ExecCommand Copy failed:', err);
        // Alternatif yöntem
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          description: "İçerik kopyalandı",
        });
      }

      // Temizlik
      document.body.removeChild(el);
    } catch (error) {
      console.error('Kopyalama hatası:', error);
      toast({
        title: "Hata",
        description: "Manuel olarak seçip kopyalayınız",
        variant: "destructive"
      });
    }
  };

  const copyAllFAQs = () => {
    if (!content.faq) return;
    
    const allFAQs = `<h2>Sıkça Sorulan Sorular</h2>\n\n${content.faq.questions.map((item) => (
      `<h3><strong>${item.question}</strong></h3>\n${item.answer}\n\n`
    )).join('')}`;
    
    copyToClipboard(allFAQs.trim());
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>SEO Title ({content.title.length}/55 characters)</Label>
              <div className="relative">
                <Input value={content.title} readOnly />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => copyToClipboard(content.title)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Permalink</Label>
              <div className="relative">
                <Input value={content.permalink} readOnly />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => copyToClipboard(content.permalink)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label>Meta Description ({content.metaDescription.length}/155 characters)</Label>
              <div className="relative">
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background text-foreground"
                  value={content.metaDescription}
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-8"
                  onClick={() => copyToClipboard(content.metaDescription)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {includeFAQ && content.faq && (
        <div className="space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Normal FAQ</TabsTrigger>
              <TabsTrigger value="schema">Schema FAQ</TabsTrigger>
            </TabsList>
            <TabsContent value="text">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={copyAllFAQs}
                    >
                      <Copy className="h-4 w-4" />
                      Hepsini Kopyala
                    </Button>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {content.faq.questions.map((item, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex justify-between items-center w-full pr-4">
                            <span>{item.question}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(`<h3><strong>${item.question}</strong></h3>\n${item.answer}`);
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="whitespace-pre-wrap">{item.answer}</div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="schema">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <Label>FAQ Schema Markup</Label>
                    <div className="relative">
                      <textarea
                        className="w-full min-h-[300px] p-3 rounded-md border bg-background text-foreground font-mono text-sm"
                        value={JSON.stringify(content.faq.schema, null, 2)}
                        readOnly
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => copyToClipboard(JSON.stringify(content.faq.schema, null, 2))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;
