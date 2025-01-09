import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { format } from "date-fns";
import jsPDF from 'jspdf';
import { ReelsIdea, ReelsIdeaGroup } from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface IdeaHistoryProps {
  ideas: ReelsIdea[];
  onDelete: (id: string) => void;
}

export function IdeaHistory({ ideas, onDelete }: IdeaHistoryProps) {
  const [openIdeaId, setOpenIdeaId] = useState<string | null>(null);
  const { toast } = useToast();

  // Her fikri kendi başlığı altında grupla
  const groupedIdeas = useMemo(() => {
    const groupsMap = new Map<string, ReelsIdeaGroup>();

    // Her fikri topic'e göre grupla
    ideas.forEach(idea => {
      const topic = idea.topic || 'Başlıksız Fikir';
      
      if (!groupsMap.has(topic)) {
        groupsMap.set(topic, {
          id: crypto.randomUUID(),
          topic, 
          createdAt: idea.createdAt,
          normalIdeas: [],
          viralIdeas: []
        });
      }

      const group = groupsMap.get(topic)!;
      if (idea.type === 'normal') {
        group.normalIdeas.push(idea);
      } else {
        group.viralIdeas.push(idea);
      }
    });

    return Array.from(groupsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [ideas]);

  const handleCopy = async (idea: ReelsIdea) => {
    try {
      const text = `${idea.title}\n\n${idea.scenes.map(scene => 
        `Sahne: ${scene.duration}\n${scene.description}\nÇekim: ${scene.cameraAngle}\nYazı: ${scene.textOverlay}\n`
      ).join('\n')}`;
      
      await navigator.clipboard.writeText(text);
      toast({
        description: "İçerik kopyalandı",
      });
    } catch (err) {
      toast({
        title: "Hata",
        description: "Manuel olarak seçip kopyalayınız",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = (group: ReelsIdeaGroup) => {
    const pdf = new jsPDF();
    let yPos = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    const addIdeaSection = (idea: ReelsIdea, index: number) => {
      if (yPos > pageHeight - 40) {
        pdf.addPage();
        yPos = margin;
      }

      // Fikir başlığı
      pdf.setFontSize(14);
      pdf.text(`${idea.type === 'normal' ? 'Normal' : 'Viral'} Fikir ${index + 1}`, margin, yPos);
      yPos += lineHeight * 2;

      // Fikir detayları
      pdf.setFontSize(12);
      pdf.text(`Başlık: ${idea.title}`, margin, yPos);
      yPos += lineHeight;

      pdf.text(`Müzik: ${idea.music.title} - ${idea.music.artist}`, margin, yPos);
      yPos += lineHeight;

      pdf.text(`Süre: ${idea.duration}`, margin, yPos);
      yPos += lineHeight * 2;

      // Sahneler
      idea.scenes.forEach((scene, sceneIndex) => {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFont(undefined, 'bold');
        pdf.text(`Sahne ${sceneIndex + 1}:`, margin, yPos);
        yPos += lineHeight;

        pdf.setFont(undefined, 'normal');
        pdf.text(`Süre: ${scene.duration}`, margin + 5, yPos);
        yPos += lineHeight;

        const descLines = pdf.splitTextToSize(scene.description, pdf.internal.pageSize.width - margin * 2 - 5);
        pdf.text(descLines, margin + 5, yPos);
        yPos += lineHeight * descLines.length;

        pdf.text(`Çekim: ${scene.cameraAngle}`, margin + 5, yPos);
        yPos += lineHeight;

        pdf.text(`Yazı: ${scene.textOverlay}`, margin + 5, yPos);
        yPos += lineHeight * 2;
      });

      // Efektler ve geçişler
      pdf.text('Efektler:', margin, yPos);
      yPos += lineHeight;
      pdf.text(idea.effects.join(', '), margin + 5, yPos);
      yPos += lineHeight * 2;

      pdf.text('Geçişler:', margin, yPos);
      yPos += lineHeight;
      pdf.text(idea.transitions.join(', '), margin + 5, yPos);
      yPos += lineHeight * 2;

      // İpuçları
      pdf.text('İpuçları:', margin, yPos);
      yPos += lineHeight;
      idea.tips.forEach((tip, tipIndex) => {
        const tipLines = pdf.splitTextToSize(`${tipIndex + 1}. ${tip}`, pdf.internal.pageSize.width - margin * 2 - 5);
        pdf.text(tipLines, margin + 5, yPos);
        yPos += lineHeight * tipLines.length;
      });

      yPos += lineHeight * 2;
    };

    // PDF başlığı
    pdf.setFontSize(16);
    const date = new Date(group.createdAt);
    pdf.text(`Reels Fikirleri - ${format(date, "dd.MM.yyyy")}`, margin, yPos);
    yPos += lineHeight * 3;

    // Fikirleri yazdır
    group.normalIdeas.forEach((idea, index) => {
      addIdeaSection(idea, index);
    });

    group.viralIdeas.forEach((idea, index) => {
      addIdeaSection(idea, index);
    });

    // PDF'i kaydet
    const safeFileName = format(new Date(group.createdAt), "yyyy-MM-dd");
    pdf.save(`reels-fikirleri-${safeFileName}.pdf`);
    
    toast({
      description: "PDF başarıyla indirildi",
    });
  };
  const handleDelete = (id: string) => {
    if (window.confirm('Bu fikir grubunu silmek istediğinizden emin misiniz?')) {
      const group = groupedIdeas.find(g => g.id === id);
      if (group) {
        // Önce normal fikirleri sil
        for (const idea of group.normalIdeas) {
          onDelete(idea.id);
        }
        // Sonra viral fikirleri sil
        for (const idea of group.viralIdeas) {
          onDelete(idea.id);
        }
      }

      if (openIdeaId === id) {
        setOpenIdeaId(null);
      }
    }
  };

  // Tüm fikirleri silme fonksiyonu
  const handleDeleteAll = () => {
    if (window.confirm('Tüm fikir geçmişini silmek istediğinizden emin misiniz?')) {
      for (const group of groupedIdeas) {
        for (const idea of group.normalIdeas) {
          onDelete(idea.id);
        }
        for (const idea of group.viralIdeas) {
          onDelete(idea.id);
        }
      }
    }
  };

  if (groupedIdeas.length === 0) {
    return null;
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Fikir Geçmişi ({groupedIdeas.length})</span>
          {groupedIdeas.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAll}
            >
              Tümünü Sil
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedIdeas.map((group) => (
          <Collapsible
            key={group.id}
            open={openIdeaId === group.id}
            onOpenChange={(isOpen) => setOpenIdeaId(isOpen ? group.id : null)}
          >
            <div className="flex items-center justify-between p-4 border rounded-lg mb-2 bg-card">
              <div>
                <h3 className="font-medium">{group.topic}</h3>
                  <div className="text-sm text-muted-foreground">
                  {format(new Date(group.createdAt), "dd MMMM yyyy")} - {' '}
                  <span className="space-x-2">
                    <Badge variant="secondary">{group.normalIdeas.length} Normal</Badge>
                    <Badge variant="outline" className="bg-red-500">{group.viralIdeas.length} Viral</Badge>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(group)}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(group.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {openIdeaId === group.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent>
              <div className="p-4 border-x border-b rounded-b-lg bg-card">
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
                  
                  <TabsContent value="normal" className="mt-4 space-y-4">
                    {group.normalIdeas.map((idea, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">{idea.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(idea)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Müzik: {idea.music.title} - {idea.music.artist}</p>
                            <p>Süre: {idea.duration}</p>
                          </div>
                          
                          <div className="space-y-3">
                            {idea.scenes.map((scene, sceneIndex) => (
                              <div key={sceneIndex} className="bg-muted p-3 rounded-lg">
                                <p className="text-sm font-medium mb-2">
                                  Sahne {sceneIndex + 1} ({scene.duration})
                                </p>
                                <p className="text-sm mb-2">{scene.description}</p>
                                <div className="text-sm text-muted-foreground">
                                  <p>Çekim: {scene.cameraAngle}</p>
                                  <p>Yazı: {scene.textOverlay}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Efektler:</h5>
                              <div className="flex flex-wrap gap-1">
                                {idea.effects.map((effect, effectIndex) => (
                                  <Badge key={effectIndex} variant="outline">{effect}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Geçişler:</h5>
                              <div className="flex flex-wrap gap-1">
                                {idea.transitions.map((transition, transitionIndex) => (
                                  <Badge key={transitionIndex} variant="secondary">{transition}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">İpuçları:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {idea.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-sm text-muted-foreground">
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="viral" className="mt-4 space-y-4">
                    {group.viralIdeas.map((idea, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">{idea.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(idea)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Müzik: {idea.music.title} - {idea.music.artist}</p>
                            <p>Süre: {idea.duration}</p>
                          </div>
                          
                          <div className="space-y-3">
                            {idea.scenes.map((scene, sceneIndex) => (
                              <div key={sceneIndex} className="bg-muted p-3 rounded-lg">
                                <p className="text-sm font-medium mb-2">
                                  Sahne {sceneIndex + 1} ({scene.duration})
                                </p>
                                <p className="text-sm mb-2">{scene.description}</p>
                                <div className="text-sm text-muted-foreground">
                                  <p>Çekim: {scene.cameraAngle}</p>
                                  <p>Yazı: {scene.textOverlay}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Efektler:</h5>
                              <div className="flex flex-wrap gap-1">
                                {idea.effects.map((effect, effectIndex) => (
                                  <Badge key={effectIndex} variant="outline">{effect}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Geçişler:</h5>
                              <div className="flex flex-wrap gap-1">
                                {idea.transitions.map((transition, transitionIndex) => (
                                  <Badge key={transitionIndex} variant="secondary">{transition}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">İpuçları:</h5>
                            <ul className="list-disc list-inside space-y-1">
                              {idea.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-sm text-muted-foreground">
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </CardContent>
    </Card>
  );
}
